/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Weighted Random Loot Table for Data Nodes
 * SYSTEM: 10-Tier Drop System with Rarity Weighting
 */

import { getAvailableFragment } from './LoreManager';

export const ITEM_TYPES = {
    // Currency
    EBIT_CLUSTER: 'EBIT_CLUSTER',

    // Vitality
    MRAM_INJECTOR: 'MRAM_INJECTOR',

    // Lore
    LOGIC_FRAGMENT: 'LOGIC_FRAGMENT',

    // Buffs (Temporary)
    BUFFER_OVERCLOCKER: 'BUFFER_OVERCLOCKER',
    CLOCK_CYCLE_BOOST: 'CLOCK_CYCLE_BOOST',

    // Utility (Single Use)
    GHOST_PROTOCOL: 'GHOST_PROTOCOL',
    SYSTEM_PING: 'SYSTEM_PING',
    KERNEL_SPIKE: 'KERNEL_SPIKE',

    // Anomaly (Ultra Rare)
    SECTOR_BREACH: 'SECTOR_BREACH',
    CORE_SWAP: 'CORE_SWAP'
};

// Loot table with weighted probabilities
const LOOT_TABLE = [
    { type: ITEM_TYPES.EBIT_CLUSTER, weight: 50, rarity: 'COMMON' },
    { type: ITEM_TYPES.MRAM_INJECTOR, weight: 15, rarity: 'COMMON' },
    { type: ITEM_TYPES.LOGIC_FRAGMENT, weight: 8, rarity: 'RARE' },
    { type: ITEM_TYPES.BUFFER_OVERCLOCKER, weight: 7, rarity: 'UNCOMMON' },
    { type: ITEM_TYPES.CLOCK_CYCLE_BOOST, weight: 5, rarity: 'UNCOMMON' },
    { type: ITEM_TYPES.GHOST_PROTOCOL, weight: 5, rarity: 'RARE' },
    { type: ITEM_TYPES.SYSTEM_PING, weight: 4, rarity: 'RARE' },
    { type: ITEM_TYPES.KERNEL_SPIKE, weight: 3, rarity: 'RARE' },
    { type: ITEM_TYPES.SECTOR_BREACH, weight: 2, rarity: 'ULTRA_RARE' },
    { type: ITEM_TYPES.CORE_SWAP, weight: 1, rarity: 'ULTRA_RARE' }
];

const TOTAL_WEIGHT = LOOT_TABLE.reduce((sum, item) => sum + item.weight, 0);

/**
 * Roll for a random item drop
 * @param {number} floorLevel - Current floor (affects Logic Fragment availability)
 * @param {number[]} collectedFragments - Array of fragment IDs already collected
 * @returns {Object} - Dropped item with type, value, and metadata
 */
export function rollLoot(floorLevel = 1, collectedFragments = []) {
    const roll = Math.random() * TOTAL_WEIGHT;
    let cumulative = 0;

    for (const entry of LOOT_TABLE) {
        cumulative += entry.weight;
        if (roll <= cumulative) {
            return generateItem(entry.type, floorLevel, collectedFragments);
        }
    }

    // Fallback (should never reach)
    return generateItem(ITEM_TYPES.EBIT_CLUSTER, floorLevel, collectedFragments);
}

/**
 * Roll for Corrupted Node (guaranteed 2x Rare/Ultra-Rare)
 */
export function rollCorruptedLoot(floorLevel = 1, collectedFragments = []) {
    const rareItems = LOOT_TABLE.filter(
        entry => entry.rarity === 'RARE' || entry.rarity === 'ULTRA_RARE'
    );

    const item1 = rareItems[Math.floor(Math.random() * rareItems.length)];
    const item2 = rareItems[Math.floor(Math.random() * rareItems.length)];

    return [
        generateItem(item1.type, floorLevel, collectedFragments),
        generateItem(item2.type, floorLevel, collectedFragments)
    ];
}

/**
 * Generate item with appropriate values
 */
function generateItem(itemType, floorLevel, collectedFragments) {
    const item = {
        type: itemType,
        name: getItemName(itemType),
        color: getItemColor(itemType)
    };

    switch (itemType) {
        case ITEM_TYPES.EBIT_CLUSTER:
            item.value = Math.floor(Math.random() * 41) + 10; // 10-50
            item.description = `+${item.value} eBITS`;
            break;

        case ITEM_TYPES.MRAM_INJECTOR:
            item.healPercent = 40;
            item.stackable = true;
            item.maxStack = 3;
            item.description = 'Restores 40% Integrity & M-RAM';
            break;

        case ITEM_TYPES.LOGIC_FRAGMENT:
            // Check if fragments available for this floor
            const fragment = getAvailableFragment(floorLevel, collectedFragments);
            if (fragment) {
                item.fragmentId = fragment.id;
                item.fragmentText = fragment.text;
                item.bonusEBits = 100;
                item.description = `LORE_DECRYPTED +100 eBITS`;
            } else {
                // All fragments collected - convert to eBits
                item.type = ITEM_TYPES.EBIT_CLUSTER;
                item.value = 200;
                item.description = '[ARCHIVE_COMPLETE] +200 eBITS';
                item.name = 'Archive Complete';
            }
            break;

        case ITEM_TYPES.BUFFER_OVERCLOCKER:
            item.buffType = 'SPEED';
            item.buffValue = 25; // +25%
            item.duration = 2; // floors
            item.description = '+25% Speed & Dodge for 2 floors';
            break;

        case ITEM_TYPES.CLOCK_CYCLE_BOOST:
            item.buffType = 'COOLDOWN';
            item.buffValue = -15; // -15%
            item.duration = 3; // floors
            item.description = '-15% Cooldowns for 3 floors';
            break;

        case ITEM_TYPES.GHOST_PROTOCOL:
            item.abilityType = 'INVISIBILITY';
            item.abilityDuration = 10; // seconds
            item.stackable = false;
            item.description = 'Invisible to mobs for 10s';
            break;

        case ITEM_TYPES.SYSTEM_PING:
            item.abilityType = 'MAP_REVEAL';
            item.stackable = false;
            item.description = 'Reveals entire map & exits';
            break;

        case ITEM_TYPES.KERNEL_SPIKE:
            item.abilityType = 'INSTANT_KILL';
            item.stackable = false;
            item.description = 'Instantly kills one non-boss mob';
            break;

        case ITEM_TYPES.SECTOR_BREACH:
            item.abilityType = 'SKIP_FLOOR';
            item.stackable = false;
            item.description = 'Teleport: Skip current floor';
            break;

        case ITEM_TYPES.CORE_SWAP:
            item.abilityType = 'REROLL_STATS';
            item.stackable = false;
            item.description = 'Re-rolls current Resonance';
            break;

        default:
            item.description = 'Unknown item';
    }

    return item;
}

/**
 * Get display name for item type
 */
function getItemName(itemType) {
    const names = {
        [ITEM_TYPES.EBIT_CLUSTER]: 'eBit Cluster',
        [ITEM_TYPES.MRAM_INJECTOR]: 'M-RAM Injector',
        [ITEM_TYPES.LOGIC_FRAGMENT]: 'Logic Fragment',
        [ITEM_TYPES.BUFFER_OVERCLOCKER]: 'Buffer Overclocker',
        [ITEM_TYPES.CLOCK_CYCLE_BOOST]: 'Clock-Cycle Boost',
        [ITEM_TYPES.GHOST_PROTOCOL]: 'Ghost Protocol',
        [ITEM_TYPES.SYSTEM_PING]: 'System Ping',
        [ITEM_TYPES.KERNEL_SPIKE]: 'Kernel Spike',
        [ITEM_TYPES.SECTOR_BREACH]: 'Sector Breach',
        [ITEM_TYPES.CORE_SWAP]: 'Cyan/Magenta Core'
    };
    return names[itemType] || 'Unknown';
}

/**
 * Get visual color for item type
 */
function getItemColor(itemType) {
    const colors = {
        [ITEM_TYPES.EBIT_CLUSTER]: '#FFD700', // Gold
        [ITEM_TYPES.MRAM_INJECTOR]: '#00FFFF', // Cyan
        [ITEM_TYPES.LOGIC_FRAGMENT]: '#FF00FF', // Magenta
        [ITEM_TYPES.BUFFER_OVERCLOCKER]: '#FFFFFF', // White
        [ITEM_TYPES.CLOCK_CYCLE_BOOST]: '#0088FF', // Blue
        [ITEM_TYPES.GHOST_PROTOCOL]: '#888888', // Gray
        [ITEM_TYPES.SYSTEM_PING]: '#8800FF', // Purple
        [ITEM_TYPES.KERNEL_SPIKE]: '#FF0000', // Red
        [ITEM_TYPES.SECTOR_BREACH]: '#FF8800', // Orange
        [ITEM_TYPES.CORE_SWAP]: '#00FF88' // Cyan-Green
    };
    return colors[itemType] || '#FFFFFF';
}



export default {
    rollLoot,
    rollCorruptedLoot,
    ITEM_TYPES
};
