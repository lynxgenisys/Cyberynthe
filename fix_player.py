import re

with open("src/components/3d/Player.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace handleMobileFireEnd with correct logic
old_handle_end = """        const handleMobileFireEnd = () => {
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
        };"""

new_handle_end = """        const handleMobileFireEnd = () => {
            if (!isCharging) return;
            setIsCharging(false);
            setChargingWeapon(false);
            
            if (chargeSoundRef.current) {
                try {
                    const ctx = chargeSoundRef.current.osc.context;
                    const t = ctx.currentTime;
                    chargeSoundRef.current.gain.gain.linearRampToValueAtTime(0, t + 0.1);
                    chargeSoundRef.current.osc.stop(t + 0.1);
                } catch (e) {}
                chargeSoundRef.current = null;
            }

            const rawDuration = Date.now() - mouseDownTime.current;
            const duration = rawDuration * cycleMultiplier;

            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const startPos = body.current.translation();
            const spawnPos = new THREE.Vector3(startPos.x, startPos.y + 1.5, startPos.z).add(direction.clone().multiplyScalar(0.2));

            const playerLevel = getLevelFromXP(gameState.xp || 0);
            const canBurst = playerLevel >= 5;

            if (canBurst && duration > 1000) {
                if (lockResource(10)) {
                    fireBurst(spawnPos, direction, 'PING');
                    playSFX('data_spike_attack');
                }
            } else {
                if (lockResource(5)) {
                    fireProjectile(spawnPos, direction, 'PING');
                    playSFX('shoot');
                }
            }
        };"""

code = code.replace(old_handle_end, new_handle_end)

# Add Shred support
old_shred = """window.addEventListener('mobilePing', handleMobilePing);"""
new_shred = """
        const handleMobileShredStart = () => {
            // Shred is instant fire right now? Let's check original mousedown
        };
        const handleMobileShredEnd = () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const startPos = body.current.translation();
            const spawnPos = new THREE.Vector3(startPos.x, startPos.y + 1.5, startPos.z).add(direction.clone().multiplyScalar(0.2));
            if (lockResource(5)) {
                fireProjectile(spawnPos, direction, 'SHRED');
                playSFX('shoot');
            }
        };
        window.addEventListener('mobileShredEnd', handleMobileShredEnd);
        window.addEventListener('mobilePing', handleMobilePing);
"""
if "handleMobileShredEnd" not in code:
    code = code.replace(old_shred, new_shred)

old_unshred = """window.removeEventListener('mobilePing', handleMobilePing);"""
new_unshred = """window.removeEventListener('mobileShredEnd', handleMobileShredEnd);\n            window.removeEventListener('mobilePing', handleMobilePing);"""
if "window.removeEventListener('mobileShredEnd', handleMobileShredEnd);" not in code:
    code = code.replace(old_unshred, new_unshred)

with open("src/components/3d/Player.jsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Fixed player reference errors.")
