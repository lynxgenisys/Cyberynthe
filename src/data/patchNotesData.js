export const patchNotes = [
    {
        version: "v0.14.0",
        date: "2026-05-30",
        categories: {
            "Added": [
                "Floor 20 Boss Chamber: The Byte-Mother boss has been deployed! Navigating Floor 20 now features a dedicated 15x15 chamber.",
                "BFS Spawn Generation: The player's spawn point on Floor 20 is mathematically calculated to be the furthest reachable maze point from the boss chamber to ensure a deep labyrinth dive.",
                "Boss Vulnerability Windows: Implemented damage/hit-reaction state machines allowing the Byte-Mother to enter a glowing vulnerable state where attacks deal 2.5x critical damage."
            ],
            "Changed": [
                "M-RAM Injectors: Refactored functionality to trigger a smooth 2.5-second regeneration curve rather than snapping to full.",
                "M-RAM Injectors: Consumables now restore 40% of the player's max capacity per use.",
                "Mobile Global Scaling: Scaled down the global mobile typography and HUD elements by an additional 25% for a much sleeker fit.",
                "Byte-Mother Physical Scaling: Boss geometry scaled down to 65% of original size."
            ],
            "Fixed": [
                "Mobile Gravity Glitch: Explicitly locked the Z-axis (roll) in the mobile drag-to-look camera controller to prevent the horizon from slowly twisting over time.",
                "Boss HP Desync: Fixed the Byte-Mother's health pool not updating correctly on the HUD due to shared IO_SENTINEL legacy logic."
            ]
        }
    },
    {
        version: "v0.13.0",
        date: "2026-05-30",
        categories: {
            "Added": [
                "Mobile Integration: Seamless cross-play integration within a unified codebase via device detection logic.",
                "Touch Controls: Added Virtual Joystick for movement and swipe-to-look camera panning.",
                "Mobile HUD Overlay: Implemented dedicated thumb-friendly virtual buttons for Jumping, Firing, Shredding, Scanning, and Interaction.",
                "Support Links: Added a Buy Me A Coffee widget to the main menu.",
                "Audio Scape: Added a new ping/loot collection sound effect for collecting data fragments."
            ],
            "Changed": [
                "Inventory System Unification: Enforced a global 999 max stack limit for items across both the player's Cyberdeck Backpack and the HUD Quick-Slots.",
                "Mob AI Spawning: Null Wisps now utilize a BFS pathfinding algorithm to spawn Bit Mites along valid maze paths rather than arbitrarily behind walls.",
                "Mob AI Logic: Null Wisps now reverse orbit direction when directly targeted by the player's crosshair.",
                "Sentry Scaling: Increased global Sentry spawn rate by 40% and updated base spawn levels.",
                "Floor 9 Event: Guaranteed Sentry spawn at the exit portal which drops a new 'Full Recovery' green-magenta pulsing item."
            ],
            "Fixed": [
                "Player Controller Crash: Fixed a critical ReferenceError where isMobile was undefined when initializing the game on mobile devices.",
                "Split-Brain Saving / Leaderboard Crosstalk: localStorage saves are now strictly namespaced to the authenticated Supabase user.id. Logging into an alternate profile on the same PC will no longer bleed saves or attribute progress incorrectly.",
                "MobManager Syntax: Scrubbed an orphaned block of AI logic that was previously breaking the production Rollup build."
            ]
        }
    },
    {
        version: "v0.12.2",
        date: "2026-05-29",
        categories: {
            "Added": [
                "Compact HUD Logs: A new system setting to shrink the HUD notification log to 2 messages.",
                "L2_CACHE Persistence: Explicit floor transition saves that guarantee progress updates on boss defeats."
            ],
            "Changed": [
                "Combat Tuning: Bit Flip now unlocks dynamically on floor 2/level 3 via a special dancing Mite drop.",
                "Audio Overhaul: Fully wired Data Spike Synth attacks and continuous Charge attacks with menu music cycling."
            ],
            "Fixed": [
                "Interaction HUD: Raised synchronization prompts to clear the reticle.",
                "Stuck Prompts: Walk-away fading for Ghost Shard prompts.",
                "Inventory Bug: Fixed an issue where new items wouldn't auto-send to the backpack when quickslots were full.",
                "Import Crash: Re-added AuthOverlay to fix the white screen crash on load."
            ]
        }
    },
    {
        version: "v0.12.1",
        date: "2026-05-29",
        categories: {
            "Added": [
                "Lore Archive: A new tab inside the Profile Card dossier to track and re-read decrypted System Fragments.",
                "Persistent Lore: Unlocked System Fragments now permanently save to your Cloud profile across all runs.",
                "Expanded Badge System: Added 18 new legacy titles and achievements covering combat, ghost mode, and exploration."
            ]
        }
    },
    {
        version: "v0.12.0",
        date: "2026-05-28",
        categories: {
            "Added": [
                "Cloud Saves: Game state, player inventory, and progression are now securely backed up to Supabase.",
                "Settings Tab: A new configuration panel within the Cyberdeck for adjusting preferences.",
                "Music & Audio Systems: Full OST integration for Menus, Levels, and Boss encounters with volume controls and shuffle capabilities.",
                "Patch Notes/Update Log: A complete historical archive of all system changes available in the About page."
            ],
            "Changed": [
                "Leaderboards 2.0: Restructured with tabs for Normal, Hardcore, Ghost, and Accomplishments.",
                "Profile Dossiers: Now feature lifetime kills broken down by mob type, active Lcache (Current Run) tracking, and Deepest Dives separated by game mode.",
                "Spawn Balancing: Sentinels no longer spawn until floor 9, and Hunters wait until floor 13."
            ],
            "Fixed": [
                "Music Autoplay: Fixed browser restrictions blocking menu music from initializing on load.",
                "JSX & React Warnings: Cleaned up various syntax errors in the UI components."
            ]
        }
    },
    {
        version: "v0.11.2",
        date: "2026-02-04",
        categories: {
            "Changed": [
                "Mouse Lock Fix: Game automatically re-locks mouse cursor to 'LOOK' mode when exiting Spectral Scroll or Lore Logs.",
                "Dev Tools Security: Disabled debug tools in Production builds."
            ]
        }
    },
    {
        version: "v0.11.1",
        date: "2026-02-04",
        categories: {
            "Fixed": [
                "3D Render Crash: Fixed 'TypeError: Cannot set properties of null' during InstancedMesh updates.",
                "Safety Checks: Implemented rigorous bounds checking for MobManager, InstancedWalls, ProjectileSystem, and NeonCity rendering."
            ]
        }
    },
    {
        version: "v0.11.0",
        date: "2026-02-04",
        categories: {
            "Added": [
                "Spectral Scroll (Minigame): Interactive roller-based timing game for high-tier loot cache decryption.",
                "Sentry Overhaul: Reworked Stateless Sentry with a 3s Purple charge phase, 2.5x body expansion, and 4s cooldowns.",
                "Sentry Beam Refactor: Migrated beam rendering to InstancedMesh for 60Hz frame-perfect synchronization."
            ],
            "Changed": [
                "Ghost Mode Polish: Disabled weapons, mapped Pulse Scan to LeftClick, removed bosses, and implemented 0.2s auto-loot.",
                "Sprint Mechanics: Implemented dynamic M-RAM drain cost based on efficiency levels.",
                "M-RAM Safety: Added guardrails to prevent negative M-RAM values during rapid sprint consumption."
            ],
            "Technical": [
                "Auth Flow 2.0: Split Login/Register flows with proper Email & Username support.",
                "Magic Link Detection: Fixed issue where email confirmations would hang at the login gate.",
                "RunTracker Timer: Fixed pause-state desyncs when reading inventory or lore."
            ]
        }
    },
    {
        version: "v0.10.0",
        date: "2026-02-02",
        categories: {
            "Added": [
                "The Gradient Ledger System: Supabase backend persistence for Leaderboards and Player Profiles.",
                "Splash Screen UI: Full menu system with Normal, Hardcore, and True Ghost mode selection.",
                "Profile Cards: Hacker ID display featuring earned badges, resonance bars, and lifetime stats.",
                "Mini-Map System: Tactical 2D top-down view with Fog of War and Scanner integration."
            ],
            "Technical": [
                "Algorithmic Scoring: Created distinct mathematical evaluations for Velocity, Stability, and Ghost runs.",
                "FastStateRef: Optimized player position telemetry for high-performance rendering.",
                "AuthOverlay: Secured system access with invitation-only authentication flows."
            ]
        }
    },
    {
        version: "v0.9.2",
        date: "Previous Build",
        categories: {
            "Added": [
                "Sectors 01-02: Complete layout for Floors 1 through 25.",
                "Boss Fight: Encounter with the IO_SENTINEL entity.",
                "Data Cache Loot System: Procedural item generation.",
                "Fragment Lore System: Decryptable lore overlays scattered throughout the maze.",
                "Trinity RPG Mechanics: Integrity, M-RAM, Clock Speed, and Ethical Resonance (Cyan ↔ Magenta).",
                "Scanner System: Vulnerability revelation mechanics for stealthed entities.",
                "Mob AI: Autonomous routines for Mites, Wisps, Hunters, and Sentries."
            ]
        }
    }
];

