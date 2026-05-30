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
    INIT_INVENTORY: 'INIT_INVENTORY',
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    EQUIP_ITEM: 'EQUIP_ITEM',
    UNEQUIP_ITEM: 'UNEQUIP_ITEM',
    CALC_OVERHEAD: 'CALC_OVERHEAD',
    RESTORE_INVENTORY: 'RESTORE_INVENTORY'
};

function inventoryReducer(state, action) {
    switch (action.type) {
        case ACTIONS.INIT_INVENTORY:
            return initialState;

        case ACTIONS.RESTORE_INVENTORY:
            return action.payload || initialState;


        case ACTIONS.ADD_ITEM: {
            const { itemId, itemObj } = action.payload; // Support direct object
            const baseItem = itemObj || ITEM_REGISTRY[itemId];
            if (!baseItem) return state;

            const existingIndex = state.backpack.findIndex(i => i.id === baseItem.id);
            const newBackpack = [...state.backpack];
            
            if (existingIndex !== -1) {
                // Item exists, increment quantity (cap at 999)
                const existingItem = newBackpack[existingIndex];
                newBackpack[existingIndex] = {
                    ...existingItem,
                    quantity: Math.min((existingItem.quantity || 1) + (baseItem.quantity || 1), 999)
                };
            } else {
                // New item, add to backpack
                newBackpack.push({
                    ...baseItem,
                    quantity: baseItem.quantity || 1
                });
            }

            return {
                ...state,
                backpack: newBackpack
            };
        }

        case ACTIONS.REMOVE_ITEM: {
            const { item, quantity = 1 } = action.payload;
            const index = state.backpack.findIndex(i => i.id === item.id);
            if (index === -1) return state;

            const newBackpack = [...state.backpack];
            const existingItem = newBackpack[index];
            const newQuantity = (existingItem.quantity || 1) - quantity;

            if (newQuantity <= 0) {
                newBackpack.splice(index, 1);
            } else {
                newBackpack[index] = { ...existingItem, quantity: newQuantity };
            }

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
            const trinketCount = state.backpack.reduce((sum, item) => {
                return item.type === ITEM_TYPES.TRINKET ? sum + (item.quantity || 1) : sum;
            }, 0);
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

    const initInventory = () => dispatch({ type: ACTIONS.INIT_INVENTORY });
    const loadInventoryState = (savedState) => dispatch({ type: ACTIONS.RESTORE_INVENTORY, payload: savedState });

    return (
        <InventoryContext.Provider value={{ state, addItem, equipItem, unequipItem, initInventory, loadInventoryState }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => useContext(InventoryContext);
