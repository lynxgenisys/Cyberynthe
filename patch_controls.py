import re

# 1. Patch QuickSlots.jsx
with open("src/components/ui/QuickSlots.jsx", "r", encoding="utf-8") as f:
    code = f.read()
code = code.replace("width: '128px',", "width: '64px',")
code = code.replace("height: '128px',", "height: '64px',")
with open("src/components/ui/QuickSlots.jsx", "w", encoding="utf-8") as f:
    f.write(code)

# 2. Patch TouchControlsOverlay.jsx
with open("src/components/mobile/TouchControlsOverlay.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace FIRE
code = code.replace("triggerMouse(0, 'mousedown')", "window.dispatchEvent(new CustomEvent('mobileFireStart'))")
code = code.replace("triggerMouse(0, 'mouseup')", "window.dispatchEvent(new CustomEvent('mobileFireEnd'))")

# Replace SHRED
code = code.replace("triggerMouse(2, 'mousedown')", "window.dispatchEvent(new CustomEvent('mobileShredStart'))")
code = code.replace("triggerMouse(2, 'mouseup')", "window.dispatchEvent(new CustomEvent('mobileShredEnd'))")

# Replace JUMP
code = code.replace("triggerKey(' ', 'Space', 'keydown')", "window.dispatchEvent(new CustomEvent('mobileJump'))")

# Replace PING with minimap overlay
ping_button = """                {/* PING (E) */}
                <button 
                    className="absolute bottom-[22rem] right-[14.66rem] w-20 h-20 rounded-full bg-cyan/10 border-2 border-cyan/50 text-cyan font-bold active:bg-cyan active:text-black pointer-events-auto text-xs"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('e', 'KeyE', 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('e', 'KeyE', 'keyup'); }}
                >
                    PING
                </button>"""

minimap_overlay = """                {/* INVISIBLE MINIMAP OVERLAY (FOR PING) */}
                <div 
                    className="absolute bottom-4 right-4 w-48 h-48 rounded-full z-50 pointer-events-auto"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobilePing')); }}
                />"""

code = code.replace(ping_button, minimap_overlay)

with open("src/components/mobile/TouchControlsOverlay.jsx", "w", encoding="utf-8") as f:
    f.write(code)


# 3. Patch Player.jsx
with open("src/components/3d/Player.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Add event listeners for custom mobile events
listeners = """
        const handleMobileFireStart = () => {
            mouseDownTime.current = Date.now();
            setIsCharging(true);
            setChargingWeapon(true);
            chargeSoundRef.current = playSFX('data_spike_charge');
        };

        const handleMobileFireEnd = () => {
            if (!isCharging) return;
            setIsCharging(false);
            setChargingWeapon(false);
            if (chargeSoundRef.current) {
                chargeSoundRef.current.stop();
                chargeSoundRef.current = null;
            }

            const rawDuration = Date.now() - mouseDownTime.current;
            const duration = rawDuration * cycleMultiplier;

            if (duration < 200) return;

            let damage = 25;
            let type = 0; // PING
            let energyCost = 5;

            if (duration > 800) {
                damage = 75;
                type = 1; // SHRED
                energyCost = 20;
            }

            if (energy >= energyCost) {
                dispatch({ type: 'SPEND_ENERGY', amount: energyCost });
                fireProjectile(_cameraDirection, _spawnVector, type, damage * dmgMultiplier);
            } else {
                playSFX('error');
            }
        };

        const handleMobileJump = () => {
            const currentVel = body.current.linvel();
            const isGrounded = Math.abs(currentVel.y) < 0.1;
            if (isGrounded) {
                body.current.setLinvel({ x: currentVel.x, y: 5.0, z: currentVel.z }, true);
                playSFX('jump');
            }
        };

        const handleMobilePing = () => {
            triggerScan();
        };

        window.addEventListener('mobileFireStart', handleMobileFireStart);
        window.addEventListener('mobileFireEnd', handleMobileFireEnd);
        window.addEventListener('mobileJump', handleMobileJump);
        window.addEventListener('mobilePing', handleMobilePing);
"""

unlisteners = """
            window.removeEventListener('mobileFireStart', handleMobileFireStart);
            window.removeEventListener('mobileFireEnd', handleMobileFireEnd);
            window.removeEventListener('mobileJump', handleMobileJump);
            window.removeEventListener('mobilePing', handleMobilePing);
"""

if "handleMobileFireStart" not in code:
    code = code.replace("window.addEventListener('mousedown', handleMouseDown);", listeners + "\n        window.addEventListener('mousedown', handleMouseDown);")
    code = code.replace("window.removeEventListener('mousedown', handleMouseDown);", unlisteners + "\n            window.removeEventListener('mousedown', handleMouseDown);")

with open("src/components/3d/Player.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Patched controls")
