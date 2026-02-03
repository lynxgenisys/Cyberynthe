# CyberSynthe Movement & Speed Mechanics
**Date**: 2026-02-02
**Version**: v0.10.2 (Tuned)

## 📌 Summary
The player's speed is derived from a **Base Value** multiplied by a factor determined by the **Cycle Speed** (Clock Speed) stat.

## ⚙️ The Formula (3x Scaling)

> **Speed = Base * (1 + (ClockSpeed * 3) / 100)**

*   **Base Speed**: `3.0 m/s` (Tactical Pace)
*   **Scaling**: Each **1 Point** of Clock Speed adds **3%** to your total speed.

## 📊 Speed Progression Chart

| Clock Speed Stat | Multiplier | Movement Speed (m/s) | Relative to Base | Weapon Charge Time |
| :--- | :--- | :--- | :--- | :--- |
| **0** (Theoretical) | 1.00x | **3.00 m/s** | 100% | 1.00s |
| **5** (Starter) | 1.15x | **3.45 m/s** | 115% | ~0.87s |
| **10** | 1.30x | **3.90 m/s** | 130% | ~0.77s |
| **15** | 1.45x | **4.35 m/s** | 145% | ~0.69s |
| **20** | 1.60x | **4.80 m/s** | 160% | ~0.63s |
| **25** | 1.75x | **5.25 m/s** | 175% | ~0.57s |
| **30** | 1.90x | **5.70 m/s** | 190% | ~0.53s |
| **50** | 2.50x | **7.50 m/s** | 250% | ~0.40s |

## 📝 Notes
*   **Clock Speed** is the primary "Agility" stat.
*   It affects **Movement Speed**, **Weapon Charge Rate**, and **M-RAM Scrubbing Efficiency**.
*   The current tuning (3x scaling) makes every upgrade point feel significant.
