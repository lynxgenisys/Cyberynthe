/**
 * IDENTITY: LOGIC_BREACH_02
 * PURPOSE: Static Database of all physical/digital assets.
 */

export const ITEM_TYPES = {
    SCRIPT_ACTIVE: 'SCRIPT_ACTIVE',
    SCRIPT_PASSIVE: 'SCRIPT_PASSIVE',
    HARDWARE_BUS: 'HARDWARE_BUS',
    HARDWARE_CORE: 'HARDWARE_CORE',
    HARDWARE_IO: 'HARDWARE_IO',
    TRINKET: 'TRINKET',
    CONSUMABLE: 'CONSUMABLE',
    KEY: 'KEY'
};

export const ITEM_REGISTRY = {
    // --- KEYS (Story) ---
    'KERNEL_ACCESS_KEY': {
        id: 'KERNEL_ACCESS_KEY',
        name: 'Kernel Access Key',
        type: ITEM_TYPES.KEY,
        description: 'Encrypted root-access token. Unlocks Sector 02.',
        rarity: 'LEGENDARY'
    },

    // --- SCRIPTS (Active) ---
    'DATA_SPIKE': {
        id: 'DATA_SPIKE',
        name: 'Data_Spike.exe',
        type: ITEM_TYPES.SCRIPT_ACTIVE,
        cost: 15,
        description: 'Deals 10 DMG. Basic offensive compiler.',
        rarity: 'COMMON'
    },
    'SHRED_V1': {
        id: 'SHRED_V1',
        name: 'Shred.bat',
        type: ITEM_TYPES.SCRIPT_ACTIVE,
        cost: 25,
        description: 'Rapid series of 3 hits (3 DMG each).',
        rarity: 'UNCOMMON'
    },

    // --- DAEMONS (Passive) ---
    'OBJECT_SHELL': {
        id: 'OBJECT_SHELL',
        name: 'Object_Shell_Daemon',
        type: ITEM_TYPES.SCRIPT_PASSIVE,
        lockCost: 15, // M-RAM Locked while active
        description: 'Generates a 25 HP buffer shield.',
        rarity: 'RARE'
    },
    'STEALTH_V2': {
        id: 'STEALTH_V2',
        name: 'Stealth_v2.0',
        type: ITEM_TYPES.SCRIPT_PASSIVE,
        lockCost: 25,
        description: 'Reduces enemy detection radius by 50%.',
        rarity: 'RARE'
    },

    // --- HARDWARE (Ports) ---
    'CRYO_HEATSINK': {
        id: 'CRYO_HEATSINK',
        name: 'Cryo-Liquid Heatsink',
        type: ITEM_TYPES.HARDWARE_BUS,
        stats: { scrubSpeed: +0.1 },
        description: '-10% System Scrub Latency.',
        rarity: 'UNCOMMON'
    },
    'LOGIC_ACCELERATOR': {
        id: 'LOGIC_ACCELERATOR',
        name: 'ALU Logic Accelerator',
        type: ITEM_TYPES.HARDWARE_CORE,
        stats: { clockSpeed: +5 },
        description: '+5Hz Clock Speed.',
        rarity: 'RARE'
    },
    'NEURAL_LINK': {
        id: 'NEURAL_LINK',
        name: 'Neural_Link_v2',
        type: ITEM_TYPES.HARDWARE_IO,
        stats: { scanSpeed: +0.5 },
        description: 'Instant SCAN readout.',
        rarity: 'EPIC'
    },

    // --- TRINKETS (System Overhead) ---
    'FLOPPY_DISK': {
        id: 'FLOPPY_DISK',
        name: '3.5" Floppy Disk',
        type: ITEM_TYPES.TRINKET,
        weight: 1, // +1% Latency
        description: 'Ancient magnetic storage. Highly inefficient.',
        rarity: 'COMMON'
    },
    'VACUUM_TUBE': {
        id: 'VACUUM_TUBE',
        name: 'Vacuum Tube',
        type: ITEM_TYPES.TRINKET,
        weight: 2, // +2% Latency
        description: 'Pre-silicon logic gate. Radiates heat.',
        rarity: 'UNCOMMON'
    }
};
