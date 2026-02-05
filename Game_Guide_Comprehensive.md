# CyberSynthe: The Operator's Manual

## 01. The Universe
**CyberSynthe** is a tactical roguelite set inside a decaying mainframe known as "The Labyrinth." You play as **NULL_POINTER**, a ghost process attempting to keep the system running while uncovering why it's falling apart.

### The Sectors
The Labyrinth is divided into sectors, each with unique visual identities and narrative themes:
*   **Sector 01 (Floors 1-25)**: The Morgue. Cold, blue/cyan aesthetics. Where dead data goes to be forgotten.
*   **Sector 02 (Floors 26-50)**: The Factory. Orange/Industrial. Where data is processed.
*   **Sector 03 (Floors 51-75)**: The Archives. Purple/Glitch. Corrupted memory banks.
*   **Sector 04 (Floors 76-100)**: The Kernel. Red/Critical. The core of the system.

## 02. The Bestiary (Threat Assessment)
Hostile processes roam the maze. Understanding them is key to survival.

### MINIONS
*   **Bit-Mite**: Small, pyramid-shaped scrubbers.
    *   **Behavior**: Swarm tactics.
    *   **Attack**: `NIBBLE` (Melee, 2 DMG). Causes `HULL_BREACH`.
    *   **Weakness**: Low HP, easily kited.
*   **Null-Wisp**: Floating surveillance orbs.
    *   **Behavior**: Scouts. They orbit the player and alert others.
    *   **Attack**: `PING_ALARM` (Alerts nearby mobs).
    *   **Weakness**: Does not deal direct damage directly.
*   **Hunter**: Stealth assault units.
    *   **Behavior**: Flankers. Uses camouflage.
    *   **Attack**: `MEMORY_LEAK` (Drains M-RAM, 5 RAM DMG).
    *   **Weakness**: Visible when attacking.
*   **Stateless Sentry**: Stationary turrets.
    *   **Behavior**: Area denial.
    *   **Attack**: `DATA_STREAM` (Beam, 10 DMG). Telegraphs with a charge-up.
    *   **Weakness**: Stationary. Can be line-of-sighted.

### BOSSES
*   **IO_SENTINEL (Level 10)**: The Gatekeeper.
    *   **Phase 1**: Sits in center, rotates.
    *   **Phase 2**: Becomes mobile, chases player.
    *   **Attacks**: `DATA_PURGE` (Massive Beam), `MINION_SPAWN`.

## 03. Core Mechanics

### Resources
*   **INTEGRITY (HP)**: Your structural health. 0 = Deletion (Game Over).
*   **M-RAM (Stamina)**: Mental RAM. Used for abilities and movement. Regenerates based on Clock Speed.
*   **CLOCK SPEED**: Your action speed. Affects movement, attack rate, and regeneration.
*   **eBITS**: Currency found in caches or from enemies.

### Movement & Combat
*   **WASD**: Move.
*   **SPACE**: Jump.
*   **SHIFT**: Sprint (Costs M-RAM).
*   **LMB**: Primary Fire (Data Spike).
*   **RMB (Hold)**: Charge Attack (Heavy Damage).
*   **Q**: Interact / Unlock Kernel.
*   **R**: Reload / Context Action.

### The Loot System (L1 Cache)
Caches are scattered throughout the maze. Accessing them triggers the **Spectral Scroll** minigame.

#### Spectral Scroll (Decryption)
A 4-roller lock system. Match the tumbling numbers to the Target Code.
*   **Targets**: Shown at the top (e.g., [4] [2] [9] [1]).
*   **Controls**: Click rollers or press `1`, `2`, `3`, `4` to lock them.
*   **Outcomes**:
    *   **CRITICAL_SYNC**: Perfect Match. Reward: **2x Loot + Buffer Overclocker**.
    *   **STABLE_HANDSHAKE**: Near Match (off by 1 allowed). Reward: **Standard Loot**.
    *   **LOGIC_BREACH**: Missed. Penalty: **15 DMG + Bit-Mite Spawn**.
    *   **FATAL_ERROR**: Total Miss. Penalty: **30 DMG + Cache Destoyed**.

### Loot Types
*   **E-Bit Cluster**: Currency.
*   **M-RAM Injector**: Restores Integrity/RAM. Use with `Quick Slot`.
*   **Logic Fragment**: Story lore item.
*   **Buffer Overclocker**: Buffs Clock Speed.
*   **Ghost Protocol**: Temporary Invisibility.
*   **Kernel Spike**: Instant Kill next target.

## 04. Game Modes
*   **Normal**: Standard Run. Progression saves.
*   **Elite**: Permadeath.
*   **Ghost**: Exploration Mode. No combat, infinite resources.
*   **Bestiary (Floor 999)**: Examine mob models in stasis.

## 05. Scoring
You are rated on "Logic Alignment" (Cyan vs Magenta).
*   **Cyan (Order)**: Efficient play, full clears, perfect decryption.
*   **Magenta (Chaos)**: Speedrunning, skipping caches, taking damage.

## 06. Tips from the Engineer
1.  *Don't rush the decryption.* A Logic Breach spawns a mob right on top of you.
2.  *Watch your RAM.* If you bottom out, you can't run or shoot.
3.  *Sentries track slowly.* Circle strafe them to avoid the beam.
4.  *Read the Fragments.* The story is not told, it is found.

---
*System Version: 0.9.4 (Beta)*
*Log End.*
