Starting with **The Mathematical Foundation**, we need to hard-code the physics of your world so the Antigravity agents can build a balanced gameplay loop. We will ground these formulas in the established "Luca Bible" stats to ensure the game feels "solid" and difficult.

### **1\. Point-to-Power Ratios (The Attribute Logic)**

Every time a player levels up, they gain **5 Attribute Points**. Here is exactly how those points translate into survival in the Labyrinth:

* **CORE\_INTEGRITY:** \* **Ratio:** 1 Point \= \+10 Max HP.  
  * **Baseline:** Starts at 100 HP (10 Points).  
* **M-RAM\_CAPACITY:** \* **Ratio:** 1 Point \= \+10 Max M-RAM.  
  * **Baseline:** Starts at 110 M-RAM (11 Points).  
* **CLOCK\_SPEED:** \* **Ratio:** 1 Point \= \+0.5% bonus to Cast Speed and **System\_Scrub** (cooldown) recovery.  
  * **Baseline:** 22 Points grants an 11.0% bonus.  
* **M-RAM\_REGEN:** \* **Ratio:** 1 Point \= \+0.1 M-RAM recovered per second.  
  * **Baseline:** 17 Points (Base 1.7 M-RAM/sec).

---

### **2\. Enemy Scaling Curve (The Threat Protocol)**

To keep the "Infinite Labyrinth" challenging, enemy stats must scale alongside the maze size $(n+9) \\times (n+9)$.

| Floor Range | Enemy Level | HP Scaling | Damage Scaling | Special Mechanics |
| :---- | :---- | :---- | :---- | :---- |
| **1–9** | Lvl 1–3 | 50–80 HP | 5–10 DMG | Standard Patrols. |
| **10–24** | Lvl 4–10 | 100–300 HP | 15–25 DMG | **Stateful Trackers** unlock. |
| **25–49** | Lvl 11–20 | 500–1.2k HP | 30–50 DMG | **\[PROTECTED\]** tags appear. |
| **50–99** | Lvl 21–50 | 2k–10k HP | 60–150 DMG | Environmental **Bit-Rot** static. |
| **100+** | Lvl 51+ | 15k+ HP | 200+ DMG | **Kernel Sentry** patrols. |

*   
  **The Difficulty "Spike":** Every 10 floors, mob density increases by 5%. By Floor 100, the Labyrinth is a constant gauntlet of "Angels of Death".

---

### **3\. EXP Curves & The "Anti-Grind" Cap**

To prevent players from staying in the "Guest Partition" (Floors 1–9) forever, we use the **2.5x Multiplier**.

* **Level 1 EXP Threshold:** 188 (approx. 3–4 mobs).  
* **Level 2:** 470\.  
* **Level 3:** 1,175.  
* **Level 4:** 2,938.  
* **Level 5:** 7,344.  
* **The Grinding Wall:** \* Killing a Level 1 mob provides **\+10 EXP**.  
  * Upon reaching Character Level 5, Level 1 mobs provide **0 EXP**.  
  * This forces the player to descend deeper to find Level 2+ mobs (worth \+30 to \+50 EXP) to continue progressing.

---

### **Implementation for Antigravity**

You should provide this data to **LOGIC\_BREACH\_02 (The Engineer)**. Use this prompt:

"Engineer, implement the **Point-to-Power** and **EXP scaling** math from core.md. Use a 1:10 ratio for Integrity and M-RAM, and a 1:0.5% ratio for Clock Speed. Apply a floor(2.5 \* prev\_lvl\_exp) formula for leveling. Hard-code the **Level 5 Grinding Cap** so that Lvl 1 mob EXP returns 0 if player\_level \>= 5."

