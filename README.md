# 🌌 Cyberynthe

**Cyberynthe** is a high-speed, 3D dungeon crawler built with React and Three.js. Navigate a decaying digital void, upgrade your hardware, and survive the sentinels of the machine room.

---

## 🛰️ System Overview

Cyberynthe blends fast-paced 3D exploration with deep RPG mechanics. Every run is a "dive" into a procedurally generated maze where your performance determines your rank in the global **Gradient Ledger**.

### 🛠️ Core Mechanics
- **3D Procedural Mazes**: Dynamic Sectors (1-10: Sector 01, 11+: Sector 02) with unique shaders and atmospheric shift.
- **Cyberdeck Interface**: Full inventory and character sheet for real-time attribute allocation.
- **RPG Attributes**:
  - **Integrity**: Your physical stability (HP).
  - **M-RAM**: The resource required for high-level logic breaches.
  - **Clock Speed**: Determines movement rate and data-processing latency.
  - **Scrub Rate**: The efficiency of your M-RAM recovery system.
- **The Trinity HUD**: A high-visibility radial gauge system for monitoring vitals during combat.

### 🏆 The Gradient Ledger
Integrated with **Supabase**, Cyberynthe features persistent, cloud-synced leaderboards.
- **Velocity**: Speed-based scoring for efficient floor clearing.
- **Stability**: Scoring based on damage mitigation and resource management.
- **Ghost Score**: Specialized scoring for those who bypass combat altogether.

---

## 🚀 Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **3D Engine**: [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **Physics**: [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- **Database**: [Supabase](https://supabase.com/) (Leaderboards & Persistence)
- **Styling**: Tailwind CSS + Vanilla CSS (Custom Cyber Shaders)

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lynxgenisys/Cyberynthe.git
   cd Cyberynthe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📜 Lore & Directives
*Identity: LOGIC_BREACH_02 (The Engineer)*
*Directive: Survive the Texture Bleed. Reconstruct the Shards. Exit the Void.*

The machine room is waiting. Good luck, Ghost.
