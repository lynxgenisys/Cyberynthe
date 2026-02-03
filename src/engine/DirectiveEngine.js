import QUESTS from '../data/quests.json';

/**
 * IDENTITY: SCHEDULER_03
 * DIRECTIVE: Manage Anomaly Injection
 * LOGIC:
 * - rollDirective(): 30% chance.
 * - getPenalty(): Decrement floor duration.
 */

export const DirectiveEngine = {
    rollDirective: (floorLevel, isElite = false) => {
        // 1. Roll Chance (d100)
        const roll = Math.random() * 100;
        const threshold = 70; // 30% Chance (> 70)

        if (roll <= threshold) return null;

        // 2. Filter by Tier
        // Tier 1: Lvl 1-250
        // Tier 2: Lvl 250+ (Elite)
        const tier = floorLevel >= 250 ? 2 : 1;
        const pool = QUESTS.filter(q => q.tier === tier || q.tier === 1); // Tier 2 can also pull Tier 1

        if (pool.length === 0) return null;

        // 3. Select Random
        const index = Math.floor(Math.random() * pool.length);
        return pool[index];
    },

    processPenalties: (activePenalties) => {
        // Tick down duration
        // Returns new array of active penalties
        return activePenalties
            .map(p => ({ ...p, duration: p.duration - 1 }))
            .filter(p => p.duration > 0);
    }
};
