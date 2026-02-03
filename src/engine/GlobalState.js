/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Global State Schema (Persistence Layer)
 * SYNC_TARGET: Supabase (Future)
 */

export const GlobalState = {
    meta: {
        current_floor: 1,
        seed_id: 'INIT',
        elite_mode: false,
        timestamp: 0
    },
    stats: {
        integrity: 100,
        m_ram: 110,
        clock_speed: 22
    },
    inventory: {
        ebits: 0,
        legacy_fragments: [] // IDs of collected Lore/Anomalies
    },
    metrics: {
        moral_resonance: { cyan: 0.0, magenta: 0.0 }
    }
};

/**
 * HELPER: Serialize for Upload
 */
export const packState = (gameState, playerState) => {
    return {
        meta: {
            current_floor: gameState.floorLevel,
            seed_id: gameState.seed,
            elite_mode: gameState.isElite,
            timestamp: Date.now()
        },
        stats: {
            integrity: playerState.stats.currentIntegrity,
            m_ram: playerState.stats.mRamCurrent,
            clock_speed: playerState.stats.clockSpeed
        },
        inventory: {
            ebits: gameState.eBits || 0,
            legacy_fragments: [] // Pending Inventory refactor
        },
        metrics: {
            moral_resonance: {
                cyan: 1.0 - gameState.ethicsScore,
                magenta: gameState.ethicsScore
            }
        }
    };
};
