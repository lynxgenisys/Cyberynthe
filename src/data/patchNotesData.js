export const patchNotes = [
    {
        version: "v0.16.1",
        date: "2026-06-04",
        categories: {
            "Added": [
                "Mobile UI: Integrated Ping scanning directly into the Minimap. Tap the minimap to ping the surrounding area.",
                "Mobile UI: Re-ordered layout to support larger, more accessible thumb targets."
            ],
            "Fixed": [
                "Desktop Viewport: Fixed a critical CSS leak where the mobile layout media query inadvertently squashed the PC layout.",
                "Runtime Crash: Resolved a 'dist is not defined' ReferenceError in the MobManager caused by duplicated AI logic blocks.",
                "Runtime Crash: Resolved a silent freeze crash on run start caused by an undeclared isSprinting reference in the footstep audio logic.",
                "Mobile UI: Fixed Quick Slot buttons not triggering due to an invisible pointer-events blocking layer.",
                "Mobile UI: Enlarged Quick Slot buttons, Jump button, and Spike button to better match thumb dimensions (96x96)."
            ]
        }
    },
    {
        version: "v0.15.3",
        date: "2026-06-04",
        categories: {
            "Added": [
                "Mobile Splash Screen overlay enforcing an explicit user gesture to trigger the Fullscreen API safely on mobile browsers."
            ],
            "Changed": [
                "Index Viewport: Updated meta viewport tags to lock scaling (maximum-scale=1.0) and prevent accidental zoom on mobile.",
                "Mobile CSS: Applied CSS Media Queries (max-width: 768px) to safely stack UI panels vertically on narrow mobile screens and prevent element overlapping.",
                "Engine Initialization: Refactored mobile boot sequence to wait for explicit 'ENTER GAME' confirmation before unlocking the canvas, fully resolving the 'half-loaded freeze' issue."
            ]
        }
    },
    {
        version: "v0.15.0",
        date: "2026-06-04",
        categories: {
            "Added": [
                "Mobs: Added 'STATEFUL_TRACKER' elite mob for floors 21+. Tracks players and utilizes PHASE_LOCK mechanics.",
                "Boss: Added 'SECTOR_GUARDIAN' Floor 30 Boss. Features a massive octagonal arena, rotating monolith shields, and deadly FIREWALL_PURGE laser mechanics.",
                "Environment: Implemented 'Logic Lattice' theme for Sector 3 (Floors 21-30), featuring procedurally generated DataGridSky skybox and wider labyrinth passages."
            ],
            "Changed": [
                "UI (Mobile): Restored Quick Slots sizing and integrated Ping/Scan directly into the minimap tap interaction.",
                "UI (Mobile): Overhauled synthetic touch events to natively support React-Three-Fiber hooks, fixing issues with Jump, Fire, and Shred actions."
            ],
            "Fixed": [
                "UI (Desktop): Fixed Patch Notes screen failing to render due to malformed data in v0.14.4."
            ]
        }
    },
    {
        version: "v0.14.4",
        date: "2026-06-04",
        categories: {
            "Added": [
                "Dedicated Overclock toggle switch in mobile UI to replace run button.",
                "Ping button (E) on mobile UI overlay.",
                "Look Sensitivity slider in settings (default 1.15x)."
            ],
            "Changed": [
                "Increased Joystick size to match Minimap (48 units / 192px).",
                "Re-scaled Quick Slots up to original 128px size for better hit detection.",
                "Jump button resized to match Fire buttons and relocated."
            ],
            "Fixed": [
                "Critical memory leak/black screen stutter when processing Spark/Loot drop post-processing on mobile devices.",
                "Mobile action buttons (Jump, Ping, Shred) not firing correctly due to synthetic event scoping."
            ]
        }
    },
    {
        version: "v0.14.3",
        date: "2026-06-04",
        categories: {
            "Changed": [
                "UI (Mobile): Scaled down the Quick Slots on mobile screens to be exactly 1/4th of their original size, fixing an issue where they were ignoring scaling rules due to overriding inline transform styles.",
                "UI (Mobile): Fixed the Mini-Map 'Tap-to-Scan' feature. Replaced the restrictive touch-start event listener with a universal pointer-down listener to ensure immediate response on all touch devices without breaking browser default behaviors."
            ],
            "Fixed": [
                "Engine: Cleaned up a minor syntax warning in GameContext related to duplicate switch statement clauses."
            ]
        }
    },
    {
        version: "v0.14.21",
        date: "2026-05-31",
        categories: {
            "Fixed": [
                "Engine: Fixed a critical crash on Floor 20 (Byte Mother Boss) caused by the mob spawner looking for a non-existent player coordinate flag, which resulted in a black screen shortly after loading into the level.",
                "Engine: Added a global Error Boundary to the renderer. If the 3D Engine ever crashes in the future, it will now display a diagnostic 'SYSTEM_FAILURE' screen with the exact error log instead of turning completely black."
            ]
        }
    },
    {
        version: "v0.14.20",
        date: "2026-05-31",
        categories: {
            "UI (Main Menu)": [
                "Grouped the RESUME_PREVIOUS_RUN button and L2 Cache data into a stylized box container for better visibility.",
                "Expanded the width of the L2 Cache box to precisely match the width of the Resume button.",
                "Increased the font size of the L2 Cache text to closely match the button text size.",
                "Fixed a responsive scaling bug on mobile where the Resume button was not properly scaling down to match the Initialize button."
            ]
        }
    },
    {
        version: "v0.14.19",
        date: "2026-05-31",
        categories: {
            "Fixed": [
                "Engine: Fixed a React race condition where the mobile device detection state was evaluating asynchronously on the first frame, causing the game to occasionally misidentify mobile devices as desktops for the first 100ms. This is what caused the black screen 'Pointer Lock' bug to persist on some phones even after the previous fix."
            ]
        }
    },
    {
        version: "v0.14.18",
        date: "2026-05-31",
        categories: {
            "Audio": [
                "The game menu now loops sequentially through all available menu tracks by default.",
                "Added a smooth 2-second volume fade-out at the end of all music tracks to prevent jarring transitions."
            ],
            "UI (Main Menu)": [
                "Removed the NEXT_TRACK button to keep the UI clean as tracks cycle automatically.",
                "Renamed 'RESUME_SESSION' to 'RESUME_PREVIOUS_RUN'.",
                "Upgraded the styling of the Resume button to match the Initialize button, featuring an inverted magenta-to-cyan glitch gradient.",
                "Added a summary of your Active L2 Cache (Save Data) under the Resume button to easily see your current Mode, Level, and XP before jumping in."
            ]
        }
    },
    {
        version: "v0.14.17",
        date: "2026-05-31",
        categories: {
            "Fixed": [
                "Engine: Removed Mouse Pointer Lock on mobile devices. This was the root cause of the screen going black and freezing the browser on startup.",
                "UI (Profile): The BACK_TO_LEDGER button inside the Profile View has been doubled in size and colored magenta for better visibility.",
                "UI (Ledger): Centered the mode and metric selection buttons.",
                "UI (Ledger): Increased the size of the metric description text and forced it to wrap onto two lines to prevent horizontal stretching."
            ]
        }
    },
    {
        version: "v0.14.16",
        date: "2026-05-31",
        categories: {
            "Fixed": [
                "UI (Ledger): Significantly reduced font sizes and margins across the entire Ledger table for mobile screens.",
                "Engine: Completely removed fullscreen and orientation requests from the start sequence, as they were still causing black screens on some mobile devices.",
                "UI: Removed final stray brackets from the mobile HUD CYBERDECK button."
            ]
        }
    },
    {
        version: "v0.14.15",
        date: "2026-05-31",
        categories: {
            "Fixed": [
                "UI: Removed all bracket styling [ ] around buttons across the entire UI to prevent text wrapping onto separate lines on mobile.",
                "Engine: Fixed an issue causing a black screen when starting a run on some mobile browsers by making the fullscreen requests non-blocking.",
                "UI (Ledger): Scaled down the Leaderboard (Ledger) elements by another 20% on mobile screens for better readability."
            ]
        }
    },
    {
        version: "v0.14.14",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "UI (Main Menu): Rewrote CSS for the Main Menu (Splash Screen) to properly scale fonts, padding, and layout down for mobile devices.",
                "UI (Main Menu): Fixed the navigation tabs wrapping and overlapping the logo on mobile.",
                "UI (Main Menu): Changed the Mode Selection buttons to stack vertically on small screens so they fit correctly."
            ]
        }
    },
    {
        version: "v0.14.13",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother: Reduced head size by 50% from its previous size and moved it closer to the body so it remains attached.",
                "Mob Spawning (Floor 20): Mites now spawn consistently along the entire path starting from the player's entry point, instead of only near the boss.",
                "Mob Spawning: Byte Mother now passively summons mites before being engaged, ensuring her room is well-populated when you arrive.",
                "UI: Scaled down the mobile Cyberdeck interface by 50% to improve usability on small screens."
            ]
        }
    },
    {
        version: "v0.14.12",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Lighting: Increased the global ambient light and point light intensities by ~15-20% to brighten the entire level overall."
            ]
        }
    },
    {
        version: "v0.14.11",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother Geometry: Reduced head size by 30%, moved it closer to the body so it's visibly attached, and raised it slightly off the floor.",
                "Byte Mother Geometry: Reduced leg thickness and length by 30% relative to the body.",
                "Byte Mother Geometry: Shifted the legs backward along the body so they don't protrude out past the head."
            ]
        }
    },
    {
        version: "v0.14.10",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother: Changed her legs to use the original Bit Mite skin texture and color palette for a more organic/hybrid look.",
                "Byte Mother: Reduced her overall size to 85% of her previous size."
            ]
        }
    },
    {
        version: "v0.14.9",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother: Shrunk the texture repeating pattern down (increased tiling scale) so the hexagonal plates look smaller, tighter, and more intricate.",
                "Byte Mother: Implemented emissive map lighting using the cyber-chitin texture! The light cyan circuitry lines running through the seams of her armor will now actually glow in the dark room, significantly increasing her overall luminosity and visual pop without needing a transparent layer."
            ]
        }
    },
    {
        version: "v0.14.8",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother: Fixed and re-applied the 'Cyber-Chitin' texture based on the reference design. The material base color has been reset to bright white to properly showcase the dark metallic hex plates and glowing cyan circuitry without artificially darkening the texture into a 'black fuzz'.",
                "Byte Mother: Adjusted texture scaling so the hexagonal plates are larger and more legible on the boss's geometry."
            ]
        }
    },
    {
        version: "v0.14.7",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Byte Mother: Reverted the cyber-chitin texture back to the original solid metallic colors, as the texture looked too dark and noisy at scale.",
                "Byte Mother: Elongated her body forward and increased the size and forward position of her head.",
                "Byte Mother: She will now slowly lumber towards the player instead of just sitting in the middle of the room.",
                "Floor 20 Spawns: Bit Mites now spawn exactly one per corner/intersection across all paths outside the boss room."
            ]
        }
    },
    {
        version: "v0.14.6",
        date: "2026-05-31",
        categories: {
            "Changed": [
                "Projectile Feedback: Shots that hit walls or the floor now play a distinct dull metallic thud sound (no visual splatter). Confirmed mob hits still show the full impact VFX with the crunchy hit SFX. Shots that expire in open space produce no sound at all — giving three distinct layers of audio feedback for hits, surface impacts, and total misses."
            ]
        }
    },
    {
        version: "v0.14.4",
        date: "2026-05-31",
        categories: {
            "Added": [
                "Cyber-Chitin Texture: The Byte Mother now features a dark metallic hexagonal carapace skin inspired by synthetic armored chitin with blue energy veins.",
                "Floor 20 Swarm: 1-2 Bit Mites now spawn at every corner and intersection throughout the maze corridors on Floor 20.",
                "Floor 20 Sentries: Stateless Sentries now guard every dead end in the Floor 20 labyrinth."
            ],
            "Changed": [
                "Byte Mother: Reduced to 60% of previous size for better visual proportions.",
                "Byte Mother: Now features a dark gunmetal-blue metallic material with higher metalness and lower roughness for a premium armored look."
            ],
            "Fixed": [
                "M-RAM Injectors: Fixed a critical bug where using an MRAM Injector was also restoring Integrity/HP. Injectors now ONLY affect MRAM as intended.",
                "Mob Spawning: Bit Mites and Sentries on Floor 20 now correctly spawn throughout the maze corridors instead of clustering inside the boss chamber."
            ]
        }
    },
    {
        version: "v0.14.2",
        date: "2026-05-31",
        categories: {
            "Added": [
                "Highest Achieved XP and Player Level tracked in the scoreboard."
            ],
            "Changed": [
                "Byte Mother: Removed the 80% default armor reduction. You can now deal normal damage to her even without a critical spot or scan.",
                "Byte Mother: She will now wait patiently in the center of the boss chamber until you engage her, rather than immediately rushing you on spawn.",
                "Byte Mother: Legs scaled down and repositioned to the middle of her mass for a more grounded spider-like aesthetic."
            ],
            "Fixed": [
                "M-RAM Injectors: Fixed a major inventory bug where using the quick slot would consume the entire stack instead of just 1 item.",
                "M-RAM Injectors: Fixed the regeneration logic to properly restore 40% of max capacity over a steady 4-second window (10% per second).",
                "Mob Spawning: Fixed an issue on Floor 20 where no mobs would spawn (Boss only floor)."
            ]
        }
    },
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

