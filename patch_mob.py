import re

with open("src/components/3d/MobManager.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Imports
code = code.replace("import ByteMotherBoss from './ByteMotherBoss';", "import ByteMotherBoss from './ByteMotherBoss';\nimport SectorGuardianBoss from './SectorGuardianBoss';")

# 2. Refs
code = code.replace("const miteRef = useRef(); const wispRef = useRef(); const wispOverlayRef = useRef(); const hunterRef = useRef();", "const miteRef = useRef(); const wispRef = useRef(); const wispOverlayRef = useRef(); const hunterRef = useRef(); const trackerRef = useRef();")
code = code.replace("const miteScanRef = useRef(); const wispScanRef = useRef(); const hunterScanRef = useRef(); const sentryScanRef = useRef(); const bossScanRef = useRef();", "const miteScanRef = useRef(); const wispScanRef = useRef(); const hunterScanRef = useRef(); const sentryScanRef = useRef(); const bossScanRef = useRef(); const trackerScanRef = useRef();")

# 3. Y position and ID
code = code.replace("const mobY = (mob.id === 'NULL_WISP' ? 3.5 : (mob.id === 'IO_SENTINEL') ? 3.5 : (mob.id === 'BYTE_MOTHER') ? 2.5 : mob.id === 'STATELESS_SENTRY' ? 2.5 : 1.0);",
                    "const mobY = (mob.id === 'NULL_WISP' ? 3.5 : (mob.id === 'IO_SENTINEL' || mob.id === 'SECTOR_GUARDIAN') ? 3.5 : (mob.id === 'BYTE_MOTHER') ? 2.5 : mob.id === 'STATELESS_SENTRY' ? 2.5 : mob.id === 'STATEFUL_TRACKER' ? 2.0 : 1.0);")
code = code.replace("mobTypeBuffer.current[i] = (mob.id === 'BIT_MITE' ? 1 : mob.id === 'NULL_WISP' ? 2 : mob.id === 'HUNTER' ? 3 : mob.id === 'BYTE_MOTHER' ? 5 : 4);",
                    "mobTypeBuffer.current[i] = (mob.id === 'BIT_MITE' ? 1 : mob.id === 'NULL_WISP' ? 2 : mob.id === 'HUNTER' ? 3 : mob.id === 'BYTE_MOTHER' ? 5 : mob.id === 'STATEFUL_TRACKER' ? 6 : mob.id === 'SECTOR_GUARDIAN' ? 7 : 4);")

# 4. Aggro and tick damage
code = code.replace("if ((mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER') && !mob.aggroActive", "if ((mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER' || mob.id === 'SECTOR_GUARDIAN') && !mob.aggroActive")
code = code.replace("if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER') {\n                        mob.aggroActive = true;", "if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER' || mob.id === 'SECTOR_GUARDIAN') {\n                        mob.aggroActive = true;")
code = code.replace("if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER') tickDamage += (mob.maxHp * 0.01);", "if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER' || mob.id === 'SECTOR_GUARDIAN') tickDamage += (mob.maxHp * 0.01);")

# 5. Tracker Logic
tracker_logic = """
                if (mob.id === 'STATEFUL_TRACKER') {
                    if (dist < 20 && !mob.isStationary) {
                        // Teleport closer if too far
                        if (dist > 10 && Math.random() < 0.01) {
                            mob.x = nextX + (Math.random() - 0.5) * 4;
                            mob.z = nextZ + (Math.random() - 0.5) * 4;
                        } else {
                            const speed = 2.0;
                            vx = (nx * distError) * speed;
                            vz = (nz * distError) * speed;
                        }
                    }
                }
"""
code = code.replace("if (dist < 10000 || mob.id === \"HUNTER\") {", "if (dist < 10000 || mob.id === \"HUNTER\") {\n" + tracker_logic)

# 6. Tracker attack
tracker_atk = """
                if (mob.id === 'STATEFUL_TRACKER') {
                    if (dist < 15) {
                        if (!mob.attackState) mob.attackState = 'IDLE';
                        if (mob.attackState === 'IDLE') {
                            if (Math.random() < 0.01) {
                                mob.attackState = 'CHARGING';
                                mob.chargeTimer = 1.5;
                                addNotification("ALERT: STATEFUL_TRACKER_PHASE_LOCK", "#EA00FF");
                            }
                        } else if (mob.attackState === 'CHARGING') {
                            mob.chargeTimer -= delta;
                            mob.isStationary = true;
                            if (mob.chargeTimer <= 0) {
                                mob.attackState = 'FIRING';
                                mob.fireTimer = 0.5;
                            }
                        } else if (mob.attackState === 'FIRING') {
                            mob.fireTimer -= delta;
                            if (mob.fireTimer <= 0) {
                                dispatch({ type: 'TAKE_DAMAGE', amount: mob.damage || 15 });
                                addNotification("CRITICAL: PHASE_LOCK_HIT", "#FF0000");
                                createDamageText(playerPos.x, playerPos.y + 1, playerPos.z, mob.damage || 15, true);
                                mob.attackState = 'COOLDOWN';
                                mob.cooldownTimer = 2.0;
                                mob.isStationary = false;
                            }
                        } else if (mob.attackState === 'COOLDOWN') {
                            mob.cooldownTimer -= delta;
                            if (mob.cooldownTimer <= 0) {
                                mob.attackState = 'IDLE';
                            }
                        }
                    }
                }
"""
code = code.replace("if (mob.id === 'NULL_WISP') {", tracker_atk + "\n                if (mob.id === 'NULL_WISP') {")

# 7. Sector Guardian Logic
boss_atk = """
                if (mob.id === 'SECTOR_GUARDIAN' && floorLevel !== 999) {
                    if (!mob.bossState) mob.bossState = 'IDLE';
                    
                    if (mob.bossState === 'IDLE' && mob.aggroActive) {
                        if (Math.random() < 0.02) {
                            mob.bossState = 'CHARGING';
                            mob.chargeTimer = 2.0;
                            setBossSubtitle("FIREWALL_PURGE_INITIATED", 2000);
                        }
                    } else if (mob.bossState === 'CHARGING') {
                        mob.chargeTimer -= delta;
                        if (mob.chargeTimer <= 0) {
                            mob.bossState = 'FIRING';
                            mob.fireTimer = 2.0; // 2 seconds of laser
                        }
                    } else if (mob.bossState === 'FIRING') {
                        mob.fireTimer -= delta;
                        // Sweeping damage
                        if (distSq < 400 && Math.random() < 0.1) {
                            dispatch({ type: 'TAKE_DAMAGE', amount: 20 });
                        }
                        if (mob.fireTimer <= 0) {
                            mob.bossState = 'COOLDOWN';
                            mob.cooldownTimer = 3.0;
                        }
                    } else if (mob.bossState === 'COOLDOWN') {
                        mob.cooldownTimer -= delta;
                        if (mob.cooldownTimer <= 0) mob.bossState = 'IDLE';
                    }
                }
"""
code = code.replace("// 3. BYTE_MOTHER: Minion Summoning", boss_atk + "\n                // 3. BYTE_MOTHER: Minion Summoning")

# 8. Boss HP Update
code = code.replace("if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER') {", "if (mob.id === 'IO_SENTINEL' || mob.id === 'BYTE_MOTHER' || mob.id === 'SECTOR_GUARDIAN') {")

# 9. Boss Purged msg
code = code.replace("if (mob.id === 'BYTE_MOTHER') { \n                    addNotification(\"BYTE_MOTHER_PURGED\");", 
"""if (mob.id === 'BYTE_MOTHER') { 
                    addNotification("BYTE_MOTHER_PURGED"); 
                    setBossKey({ x: mob.x, z: mob.z });
                    updateBossStatus({ active: false }); 
                }
                if (mob.id === 'SECTOR_GUARDIAN') { 
                    addNotification("SECTOR_GUARDIAN_PURGED. LATTICE_OPENED."); """)

# 10. Reward XP
code = code.replace("rewardXP = (mob.id === 'BIT_MITE' ? 25 : mob.id === 'NULL_WISP' ? 40 : mob.id === 'HUNTER' ? 65 : mob.id === 'STATELESS_SENTRY' ? 80 : 500);",
                    "rewardXP = (mob.id === 'BIT_MITE' ? 25 : mob.id === 'NULL_WISP' ? 40 : mob.id === 'HUNTER' ? 65 : mob.id === 'STATELESS_SENTRY' ? 80 : mob.id === 'STATEFUL_TRACKER' ? 120 : 500);")

# 11. Count & Matrices
code = code.replace("let miteC = 0; let wispC = 0; let hunterC = 0; let sentryC = 0; let bossC = 0;", "let miteC = 0; let wispC = 0; let hunterC = 0; let sentryC = 0; let bossC = 0; let trackerC = 0;")
code = code.replace("let miteScanC = 0; let wispScanC = 0; let hunterScanC = 0; let sentryScanC = 0; let bossScanC = 0;", "let miteScanC = 0; let wispScanC = 0; let hunterScanC = 0; let sentryScanC = 0; let bossScanC = 0; let trackerScanC = 0;")

matrix_logic = """
            } else if (mob.id === 'STATEFUL_TRACKER' && trackerRef.current) {
                trackerRef.current.setMatrixAt(trackerC++, tempObject.matrix);
                if (mob.scanTimer > 0 && trackerScanRef.current) trackerScanRef.current.setMatrixAt(trackerScanC++, tempObject.matrix);
"""
code = code.replace("} else if (mob.id === 'HUNTER' && hunterRef.current) {", matrix_logic + "\n            } else if (mob.id === 'HUNTER' && hunterRef.current) {")

count_logic = """
        if (trackerRef.current) trackerRef.current.count = trackerC;
        if (trackerScanRef.current) trackerScanRef.current.count = trackerScanC;
"""
code = code.replace("if (hunterRef.current) hunterRef.current.count = hunterC;", "if (hunterRef.current) hunterRef.current.count = hunterC;\n" + count_logic)

# 12. Tracker Render components
tracker_jsx = """
            {/* STATEFUL TRACKER */}
            <instancedMesh ref={trackerRef} args={[null, null, 100]}>
                <octahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#222222" emissive="#EA00FF" emissiveIntensity={0.8} wireframe />
            </instancedMesh>
            <instancedMesh ref={trackerScanRef} args={[null, null, 100]}>
                <sphereGeometry args={[0.7, 8, 8]} />
                <meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>
"""
code = code.replace("{/* HUNTER (Stalker Mode) */}", tracker_jsx + "\n            {/* HUNTER (Stalker Mode) */}")

# 13. SECTOR_GUARDIAN Boss Component
code = code.replace("{mobs.map(m => m.id === 'BYTE_MOTHER' && <ByteMotherBoss key={`BYTE_MOTHER-${m.instanceId}`} mob={m} />)}", 
"{mobs.map(m => m.id === 'BYTE_MOTHER' && <ByteMotherBoss key={`BYTE_MOTHER-${m.instanceId}`} mob={m} />)}\n            {mobs.map(m => m.id === 'SECTOR_GUARDIAN' && <SectorGuardianBoss key={`SECTOR_GUARDIAN-${m.instanceId}`} mob={m} />)}")


with open("src/components/3d/MobManager.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("MobManager patched")
