export const patchNotes = [
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
