import json
import re

with open("src/data/patchNotesData.js", "r", encoding="utf-8") as f:
    content = f.read()

# We know the beginning of the file is exactly:
# export const patchNotes = [
#     {
#         version: "v0.14.4",
# ...
#         changes: [
# ...
#         ]
#     },

# Replace v0.14.4's malformed object with a properly formatted one, and prepend v0.15.0

new_data = """export const patchNotes = [
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
    },"""

# replace up to v0.14.3
idx = content.find('{\n        version: "v0.14.3",')
if idx != -1:
    content = new_data + "\n    " + content[idx:]

with open("src/data/patchNotesData.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch notes updated.")
