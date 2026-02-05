import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useGame } from './GameContext';
import { useInventory } from './InventoryContext';

/**
 * IDENTITY: LOGIC_BREACH_02 (The Engineer)
 * DIRECTIVE: Implement Hardware Resource System
 */

export const PlayerContext = createContext();

const initialState = {
    stats: {
        integrity: 100,      // Max HP
        currentIntegrity: 100,
        mRamMax: 110,        // Max Resource
        mRamCurrent: 110,
        clockSpeed: 5,       // % Base
        mRamRegenBase: 2.0,  // Standard
    },
    allocations: {
        integrity: 0,
        mRam: 0,
        clock: 0,
        regen: 0
    },
    bonuses: {
        integrity: 0,
        mRam: 0,
        clock: 0,
        regen: 0
    }
};

const ACTIONS = {
    INIT_SYSTEM: 'INIT_SYSTEM',
    LOCK_RESOURCE: 'LOCK_RESOURCE',
    TICK_SCRUB: 'TICK_SCRUB',
    TAKE_DAMAGE: 'TAKE_DAMAGE',
    HEAL: 'HEAL',
    RESTORE_RAM: 'RESTORE_RAM',
    UPGRADE_STAT: 'UPGRADE_STAT',
    APPLY_BONUS: 'APPLY_BONUS'
};

function playerReducer(state, action) {
    switch (action.type) {
        case ACTIONS.INIT_SYSTEM:
            return initialState;

        case ACTIONS.RESTORE_RAM: {
            const { amount } = action.payload;
            const newCurrent = Math.min(state.stats.mRamCurrent + amount, state.stats.mRamMax);
            return {
                ...state,
                stats: { ...state.stats, mRamCurrent: newCurrent }
            };
        }

        case ACTIONS.UPGRADE_STAT: {
            const { stat } = action.payload;
            const newAllocations = { ...state.allocations, [stat]: state.allocations[stat] + 1 };
            const newStats = { ...state.stats };
            const bonus = state.bonuses ? state.bonuses[stat] : 0;
            const totalLevels = newAllocations[stat] + bonus;

            if (stat === 'integrity') {
                newStats.integrity = 100 + (totalLevels * 10);
                newStats.currentIntegrity += 10;
            } else if (stat === 'mRam') {
                newStats.mRamMax = 110 + (totalLevels * 10);
                newStats.mRamCurrent += 10;
            } else if (stat === 'clock') {
                newStats.clockSpeed = 5 + (totalLevels * 1);
            } else if (stat === 'regen') {
                newStats.mRamRegenBase = 2.0 + (totalLevels * 0.1);
            }

            return {
                ...state,
                allocations: newAllocations,
                stats: newStats
            };
        }

        case ACTIONS.APPLY_BONUS: {
            const { stat, amount } = action.payload;
            const currentBonus = state.bonuses ? state.bonuses[stat] : 0;
            const newBonuses = { ...state.bonuses, [stat]: currentBonus + amount };
            const newStats = { ...state.stats };
            const totalLevels = state.allocations[stat] + newBonuses[stat];

            if (stat === 'integrity') {
                newStats.integrity = 100 + (totalLevels * 10);
                newStats.currentIntegrity += (amount * 10);
            } else if (stat === 'mRam') {
                newStats.mRamMax = 110 + (totalLevels * 10);
                newStats.mRamCurrent += (amount * 10);
            } else if (stat === 'clock') {
                newStats.clockSpeed = 5 + (totalLevels * 1);
            } else if (stat === 'regen') {
                newStats.mRamRegenBase = 2.0 + (totalLevels * 0.1);
            }

            return {
                ...state,
                bonuses: newBonuses,
                stats: newStats
            };
        }

        case ACTIONS.LOCK_RESOURCE: {
            const { cost } = action.payload;
            // Reducer-side safety check to prevent negative RAM from race conditions
            if (state.stats.mRamCurrent < cost) return state;

            return {
                ...state,
                stats: { ...state.stats, mRamCurrent: state.stats.mRamCurrent - cost }
            };
        }

        case ACTIONS.TICK_SCRUB: {
            const { delta, scrubRate, mRamMax } = action.payload;
            const recovered = scrubRate * delta;
            const newCurrent = Math.min(state.stats.mRamCurrent + recovered, mRamMax);
            return {
                ...state,
                stats: { ...state.stats, mRamCurrent: newCurrent }
            };
        }

        case ACTIONS.TAKE_DAMAGE: {
            const { amount } = action.payload;
            return {
                ...state,
                stats: { ...state.stats, currentIntegrity: Math.max(0, state.stats.currentIntegrity - amount) }
            };
        }

        case ACTIONS.HEAL: {
            const { amount, maxIntegrity } = action.payload;
            return {
                ...state,
                stats: { ...state.stats, currentIntegrity: Math.min(maxIntegrity, state.stats.currentIntegrity + amount) }
            };
        }

        default:
            return state;
    }
}

export const PlayerProvider = ({ children }) => {
    const [state, dispatch] = useReducer(playerReducer, initialState);
    const { state: invState } = useInventory();
    const { checkPersistence } = useGame();

    // DYNAMIC HARDWARE BONUSES
    const hardwareBonuses = useMemo(() => {
        const bonus = { clock: 0, regen: 0, integrity: 0, mRam: 0 };
        if (!invState.hardware) return bonus;

        Object.values(invState.hardware).forEach(item => {
            if (!item || !item.stats) return;
            if (item.stats.clockSpeed) bonus.clock += item.stats.clockSpeed;
            if (item.stats.scrubSpeed) bonus.regen += item.stats.scrubSpeed;
            if (item.stats.integrity) bonus.integrity += item.stats.integrity;
            if (item.stats.mRamMax) bonus.mRam += item.stats.mRamMax;
        });
        return bonus;
    }, [invState.hardware]);

    // DERIVED EFFECTIVE STATS
    const effectiveStats = useMemo(() => ({
        integrity: state.stats.integrity + hardwareBonuses.integrity,
        mRamMax: state.stats.mRamMax + hardwareBonuses.mRam,
        clockSpeed: state.stats.clockSpeed + hardwareBonuses.clock,
        mRamRegenBase: state.stats.mRamRegenBase + hardwareBonuses.regen
    }), [state.stats, hardwareBonuses]);

    // The System Scrub Ticker
    useEffect(() => {
        const ticker = setInterval(() => {
            if (state.stats.mRamCurrent < effectiveStats.mRamMax) {
                const speedFactor = effectiveStats.clockSpeed / 100;
                const scrubRate = effectiveStats.mRamRegenBase * (1 + speedFactor);
                dispatch({
                    type: ACTIONS.TICK_SCRUB,
                    payload: { delta: 0.1, scrubRate, mRamMax: effectiveStats.mRamMax }
                });
            }
        }, 100);
        return () => clearInterval(ticker);
    }, [state.stats.mRamCurrent, effectiveStats]);

    const lockResource = (cost) => {
        if (state.stats.mRamCurrent >= cost) {
            dispatch({ type: ACTIONS.LOCK_RESOURCE, payload: { cost } });
            return true;
        }
        return false;
    };

    const damageKernel = (amount) => {
        dispatch({ type: ACTIONS.TAKE_DAMAGE, payload: { amount } });
        const resultingIntegrity = state.stats.currentIntegrity - amount;
        if (resultingIntegrity <= 0) {
            checkPersistence(resultingIntegrity);
            dispatch({ type: ACTIONS.INIT_SYSTEM });
        }
    };

    const healKernel = (amount) => {
        dispatch({ type: ACTIONS.HEAL, payload: { amount, maxIntegrity: effectiveStats.integrity } });
    };

    const restoreRam = (amount) => {
        dispatch({ type: ACTIONS.RESTORE_RAM, payload: { amount } });
    };

    const upgradeStat = (stat) => dispatch({ type: ACTIONS.UPGRADE_STAT, payload: { stat } });
    const applyBonus = (stat, amount = 1) => dispatch({ type: ACTIONS.APPLY_BONUS, payload: { stat, amount } });

    return (
        <PlayerContext.Provider value={{
            state: { ...state, stats: { ...state.stats, ...effectiveStats, currentIntegrity: state.stats.currentIntegrity, mRamCurrent: state.stats.mRamCurrent } },
            lockResource, damageKernel, healKernel, restoreRam, upgradeStat, applyBonus
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
