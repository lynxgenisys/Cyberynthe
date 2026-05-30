# CHANGELOG - CYBERYNTHE


## [0.13.0] - 2026-05-30

### Added - MOBILE PWA & AI UPGRADES
- **Mobile Support**: Added Virtual Joystick and Touch Controls overlay for PWA mobile clients.
- **Support Links**: Added a Buy Me A Coffee widget to the main menu.
- **Audio Scape**: Added a new ping/loot collection sound effect for collecting data fragments.

### Changed
- **Inventory System Unification**: Enforced a global 999 max stack limit for items across both the player's Cyberdeck Backpack and the HUD Quick-Slots.
- **Mob AI Spawning**: Null Wisps now utilize a BFS pathfinding algorithm to spawn Bit Mites along valid maze paths rather than arbitrarily behind walls.
- **Mob AI Logic**: Null Wisps now reverse orbit direction when directly targeted by the player's crosshair.
- **Sentry Scaling**: Increased global Sentry spawn rate by 40% and updated base spawn levels.
- **Floor 9 Event**: Guaranteed Sentry spawn at the exit portal which drops a new "Full Recovery" green-magenta pulsing item.

### Fixed
- **Player Controller Crash**: Fixed a critical `ReferenceError` where `isMobile` was undefined when initializing the game on mobile devices.
- **Split-Brain Saving / Leaderboard Crosstalk**: `localStorage` saves are now strictly namespaced to the authenticated Supabase `user.id`. Logging into an alternate profile on the same PC will no longer bleed saves or attribute progress incorrectly.
- **MobManager Syntax**: Scrubbed an orphaned block of AI logic that was previously breaking the production Rollup build.

## [0.11.2] - 2026-02-04

### Changed - INPUT REFINEMENTS
- **Mouse Lock Fix**: Game now automatically re-locks mouse cursor to "LOOK" mode when exiting minigames (Spectral Scroll, Lore Logs), removing the need for an extra click.
- **Dev Tools Security**: Disabled debug tools in Production builds.

## [0.11.1] - 2026-02-04

### Fixed - CRITICAL HOTFIX
- **3D Render Crash**: Fixed `TypeError: Cannot set properties of null (setting 'needsUpdate')` that was constantly crashing the live build.
  - Added safety checks for all instanced mesh updates in `MobManager`, `InstancedWalls`, `ProjectileSystem`, `ImpactSystem`, and `NeonCity`.

## [0.11.0] - 2026-02-04

### Added - SENTRY OVERHAUL & MINIGAMES
- **Spectral Scroll (Minigame)**: Implemented "Handshake" decryption for Loot Caches.
  - Interactive roller-based timing game for high-tier rewards.
  - Critical success/failure states affect loot yield.
- **Sentry Overhaul**: Complete rework of the "Stateless Sentry" telegraphs:
  - 3s Charge phase with Purple color shift and 2.5x body expansion.
  - Rotation pause during charge for maximum intimidation.
  - 4s Cooldown after firing to balance difficulty.
- **Sentry Beam Refactor**: Migrated beam rendering to `InstancedMesh` for 60Hz frame-perfect synchronization.
- **Beam Offset Logic**: Visual beam now originates 1.2m forward, preventing self-clipping stubby beams.

### Changed
- **Ghost Mode Polish**:
  - Remapped Controls: RMB=Sprint, LeftClick=Pulse Scan (Weaponry disabled).
  - Level 10 Override: Boss is removed; a clear "Speed Corridor" leads to an auto-unlocked portal.
  - Auto-Loot: Collection time reduced to 0.2s for high-velocity runs.
- **Sprint Mechanics**: Implemented dynamic M-RAM cost: `(Regen Rate + 1) - Efficiency Level`.
- **M-RAM Safety**: Added guardrail to prevent negative M-RAM values during rapid consumption.
- **Level 7 Stability**: Fixed persistent strobe/glitch effect that would carry over to other floors or game states.

### Technical (Logging & Auth Repairs)
- **Auth Flow 2.0**: Split Login/Register flows with proper Email & Username support.
- **Magic Link Auto-Detection**: Fixed issue where email confirmation links would get stuck at the login gate instead of proceeding to profile/ticket steps.
- **Leaderboard UX**: Added "ALL" mode filter as default; fixed sorting logic for non-score metrics.
- **Leaderboard Integration**: Posed-based tracking for `damage_taken`, `mram_used`, and `ghost_score`.
- **Timer Fix**: `RunTracker` now correctly respects Pause states (Inventory/Lore).
- **Profile Persistence**: Switched `ProfileCard` to real-time Supabase RPC calls instead of LocalStorage.
- Optimized `MobManager` render loop by nesting visual logic directly within instance updates.
- Added dynamic `PointLight` flares for firing mobs.

---

## [0.10.0] - 2026-02-02

### Added - THE GRADIENT LEDGER SYSTEM
- **Supabase Backend**: Persistence for Leaderboards and Player Profiles.
- **Splash Screen**: Full menu system with mode selection (Normal/Hardcore/True Ghost)
- **Profile Card**: Hacker ID display with badges, resonance bar, and lifetime stats
- **Leaderboard Panel**: Top 100 rankings with emphasis on Top 3/10
- **Game Modes**:
  - **Normal**: Full game experience with mobs and RPG mechanics
  - **Hardcore**: Permadeath mode - survival is the only priority.
  - **True Ghost**: Pure speedrun mode - no mobs, no combat, just pure movement.
- **Scoring System**: Distinct algorithms for Velocity, Stability, and Ghost runs.
- **Badge System**: Achievement tracking for explorer, speedrunner, and veteran roles.
- **Mini-Map (Tactical Nav)**: Implemented 2D top-down view with Fog of War and Scanner integration.

### Technical
- Implemented `SpectralScroll.jsx` for data node interaction.
- Created `RunTracker.jsx` for comprehensive session logging.
- Created `scoring.js` for algorithmic score evaluation.
- Implemented `AuthOverlay.jsx` for invitation-only access.
- Corrected global case-sensitive import paths for Linux/Cloudflare compatibility.
- Implemented `FastStateRef` to optimize player position telemetry.

---

## [0.9.2] - Previous Build

### Features
- Sector 01-02 complete (Floors 1-25)
- Boss fight (IO_SENTINEL)
- Mini-map system with fog of war
- Data cache loot system
- Fragment collection and lore overlays
- Bestiary test room (Dev tool)
- Save/Load system
- Trinity RPG mechanics (Integrity, M-RAM, Clock Speed)
- Ethical resonance system (Cyan ↔ Magenta)
- Level progression (XP, skill unlocks at Level 5)
- Scanner system (vulnerability mechanics)
- Shred V2 (Worm infection)
- Mob AI (Mites, Wisps, Hunters, Sentries)
