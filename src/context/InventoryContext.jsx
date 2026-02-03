import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGame } from './GameContext';
import { ITEM_REGISTRY, ITEM_TYPES } from '../data/ItemRegistry';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Manage Slot System & Overhead Calculation
 */

export const InventoryContext = createContext();

const initialState = {
    slots: {
        active: [null, null], // 2 Slots
        passive: [null, null], // 2 Slots
        relay: [null] // 1 Echo Slot
    },
    hardware: {
        bus: null,
        core: null,
        io: null
    },
    backpack: [], // Grid for Trinkets/Consumables
    overhead: 0 // Percentage (0-100)
};

const ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    EQUIP_ITEM: 'EQUIP_ITEM',
    UNEQUIP_ITEM: 'UNEQUIP_ITEM',
    CALC_OVERHEAD: 'CALC_OVERHEAD'
};

function inventoryReducer(state, action) {
    switch (action.type) {
        case ACTIONS.ADD_ITEM: {
            const { itemId, itemObj } = action.payload; // Support direct object
            const item = itemObj || ITEM_REGISTRY[itemId];
            if (!item) return state;

            // Simplification: Always add to backpack first
            return {
                ...state,
                backpack: [...state.backpack, item] // Store full item obj for ease
            };
        }

        case ACTIONS.REMOVE_ITEM: {
            const { item } = action.payload;
            // Remove first instance of item by ID (or specific reference if possible)
            // Using ID is safer for now if instances aren't unique objects
            const index = state.backpack.findIndex(i => i.id === item.id);
            if (index === -1) return state;

            const newBackpack = [...state.backpack];
            newBackpack.splice(index, 1);
            return { ...state, backpack: newBackpack };
        }

        case ACTIONS.EQUIP_ITEM: {
            const { item, slotIndex, targetType } = action.payload;

            // Logic to move from backpack to slot
            const newBackpack = state.backpack.filter(i => i.id !== item.id);

            let newSlots = { ...state.slots };
            let newHardware = { ...state.hardware };

            if (targetType === 'passive') newSlots.passive[slotIndex] = item;
            // Active removed (handled by GameContext)
            if (targetType === 'hardware') {
                if (item.type === ITEM_TYPES.HARDWARE_BUS) newHardware.bus = item;
                if (item.type === ITEM_TYPES.HARDWARE_CORE) newHardware.core = item;
                if (item.type === ITEM_TYPES.HARDWARE_IO) newHardware.io = item;
            }

            return {
                ...state,
                backpack: newBackpack,
                slots: newSlots,
                hardware: newHardware
            };
        }

        case ACTIONS.CALC_OVERHEAD: {
            // Calculate total weight of non-equipped items
            // For now, only Trinkets cause overhead
            const trinketCount = state.backpack.filter(i => i.type === ITEM_TYPES.TRINKET).length;
            return {
                ...state,
                overhead: trinketCount * 1.0 // 1% per item
            };
        }

        default:
            return state;
    }
}

export const InventoryProvider = ({ children }) => {
    const [state, dispatch] = useReducer(inventoryReducer, initialState);

    // Auto-calc overhead whenever backpack changes
    const { gameState, setGameState } = useGame();

    useEffect(() => {
        dispatch({ type: ACTIONS.CALC_OVERHEAD });
    }, [state.backpack]);

    const addItem = (itemId) => {
        dispatch({ type: ACTIONS.ADD_ITEM, payload: { itemId } });
    };

    const equipItem = (item, targetType, slotIndex = 0) => {
        if (targetType === 'active') {
            const existing = gameState.inventorySlots[slotIndex];

            // 1. Remove new item from backpack
            dispatch({ type: ACTIONS.REMOVE_ITEM, payload: { item } });

            // 2. Add existing item back to backpack
            if (existing) {
                dispatch({ type: ACTIONS.ADD_ITEM, payload: { itemObj: existing } });
            }

            // 3. Update Slot
            setGameState(prev => {
                const newSlots = [...prev.inventorySlots];
                newSlots[slotIndex] = { ...item };
                return { ...prev, inventorySlots: newSlots };
            });
        } else {
            // Passive/Hardware handled internally
            dispatch({ type: ACTIONS.EQUIP_ITEM, payload: { item, targetType, slotIndex } });
        }
    };

    const unequipItem = (slotIndex) => {
        const item = gameState.inventorySlots[slotIndex];
        if (!item) return;

        // 1. Add to backpack
        dispatch({ type: ACTIONS.ADD_ITEM, payload: { itemObj: item } });

        // 2. Clear slot
        setGameState(prev => {
            const newSlots = [...prev.inventorySlots];
            newSlots[slotIndex] = null;
            return { ...prev, inventorySlots: newSlots };
        });
    };

    return (
        <InventoryContext.Provider value={{ state, addItem, equipItem, unequipItem }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => useContext(InventoryContext);
