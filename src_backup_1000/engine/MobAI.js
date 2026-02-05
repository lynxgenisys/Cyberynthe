/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Advanced Mob Behaviors
 */

export const BESTIARY = {
    BIT_MITE: {
        id: 'BIT_MITE',
        name: 'Bit Mite',
        hp: 20,
        dmg: 5,
        telegraph: null // Simple melee
    },
    STATELESS_SENTRY: {
        id: 'STATELESS_SENTRY',
        name: 'Stateless Sentry',
        hp: 50,
        dmg: 10,
        telegraph: {
            color: '#00FFFF', // Cyan
            duration: 1000,
            msg: 'DATA_STREAM_CHARGING'
        }
    },
    STATEFUL_TRACKER: {
        id: 'STATEFUL_TRACKER',
        name: 'Stateful Tracker',
        hp: 120,
        dmg: 15,
        telegraph: {
            color: '#EA00FF', // Magenta
            duration: 1500,
            msg: 'MEMORY_LEAK_SPOOLING'
        },
        special: 'PHASE_LOCK'
    },
    SECTOR_GUARDIAN: {
        id: 'SECTOR_GUARDIAN',
        name: 'Sector Guardian',
        hp: 500,
        dmg: 50,
        telegraph: {
            color: '#FFFFFF', // White Hot
            duration: 3000,
            msg: 'FIREWALL_PURGE_INITIATED'
        },
        special: 'BOSS'
    },
    IO_SENTINEL: {
        id: 'IO_SENTINEL',
        name: 'I/O Sentinel v1',
        hp: 2500, // Tanky
        dmg: 40,
        telegraph: {
            color: '#00FFFF', // Cyan Beam
            duration: 2000,
            msg: 'HANDSHAKE_PROTOCOL_DENIED'
        },
        resistance: 0.8, // 80% Damage Reduction
        special: 'GATEKEEPER'
    },
    HUNTER: {
        id: 'HUNTER',
        name: 'Logic Hunter',
        hp: 80,
        dmg: 20,
        telegraph: null, // Relentless
        special: 'PERSISTENT'
    },
    NULL_WISP: {
        id: 'NULL_WISP',
        name: 'Null Wisp',
        hp: 40,
        dmg: 0,
        telegraph: {
            color: '#0088FF', // Deep Blue
            duration: 3000,
            msg: 'UPLINKING...'
        },
        special: 'SUMMONER'
    }
};

export const MobLogic = {
    createMob: (type, floorLevel) => {
        const base = BESTIARY[type];
        if (!base) return null;

        // Scaling Logic: +10% stats per 10 floors
        const scale = 1 + Math.floor(floorLevel / 10) * 0.1;

        return {
            ...base,
            maxHp: Math.floor(base.hp * scale),
            currentHp: Math.floor(base.hp * scale),
            damage: Math.floor(base.dmg * scale),
            isTelegraphing: false,
            telegraphTimer: 0
        };
    },
    XP_PER_LEVEL: {
        1: 0, 2: 100, 3: 250, 4: 450, 5: 700, 6: 1000, 7: 1500, 8: 2200, 9: 3000, 10: 4000,
        11: 5200, 12: 6500, 13: 8000, 14: 10000, 15: 12500, 16: 15500, 17: 19000, 18: 23000, 19: 28000, 20: 35000
    }
};
