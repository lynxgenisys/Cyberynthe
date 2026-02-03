### **\#6: Procedural Narrative & Quest Generators**

To make the maze feel "lived in," we need a way for the agents to spawn **Contextual Missions** that don't feel like scripted "side quests."

#### **I. The "Unresolved Request" (Random Missions)**

These appear as flickering terminals or "Orphaned Subroutines" in dead ends.

* **The Escort:** "A logic-gate is stuck. Guide this `PACKET_LINK` to the Sector Hub." (Reward: Temporary M-RAM boost).  
* **The De-frag:** "This sector is fragmented. Stand in the 3 marked zones for 10 seconds each to stabilize the code." (Reward: A rare Tier-appropriate Consumable).  
* **The Bounty:** "A `STATEFUL_TRACKER` has stolen a Kernel Token. Locate and delete it." (Reward: Access to a hidden cache).

#### **II. Moral Alignment Tracking (The Gradient)**

Every choice—like helping a program vs. de-compiling it for eBits—shifts your **Moral Frequency**.

* **Cyan Lean (Efficiency):** Your **System\_Scrub** recovers 5% faster, but **ECHO\_01**'s detection radius is smaller.  
* **Magenta Lean (Chaos):** Your **Scripts** deal 10% more damage, but you attract **Sentries** from further away.

---

### **Implementation for Antigravity**

Pass this to  **`SCHEDULER_03` (The Dungeon Master)**:

"Dungeon Master, initialize the **Procedural Quest Generator**. Use the 'Unresolved Request' templates to spawn random objectives in the maze dead ends. Ensure the **Moral Frequency** (Cyan vs. Magenta) is updated based on quest completion choices."

Alterations/addons/adjustments:

Expanding the side quests and visual engineering will bridge the gap between "concept" and "gameplay." These quests add mechanical depth to the procedural generation, while the visual specs provide the textures and atmosphere for the Antigravity agents to execute.

### **I. Expanded Side Quests: "System Directives"**

Quests are generated as **Unresolved Requests** at terminals. To maintain the adrenaline, high-level quests often have a "Corruption Timer."

#### **Tier 1: Guest & Kernel (Levels 1–250)**

* **Protocol: `CACHE_SYNC` (Data Recovery):**  
  * **Task:** A `Legacy Fragment` has been split into three `Fragment_Sectors`. You must find all three in different dead ends and bring them to the exit portal.  
  * **Risk:** Carrying fragments reduces `CLOCK_SPEED` by 5% per sector.  
* **Protocol: `FIREWALL_STRESS_TEST` (Combat Trials):**  
  * **Task:** Survive in a specific 5x5 room for 60 seconds while `Stateless Sentries` spawn continuously.  
  * **Reward:** A temporary \+20% `M-RAM_REGEN` for the next 5 floors.

#### **Tier 2: Root & Void (Levels 250–750)**

* **Protocol: `RECURSIVE_BREACH` (Remote Hack):**  
  * **Task:** Locate a "Locked Folder" (a special door). You must deploy `ECHO_01` into a nearby vent to find the `DE-CRYPT_KEY` while defending yourself from `Stateful Trackers`.  
  * **Breakthrough Logic:** Requires `MULTI-THREAD_ECHO` to perform effectively.  
* **Protocol: `LEAKING_LOGIC_CONTAINMENT` (Static Cleanup):**  
  * **Task:** A patch of `Bit-Rot` is spreading. You must stand on the "Origin Node" and channel your M-RAM to "Overwrite" it.  
  * **Risk:** You are immobile and defenseless for 15 seconds.

#### **Tier 3: The Singularity (Levels 750–1000+)**

* **Protocol: `SEGMENT_REWRITE` (Architect Challenge):**  
  * **Task:** A 5x5 section of the maze is "Illegal Code." You must use your terminal to re-arrange the tiles (mini-puzzle) to create a path through to the exit.  
* **Protocol: `SINGULARITY_PULSE` (Boss Hunt):**  
  * **Task:** A high-level `[PROTECTED]` anomaly has spawned somewhere on the floor. It is slowly deleting eBits from your inventory until it is terminated.

Here is the expanded **Anomaly Manifest**, categorized by type. For your **Antigravity** agents, these will be stored in a `logic/quests.json` file. Each floor, the `SCHEDULER_03` agent will roll a `System_Check`:

* **30% Chance:** Anomaly detected.  
* **10% Chance (Elite Mode):** Double Anomaly (two conflicting objectives).

---

### **I. The Expanded Anomaly Manifest**

#### **A. Navigation & Spatial Quests (The Pathfinder)**

1. **`PING_STORM`**: A sequence of 5 nodes appears on the HUD. You must visit them in the exact order within a time limit to "Calibrate" the floor's map.  
2. **`VOID_STEP`**: A specific 10x10 area of the maze has "Invisible Walls." You must use your **ECHO\_01** drone to bump into them and map the path for your character.  
3. **`GRAVITY_LEAK`**: The floor tiles in one quadrant are missing. You must jump/dash across moving "Data Platforms."  
4. **`GHOST_CHASE`**: A wireframe "Packet" is running away. Chase and "Collide" with it three times to harvest its data.  
5. **`SUDO_KEY_HUNT`**: The exit is locked. Three `Sentry` mobs on the floor have "Key Fragments." You must find and delete them.

#### **B. Combat & Aggression Quests (The Enforcer)**

6. **`ZERO_WASTE`**: Complete the floor using only 5 **DATA\_SPIKE** casts.  
7. **`PACIFIST_PROTOCOL`**: Reach the exit without deleting a single mob. (Requires heavy use of **STEALTH**).  
8. **`OVERCLOCK_GAUNTLET`**: For 60 seconds, your damage is tripled, but your **CORE\_INTEGRITY** drains by 1 per second. Kill 10 mobs to stop the drain.  
9. **`PRIORITY_TARGET`**: A "Golden Sentry" is on the floor. It doesn't attack but runs fast. If it reaches a "Terminal," it alerts every mob on the floor to your location.  
10. **`MIRROR_MATCH`**: A `ZOMBIE_PROCESS` spawns immediately. It has your exact current stats. Kill your "Reflection" to earn a rare Hardware Port.

#### **C. Collection & Resource Quests (The Archivist)**

11. **`BIT_DRAIN`**: You start the floor with 0 M-RAM. You must collect "Energy Leaks" scattered in dead ends to power your scripts.  
12. **`TRINKET_HEIST`**: A rare `Legacy Fragment` is located inside a room guarded by 4 **SATA\_GATEKEEPERS**.  
13. **`RESOURCE_RE-ROUTE`**: You find a terminal that asks you to "Donate" 25% of your current eBits to repair a local subroutine. (Moral Choice: Cyan vs. Magenta).  
14. **`SILENT_AUCTION`**: A hidden merchant appears for 2 minutes only. He only takes **Neural Shards** found *on this specific floor*.  
15. **`FRAG_SYNC`**: You find a "Broken Trinket." You must carry it to 3 different "Repair Stations" in the maze before you can exit.

#### **D. Environmental & Glitch Quests (The Hacker)**

16. **`BLACKOUT`**: The maze lighting goes to 5%. You can only see 2 tiles ahead unless you use **SCAN** to pulse the lights.  
17. **`INPUT_LAG`**: A virus has infected your movement. Every 5 seconds, your "Left" and "Right" controls swap. Reach the exit to "Purge" the virus.  
18. **`RECURSIVE_WALLS`**: Every time you kill a mob, a wall nearby disappears, and a new one appears elsewhere. The maze is alive.  
19. **`DATA_VOLCANO`**: A specific tile is "Erupting" Magenta code. If it reaches 100% saturation, the floor becomes a `Bit-Rot` zone. Cap the leak.  
20. **`LOGIC_GATE_PUZZLE`**: You find a massive door with a 3x3 grid of beads. You must spin them to match the pattern found on the floor's "Kernel Log."

---

### **II. Elite Hacker Tier (High-Level Only / 250+)**

21. **`CORE_OVERHEAT`**: You cannot stand still for more than 2 seconds, or you take damage.  
22. **`PERM_SCAN`**: Your **SCAN** is forced "ON," locking 40 M-RAM. You must survive the floor with a limited pool.  
23. **`PHANTOM_PING`**: Mobs are invisible until they are within 1 tile of you.  
24. **`SYSTEM_MIGRATION`**: You have 3 minutes to find the exit, or the floor "De-compiles" with you in it (Instant Death in Elite Mode).  
25. **`FRIENDLY_FIRE_UPDATE`**: Your **ECHO\_01** drone's scripts can now hit *you*. Watch your positioning.

---

### **III. The Quest Randomization Engine**

For **Antigravity**, we use a "Probability Matrix" to ensure variety.

**Agent Implementation Task for `SCHEDULER_03`:**

"Dungeon Master, implement the **Anomaly Probability Matrix**.

1. At the start of each floor, roll a `d100`. If `> 70`, trigger an anomaly.  
2. Cross-reference the player's level with the **Quest Tier**. (Lvl 1–250 \= T1, 250+ \= Elite Tier).  
3. Randomly select an anomaly from the `quests.json` pool.  
4. If an anomaly is active, display the `[UNRESOLVED_REQUEST]` notification in Magenta on the HUD."

### **I. The "Incentive" System: Optional Protocols**

Instead of forced events, anomalies now appear as **System Offers** via a terminal notification at the start of a floor.

* **The Trigger:** Upon floor entry, a prompt flickers: `[INPUT_REQUIRED]: SYSTEM_SCHEDULER has authorized a PRIORITY_DIRECTIVE. Accept? (Y/N)`  
* **The "Incentive":** If you accept, you see the goal and the reward (e.g., \+50 eBits, a rare Consumable, or a permanent \+1 to a stat).  
* **The "Punishment" (Failure):** If you fail the objective (e.g., you don't find all fragments before the timer hits zero), you don't just lose the reward; you face a **System Penalty**.  
  * **Example Penalties:** \-10% Max M-RAM for the next 3 floors, a "Slow" debuff, or spawning an extra **Stateful Tracker** in the next floor.

---

### **II. The Elite Hacker HUD Design**

This HUD is designed to be scannable at high speeds for speedrunners while providing deep data for the Archivist.

#### **1\. The Trinity Gauges (Top Left)**

The core resources are displayed using the **Three Metallic Beads** symbolism.

* **Integrity (Heart Icon):** A Cyan radial bar that "cracks" and bleeds Magenta as health drops.  
* **M-RAM (Brain Icon):** A pulsing Blue bar. When a script is fired, the used portion turns "Grey" (Scrubbing) and slowly refills.  
* **Clock Speed (Compass Icon):** A small digital readout of your current GHz (speed) and the three beads spinning in the center.

#### **2\. The Velocity Bar (Top Center)**

Designed for the speedrunning element.

* **Visual:** A horizontal bar with a slider.  
* **Logic:** A **Cyan Marker** represents your current progress through the floor. A **Ghost Magenta Marker** shows where the "Record Holder" was at this exact timestamp. If you are behind, the bar glows faint Red; if ahead, it flashes Cyan.

#### **3\. The Directive Tracker (Right Side)**

This is where the **Optional Quests** live.

* **Status:** `[DIRECTIVE_IDLE]` when no quest is active.  
* **Active:** Displays the accepted goal (e.g., `SCRUB_NODES: 0/3`) and a countdown timer if applicable.  
* **Failure Warning:** If the timer reaches 10%, the text glitches and turns bright Magenta.

#### **4\. The Moral Resonance Heat-map (Bottom Right)**

A small triangular graph (The "Gradient").

* **Left Vertex:** Efficiency (Cyan).  
* **Right Vertex:** Innovation/Chaos (Magenta).  
* **Top Vertex:** Neutral/Objective (White).  
* **The Dot:** A single cursor moves across this space based on your quest choices and de-compile habits, showing your current "System Reputation."

---

### **II. Directive Failure Penalties**

Since all quests are now **Optional Incentives**, the failure penalty must be significant enough to make the player hesitate before typing Y.

| Penalty Name | Technical Effect | Duration |
| :---- | :---- | :---- |
| **PACKET\_LOSS** | Disables one random active script (Thread). | 2 Floors |
| **SYSTEM\_LAG** | Reduces **CLOCK\_SPEED** by 15%. | 3 Floors |
| **TRACE\_DETECTED** | Spawns an additional **Stateful Tracker** immediately. | Permanent (Current Floor) |
| **M-RAM\_LEAK** | Reduces **M-RAM\_REGEN** by 0.5/sec. | 5 Floors |
| **CORRUPTED\_CACHE** | Locks the player's inventory; cannot use consumables. | 1 Floor |

**Instruction for `LOGIC_BREACH_02` (Engineer):**

"Engineer, implement the **Directives Prompt**. Ensure the HUD displays the failure penalty clearly. If the player declines, trigger the 'Shatter' animation in the UI. Hard-code the **Failure Penalty** effects to expire based on the floor-count."

### **III. HUD Finalization: The "Directive Terminal"**

**To integrate the Accept/Decline logic, we use a Contextual Pop-up that overlays the center of the HUD.**

* **The Prompt: \> \[SEC\_ALERT\]: ADMIN\_OVERRIDE\_OFFER**  
  **TASK: Terminate 5 'Bit\_Mites' with BIT\_FLIP.**  
  **INCENTIVE: \+1.5 GHz CLOCK\_SPEED (PERMANENT)**  
  **PUNALTY: SYSTEM\_LAG (3 FLOORS)**  
  **\[ACCEPT: Y / DECLINE: N\]**  
* **The Visuals: If accepted, the Directive name stays pinned under your M-RAM bar in a pulsing Magenta frame. If declined, the text "shatters" into static and disappears.**