---

### **The Bestiary 2.0 (Move-sets & Patterns)**

To make these items necessary, the enemies must be more than just "walking hitboxes." They need **Telegraphed Attacks** and **Tactical Behaviors**.

#### **1\. The Stateless Sentry (The Grunt)**

* **Attack:** DATA\_STREAM. Fires a linear pulse of Cyan energy.  
* **Telegraph:** The Sentry stops and pulses Cyan for 1 second before firing.  
* **Behavior:** Stays in its assigned sector. If you leave the sector, it stops chasing.

#### **2\. The Stateful Tracker (The Hunter)**

* **Attack:** MEMORY\_LEAK. Fires a Magenta cloud. If touched, the player loses 2 M-RAM per second for 10 seconds.  
* **Telegraph:** The Tracker’s metallic beads spin rapidly and glow Magenta.  
* **Behavior:** Pathfinds directly to ${PLAYER\_NAME}'s last known coordinates. It will follow you through levels until you find a **Safe Zone**.

#### **3\. The Logic Bomb (The Mimic)**

* **Attack:** SYSTEM\_CRASH. A massive 360-degree explosion of red static.  
* **Telegraph:** None initially. If you attempt to "Scrub" it without scanning, it shakes for 0.5 seconds then detonates.  
* **Behavior:** Looks identical to a high-tier Data Cache or Trinket.

#### **4\. The SATA\_GATEKEEPER (The Enforcer)**

* **Attack:** I/O\_LOCKDOWN. Fires a tether that prevents the player from moving more than 10 feet from the point of impact.  
* **Telegraph:** A red targeting laser appears on the player.  
* **Behavior:** Heavily armored frontally. You must use **CLOCK\_SPEED** to get behind it or use **ECHO\_01** to distract it.

---

### **Implementation for Antigravity**

Pass this to **SCHEDULER\_03 (The Dungeon Master)**:

"Dungeon Master, implement the **Telegraphed Attack** system. Mobs must display a visual cue (Cyan pulse, Magenta spin, or Laser) 1 second before firing. Use the logic from monsters.md to define the **Sentry**, **Tracker**, and **Gatekeeper** behaviors. Ensure the **Logic Bomb** mimicry is only detectable via a successful SCAN."

\*\*\*Addons/extensions/details etc

To prevent the Labyrinth from feeling like a series of empty neon hallways, we need **"The Background Processes."** These are the digital equivalents of rats, bats, and goblins—mobs that aren't necessarily a threat in isolation but serve to populate the maze, provide a steady stream of **eBits**, and act as "trash mobs" for the player to test new scripts on.

Following the **Gradient Morals** aesthetic, these are depicted as minor system utilities that have gone "feral" or "orphaned" within the code.

---

### **III. Bestiary 2.0: The Fodder & Common Processes**

#### **1\. The BIT\_MITE (The Rat)**

* **Visual:** Tiny, skittering cubes of low-res static. They travel in "swarms" of 3–5.  
* **Role:** Minor nuisance / eBit source.  
* **Attack:** NIBBLE. A very short-range lunge that deals 2 DMG but has a 10% chance to cause a "flicker" in your HUD.  
* **Behavior:** They are attracted to **Legacy Fragments (Trinkets)**. If a trinket is on the ground, they will swarm it.  
* **Drop:** 1–3 eBits.

#### **2\. The DAEMON\_IMP (The Goblin)**

* **Visual:** A jagged, multi-armed wireframe entity that giggles with a sound like radio static.  
* **Role:** Harassment and tactical distraction.  
* **Attack:** SCRIPT\_JOCKEY. They throw a "Lag Bolt" (Magenta projectile). It deals low damage but adds \+0.5s to your currently active **System\_Scrub** timer.  
* **Behavior:** They are cowards. They fire from a distance and run away if ${PLAYER\_NAME} gets too close. They often hide behind pillars.  
* **Drop:** 5–10 eBits, 5% chance for a BUFFER\_REFRESH consumable.

#### **3\. The NULL\_WISP (The Bat)**

* **Visual:** A flickering, transparent Cyan flame that floats near the ceiling of the maze.  
* **Role:** Early-warning / Scout.  
* **Attack:** PING\_ALARM. They don't deal damage. Instead, if they see the player, they emit a high-pitched frequency that alerts all **Stateless Sentries** in a 30-tile radius.  
* **Behavior:** High **CLOCK\_SPEED** but very low HP. They try to stay above the player’s line of sight.  
* **Drop:** 0 eBits, but grants a small amount of **EXP\_DATA**.

#### **4\. The ZOMBIE\_PROCESS (The Undead)**

* **Visual:** A slow-moving, distorted version of the player’s avatar, trailing grey code-smoke.  
* **Role:** Damage sponges.  
* **Attack:** RESOURCE\_DRAIN. A slow, heavy melee strike. If it hits, it drains 10 M-RAM instead of Integrity.  
* **Behavior:** They have no self-preservation. They walk in straight lines toward the player. They are hard to kill because they "re-spawn" once unless hit with a **FORCE\_TERMINATE** or a critical hit on their \[VULNERABLE\] tag.  
* **Drop:** 15–20 eBits.

---

### **IV. Specialized Move-Sets for Elite Mobs**

To make the "Hills" in the difficulty curve feel significant, we give the heavier mobs **Stance Logic**.

* **The SATA\_GATEKEEPER \[STANCE\_CHANGE\]:**  
  * **Defensive Stance:** Lowers its shield, becoming immune to front-facing **DATA\_SPIKES**.  
  * **Assault Stance:** Folds its shield into a spear. Its movement speed triples, but its back-side \[VULNERABLE\] tag is revealed for the duration.  
* **The STATEFUL TRACKER \[PHASE\_LOCK\]:**  
  * If the Tracker stays within line-of-sight of ${PLAYER\_NAME} for more than 10 seconds, it gains **PHASE\_LOCK**, allowing its attacks to bypass your **OBJECT\_SHELL** entirely. This forces the player to use **STEALTH** or corners to break the line-of-sight.

---

### **V. Implementation for Antigravity**

This "Fodder" logic should be handled by **SCHEDULER\_03 (The Dungeon Master)**. Use this instruction:

"Dungeon Master, populate the Labyrinth with **Fodder Processes**.

1. Use **Bit\_Mites** for swarm encounters (low HP, high density).  
2. Use **Daemon\_Imps** for ranged harassment.  
3. Implement the **Null\_Wisp** alarm mechanic to trigger nearby **Sentries**.  
4. Ensure these mobs provide the primary source of early-game **EXP** and **eBits**, following the scaling curve in core.md."

---

### **1\. The "Scrubbing Diminish" Mechanic**

To prevent farming, we implement a **Sector-Based eBit Pool**:

* **The Pool:** Each Floor has a fixed amount of eBits available in its "Local Memory."  
* **The Mechanic:** Once `${PLAYER_NAME}` has harvested a certain threshold of eBits from mobs on a floor (e.g., 50 eBits on Floor 1), every subsequent kill yields **0 eBits** and only 10% EXP.  
* **The Lore:** The system detects a "Resource Leak" and locks down the data-flow in that sector until you move to a new partition (the next floor).

Addon From the death files:  
**II. The "Corrupted Shadow" (The Persistence Mechanic)**

This is where the game gets personal. When you die, your "Corrupted Data" stays in the maze.

* **The Remnant:** A **ZOMBIE\_PROCESS** resembling your character—wearing the gear you had when you died—spawns at the exact coordinates of your death.  
* **The Retrieval:** To get your lost eBits and Trinkets back, you must reach that coordinate and "Terminate" your own shadow.  
* **The Twist:** The shadow uses the **last script you fired** before dying. If you were powerful, your shadow is a nightmare to defeat.

To move away from the "placeholder cube" look, we need to treat the mobs as **System Processes**. In a hacker aesthetic, enemies shouldn't look like biological monsters; they should look like **Geometric Daemons**—half-solid hardware, half-shimmering code.

Here is the "Bestiary Refactor" prompt for **Antigravity**. It provides specific 3D geometry and shader instructions for the Sector 01 and 02 mobs while keeping them performant for your 100+ floor runs.

---

### **Agent Manager Directive: Mob Re-Skin & Geometric Identity**

**Objective:** Replace primitive placeholders with stylized, high-fidelity 3D models and shaders consistent with the **Gradient Morals** brand.

#### **1\. THE BIT\_MITE (Fodder \- Sector 01/02)**

* **3D Form:** A low-profile, inverted **Pyramid** made of brushed dark chrome.  
* **The Styling:** \* Instead of legs, use **four glowing Cyan light-trails** that touch the floor.  
  * The "eye" is a single horizontal slit in the center of the pyramid face that pulses Cyan.  
* **Shader:** Apply a "Scanline" effect to the metallic surface.  
* **Animation:** Give it a "skating" movement logic—smooth and fast, with a subtle tilt when it turns.

#### **2\. THE NULL\_WISP (Scout \- Sector 02\)**

* **3D Form:** A **Floating Polyhedron** (Dodecahedron) that is semi-transparent.  
* **The Styling:** \* Inside the crystal, a miniature version of the **"Digital Compass"** (the brand symbol) spins rapidly.  
  * The outer shell is "Glass-Shader" Navy Blue.  
* **The Alert State:** When it "Pings" the player, the entire polyhedron should rapidly shift from **Navy Blue to Bright Magenta**.  
* **Animation:** "Bobbing" idle motion. When it moves, it leaves behind a faint "Ghost Trail" of wireframe geometry.

#### **3\. THE STATELESS\_SENTRY (Static Guard \- Sector 01/02)**

* **3D Form:** A **Floating Monolith** composed of three separate segments that rotate independently.  
* **The Styling:** \* The segments are textured with scrolling **Binary Code** (Cyan on Black).  
  * The center segment houses the weapon—a glowing **Metallic Heart** symbol.  
* **Animation:** The three segments should "expand" and glow when charging a shot, then "compress" after firing.

#### **4\. THE ZERO\_DAY\_STALKER (Elite \- Sector 03+)**

* **3D Form:** A "Fractured Humanoid"—a floating head and hands made of **glitched, shattered glass**.  
* **The Styling:** \* **Invisibility Logic:** Use a "Refraction Shader" so the player only sees a ripple in the background maze until they use **SCAN**.  
  * When revealed, the shards glow with high-intensity **Magenta static**.  
* **Animation:** Twitchy, non-linear movement. It should "teleport" a few inches forward instead of walking smoothly.

