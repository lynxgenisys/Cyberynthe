# CHANGELOG - CYBERYNTHE

## [0.10.0] - 2026-02-02

### Added - THE GRADIENT LEDGER SYSTEM
- **Splash Screen**: Full menu system with mode selection (Normal/Hardcore/True Ghost)
- **Profile Card**: Hacker ID display with badges, resonance bar, and lifetime stats
- **Leaderboard Panel**: Top 100 rankings with emphasis on Top 3/10
- **Game Modes**:
  - **Normal**: Full game experience with mobs and RPG mechanics
  - **Hardcore**: Permadeath mode, death ends run permanently
  - **True Ghost**: Pure speedrun mode - no mobs, no combat, maze navigation only
- **Scoring System**:
  - Velocity Score: Time-based performance across floors
  - Stability Score: Damage-free perfect runs
  - Ghost Score: Speed × Depth for speedrun mode
- **Run Tracker**: Automatic floor event logging and score calculation
- **Badge System**: Permanent achievement tracking (Player, Explorer, Deep Diver, Void Walker, etc.)

### Changed
- Ghost mode disables mobs, Trinity HUD, and all combat systems
- Game now starts in Splash Screen instead of old menu
- GameContext updated with scoring tracking fields

### Technical
- Created `SplashScreen.jsx`, `ProfileCard.jsx`, `LeaderboardPanel.jsx`
- Created `RunTracker.jsx` for score tracking
- Created `scoring.js` utilities for calculations
- Updated `App.jsx` to integrate new menu system
- Updated `GameContext.jsx` with game mode and scoring fields
- Updated `MobManager.jsx` to disable in ghost mode
- Updated `TrinityHUD.jsx` to hide in ghost mode

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
