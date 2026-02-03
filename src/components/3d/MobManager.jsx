import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MobLogic } from '../../engine/MobAI';
import { useCombat } from '../../context/CombatContext';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import * as THREE from 'three';
import { useInventory } from '../../context/InventoryContext';

import biteMiteSkinSrc from '../../assets/mobs/Bite_Mite_Skin.webp';
import wispSkinSrc from '../../assets/mobs/null_wisp_skin.webp';
import sentrySkinSrc from '../../assets/mobs/stateless_sentry_skin.webp';
import hunterSkinSrc from '../../assets/mobs/hunter_skin.webp';
import bossCoreSrc from '../../assets/mobs/lvl_10_boss.webp';
import bossRingsSrc from '../../assets/mobs/lvl_10_boss_rings.webp';

const MAX_MOBS = 50;

const BossFX = ({ mob, maze }) => {
    const groupRef = useRef();
    const ring1 = useRef();
    const ring2 = useRef();
    const ring3 = useRef();
    const core = useRef();
    const beamRef = useRef();
    const coreMatRef = useRef();

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.set(mob.x, 2.0, mob.z);
        groupRef.current.scale.setScalar(0.45);
        if (mob.bossState === 'FIRING') {
            groupRef.current.rotation.y += delta * 2.0;
            if (beamRef.current && maze && maze.grid) {
                const rotY = groupRef.current.rotation.y;
                const dirX = -Math.sin(rotY);
                const dirZ = -Math.cos(rotY);
                let hitDist = 1000;
                for (let d = 2; d < 100; d += 1.0) {
                    const checkX = Math.round((mob.x + dirX * d) / 2);
                    const checkZ = Math.round((mob.z + dirZ * d) / 2);
                    if (maze.grid[checkZ] && maze.grid[checkZ][checkX] === 0) {
                        if (checkX > 0 && checkX < maze.width - 1 && checkZ > 0 && checkZ < maze.height - 1) {
                            hitDist = d; break;
                        }
                    }
                }
                beamRef.current.scale.y = hitDist;
                beamRef.current.position.z = -hitDist / 2;
            }
        } else groupRef.current.rotation.y += delta * 0.1;

        if (ring1.current) ring1.current.rotation.x += delta * 3.0;
        if (ring2.current) ring2.current.rotation.y -= delta * 2.4;
        if (ring3.current) ring3.current.rotation.z += delta * 3.6;
        if (core.current) core.current.rotation.y += delta * 0.2;

        const isCharging = mob.bossState === 'CHARGING';
        const isVulnerable = mob.isVulnerable;
        const color = isVulnerable ? "#FFFF00" : (isCharging ? "#00FFFF" : (mob.phase === 2 ? "#EA00FF" : "#00AAAA"));
        if (coreMatRef.current) { coreMatRef.current.color.set(color); coreMatRef.current.emissive.set(isCharging ? color : "#000044"); }
    });

    return (
        <group ref={groupRef}>
            <mesh ref={core}><dodecahedronGeometry args={[1.5, 0]} /><meshStandardMaterial ref={coreMatRef} color="#00AAAA" emissive="#000044" transparent opacity={0.8} /></mesh>
            <mesh ref={ring1}><torusGeometry args={[2.5, 0.1, 16, 100]} /><meshStandardMaterial color="#111111" emissive="#004444" /></mesh>
            <mesh ref={ring2}><torusGeometry args={[3.2, 0.1, 16, 100]} /><meshStandardMaterial color="#111111" emissive="#004444" /></mesh>
            <mesh ref={ring3}><torusGeometry args={[4.0, 0.1, 16, 100]} /><meshStandardMaterial color="#111111" emissive="#004444" /></mesh>
            {mob.bossState === 'FIRING' && (
                <group>
                    <mesh ref={beamRef} position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[1, 4, 1, 8, 1, true]} />
                        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const KernelShard = ({ position, maze }) => {
    const meshRef = useRef();
    const { setInteractionPrompt, lastInteractTime, setActiveLoreLog, fastStateRef, setGameState } = useGame();
    const [isCollected, setIsCollected] = useState(false);
    const lastProcessedRef = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current || isCollected) return;
        meshRef.current.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
        meshRef.current.rotation.y += delta * 0.5;
        const playerPos = fastStateRef.current.playerWorldPos;
        if (playerPos) {
            const dx = playerPos.x - position.x, dz = playerPos.z - position.z;
            if (dx * dx + dz * dz < 9.0) {
                setInteractionPrompt("[R] SYNCHRONIZE SHARD");
                if (lastInteractTime && lastInteractTime > lastProcessedRef.current) {
                    lastProcessedRef.current = lastInteractTime;
                    setIsCollected(true);
                    setInteractionPrompt(null);
                    setActiveLoreLog({
                        id: "KERNEL_SHARD",
                        title: "FRAGMENT_ID: #0010_COMPROMISE",
                        text: "It’s heavy. Heavier than data should be.\n\nWhen your hand touches the crystalline lattice, you don't just download a key; you remember a moment. A conference room, centuries ago. The air smelling of ozone and stale coffee. Engineers arguing over the color of the sky in the new world they were building.\n\nYou voted for Cyan—for perfect, sterile order. Someone else voted for Magenta—for unrestrained, beautiful chaos.\n\nYou compromised on a Gradient. You built the Sentinel to guard that compromise. And now, you have destroyed it to finish the argument."
                    });
                    setGameState(prev => ({ ...prev, isPortalLocked: false }));
                }
            }
        }
    });

    if (isCollected) return null;
    return (
        <group position={[position.x, 1, position.z]}>
            <mesh ref={meshRef}><dodecahedronGeometry args={[0.4, 0]} /><meshStandardMaterial color="#00FFFF" emissive="#0088AA" transparent opacity={0.9} /></mesh>
            <pointLight distance={4} intensity={2} color="#00FFFF" />
        </group>
    );
};

const BossBeam = ({ mob, maze }) => {
    const beamRef = useRef();
    const { gameState } = useGame(); // Need context for pause check

    useFrame((state, delta) => {
        // GLOBAL PAUSE
        if (gameState.isPaused) return;

        if (mob.bossState !== 'FIRING' || !beamRef.current) return;

        // Visual Raycast for Beam Length
        const rotY = mob.rotationY || 0;
        const dirX = -Math.sin(rotY);
        const dirZ = -Math.cos(rotY);
        let hitDist = 20; // Default max

        if (maze && maze.grid) {
            for (let d = 2; d < 40; d += 1.0) {
                const checkX = Math.round((mob.x + dirX * d) / 2);
                const checkZ = Math.round((mob.z + dirZ * d) / 2);
                if (maze.grid[checkZ] && maze.grid[checkZ][checkX] === 0) {
                    // Hit wall
                    hitDist = d;
                    break;
                }
            }
        }

        beamRef.current.scale.y = hitDist;
        beamRef.current.position.z = -hitDist / 2;
        beamRef.current.position.y = 3.5; // Core height
    });

    if (mob.bossState !== 'FIRING') return null;

    return (
        <group position={[mob.x, 0, mob.z]} rotation={[0, mob.rotationY || 0, 0]}>
            <mesh ref={beamRef} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.5, 2, 1, 8, 1, true]} />
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, 3.5, 0]} intensity={2} color="#00FFFF" distance={10} />
        </group>
    );
};

export default function MobManager({ maze, floorLevel }) {
    const [mobs, setMobs] = useState([]);
    const mobsRef = useRef([]);
    const spawnQueue = useRef([]);
    const lastSyncRef = useRef(0);
    const mobKillCounter = useRef({}); // Track mob types killed
    const bestiaryDeadMobs = useRef([]); // Bestiary respawn queue
    const [bossKey, setBossKey] = useState(null);

    const { gameState, setGameState, addNotification, setBossSubtitle, updateBossStatus, fastStateRef, getLevelFromXP, getNextLevelXP, setInteractionPrompt, updateScannedTargets } = useGame();
    const { triggerImpact, mobDamageBuffer, mobPositionBuffer, mobLifeBuffer, mobTypeBuffer, mobStatusBuffer } = useCombat();
    const { damageKernel } = usePlayer(); // Import damage handler

    // TRUE GHOST MODE: Disable all mobs
    if (gameState.gameMode === 'ghost') {
        return null;
    }

    const miteRef = useRef(); const wispRef = useRef(); const wispOverlayRef = useRef(); const hunterRef = useRef();
    const sentryTopRef = useRef(); const sentryMidRef = useRef(); const sentryBotRef = useRef(); const sentryHeartRef = useRef();
    const bossCore = useRef(); const bossRing1Ref = useRef(); const bossRing2Ref = useRef(); const bossRing3Ref = useRef();
    const miteScanRef = useRef(); const wispScanRef = useRef(); const hunterScanRef = useRef(); const sentryScanRef = useRef(); const bossScanRef = useRef();

    const tempObject = useMemo(() => new THREE.Object3D(), []);

    // Load Textures with useState for better error handling
    const [miteTex, setMiteTex] = useState(null);
    const [wispTex, setWispTex] = useState(null);
    const [wispTex2, setWispTex2] = useState(null); // Second layer for overlay
    const [hunterTex, setHunterTex] = useState(null);
    const [sentryTex, setSentryTex] = useState(null);
    const [bossCoreTex, setBossCoreTex] = useState(null);
    const [bossRingsTex, setBossRingsTex] = useState(null);

    // Material refs for manual texture assignment
    const miteMatRef = useRef();
    const wispMatRef = useRef();
    const wispOverlayMatRef = useRef(); // Second layer material
    const hunterMatRef = useRef();
    const sentryTopMatRef = useRef();
    const sentryMidMatRef = useRef();
    const sentryBotMatRef = useRef();
    const sentryHeartMatRef = useRef();
    const bossCoreMatRef = useRef(); const bossRing1MatRef = useRef(); const bossRing2MatRef = useRef(); const bossRing3MatRef = useRef();

    useEffect(() => {
        const loader = new THREE.TextureLoader();

        loader.load(biteMiteSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setMiteTex(tex);
            if (miteMatRef.current) {
                miteMatRef.current.map = tex;
                miteMatRef.current.needsUpdate = true;
                console.log("Mite texture loaded");
            }
        }, undefined, (err) => console.warn('Mite texture failed:', err));

        loader.load(wispSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setWispTex(tex);
            if (wispMatRef.current) {
                wispMatRef.current.map = tex;
                wispMatRef.current.needsUpdate = true;
                console.log("Wisp texture loaded");
            }
        }, undefined, (err) => console.warn('Wisp texture failed:', err));

        // Load second wisp texture (same source, different transforms)
        loader.load(wispSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.rotation = Math.PI; // 180° rotation
            tex.offset.set(0.5, 0.5); // 50% shift
            setWispTex2(tex);
            if (wispOverlayMatRef.current) {
                wispOverlayMatRef.current.map = tex;
                wispOverlayMatRef.current.needsUpdate = true;
            }
        }, undefined, (err) => console.warn('Wisp overlay texture failed:', err));

        loader.load(hunterSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setHunterTex(tex);
            if (hunterMatRef.current) {
                hunterMatRef.current.map = tex;
                hunterMatRef.current.needsUpdate = true;
                console.log("Hunter texture loaded");
            }
        }, undefined, (err) => console.warn('Hunter texture failed:', err));

        loader.load(sentrySkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setSentryTex(tex);
            if (sentryTopMatRef.current) {
                sentryTopMatRef.current.map = tex;
                sentryTopMatRef.current.needsUpdate = true;
                console.log("Sentry texture loaded");
            }
            if (sentryMidMatRef.current) {
                sentryMidMatRef.current.map = tex;
                sentryMidMatRef.current.needsUpdate = true;
            }
            if (sentryBotMatRef.current) {
                sentryBotMatRef.current.map = tex;
                sentryBotMatRef.current.needsUpdate = true;
            }
        }, undefined, (err) => console.warn('Sentry texture failed:', err));

        // Load boss textures
        loader.load(bossCoreSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setBossCoreTex(tex);
            if (bossCoreMatRef.current) { bossCoreMatRef.current.map = tex; bossCoreMatRef.current.needsUpdate = true; }
            console.log("Boss Core texture loaded");
        }, undefined, (err) => console.warn('Boss core texture failed:', err));

        loader.load(bossRingsSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            setBossRingsTex(tex);
            if (bossRing1MatRef.current) { bossRing1MatRef.current.map = tex; bossRing1MatRef.current.needsUpdate = true; }
            if (bossRing2MatRef.current) { bossRing2MatRef.current.map = tex; bossRing2MatRef.current.needsUpdate = true; }
            if (bossRing3MatRef.current) { bossRing3MatRef.current.map = tex; bossRing3MatRef.current.needsUpdate = true; }
            console.log("Boss Rings texture loaded");
        }, undefined, (err) => console.warn('Boss rings texture failed:', err));
    }, []);

    // Animate all mob textures
    useFrame((state, delta) => {
        // GLOBAL PAUSE
        if (gameState.isPaused) return;

        const t = state.clock.elapsedTime;
        const currentMobs = mobsRef.current; // access mobs for state checks

        // Sentry: Vertical scrolling (already implemented)
        if (sentryTex) {
            sentryTex.offset.y = t * 0.15;
        }

        // Bit Mite: Slow rotation (increased by 250% more = 390% total)
        if (miteTex) {
            miteTex.offset.x = Math.sin(t * 0.195) * 0.1;
            miteTex.offset.y = Math.cos(t * 0.195) * 0.1;
        }


        // Null Wisp: Fast roiling (2.25x speed - increased by 1.5x)
        if (wispTex) {
            wispTex.offset.x = Math.sin(t * 0.675) * 0.2 + Math.cos(t * 1.125) * 0.1;
            wispTex.offset.y = Math.cos(t * 0.675) * 0.2 + Math.sin(t * 0.9) * 0.1;
        }

        // Null Wisp: Overlay layer rotating opposite direction (2.25x speed)
        if (wispTex2) {
            wispTex2.offset.x = -Math.sin(t * 0.675) * 0.2 - Math.cos(t * 1.125) * 0.1;
            wispTex2.offset.y = -Math.cos(t * 0.675) * 0.2 - Math.sin(t * 0.9) * 0.1;
        }

        // Boss Core: Ultra Fast roiling (2.5x Wisp speed)
        if (bossCoreTex) {
            // Wisp bases: 0.675, 1.125, 0.9.  Multiplied by 2.5: 1.6875, 2.8125, 2.25
            bossCoreTex.offset.x = Math.sin(t * 1.6875) * 0.2 + Math.cos(t * 2.8125) * 0.1;
            bossCoreTex.offset.y = Math.cos(t * 1.6875) * 0.2 + Math.sin(t * 2.25) * 0.1;
        }



        // Hunter: Stealth mechanics (invisible until scanned or attacking)
        if (hunterMatRef.current) {
            let maxOpacity = 0.0;

            // Check all hunters for scan reveal or attack telegraph
            currentMobs.forEach(mob => {
                if (mob.id === 'HUNTER') {
                    let myOpacity = 0.0;

                    // Scan reveal: 2x normal scan duration
                    if (mob.scanTimer > 0) {
                        mob.isRevealed = true;
                        mob.revealTimer = Math.max(mob.revealTimer || 0, mob.scanTimer * 2);
                    }

                    // Reveal Fade Logic
                    if (mob.isRevealed) {
                        mob.revealTimer = (mob.revealTimer || 0) - delta;
                        if (mob.revealTimer > 0) {
                            // Fade In (first 0.5s of 2.0s duration) - assuming 2.0 start
                            // Actually, just ease it based on remaining time? 
                            // Better: 
                            // If just hit (timer ~2.0): Fade In.
                            // If ending (timer < 0.5): Fade Out.

                            if (mob.revealTimer > 1.5) myOpacity = (2.0 - mob.revealTimer) / 0.5;
                            else if (mob.revealTimer < 0.5) myOpacity = mob.revealTimer / 0.5;
                            else myOpacity = 1.0;
                        } else {
                            mob.isRevealed = false;
                        }
                    }

                    // Attack telegraph: must fade in before attacking
                    if (mob.attackTelegraph) {
                        mob.telegraphTimer = (mob.telegraphTimer || 0) + delta;
                        const teleOpacity = Math.min(mob.telegraphTimer, 1.0); // Fade in over 1s
                        myOpacity = Math.max(myOpacity, teleOpacity);

                        // Attack executes when fully solid
                        if (mob.telegraphTimer >= 1.0) {
                            mob.canAttack = true;
                        }
                    } else {
                        mob.telegraphTimer = 0;
                        mob.canAttack = false;
                    }

                    maxOpacity = Math.max(maxOpacity, myOpacity);
                }
            });

            hunterMatRef.current.opacity = maxOpacity;

            // Roiling: stationary at opaque, slow rotation at transparent
            const roilSpeed = (1 - maxOpacity) * 0.048;
            if (hunterTex) {
                hunterTex.offset.x = Math.sin(t * roilSpeed) * 0.1;
                hunterTex.offset.y = Math.cos(t * roilSpeed) * 0.1;
            }
        }

        // BESTIARY RESPAWN TIMERS (Floor 999)
        if (floorLevel === 999 && bestiaryDeadMobs.current.length > 0) {
            for (let i = bestiaryDeadMobs.current.length - 1; i >= 0; i--) {
                const dead = bestiaryDeadMobs.current[i];
                dead.respawnTimer -= delta;
                if (dead.respawnTimer <= 0) {
                    // Respawn logic
                    const m = MobLogic.createMob(dead.id, floorLevel);
                    if (m) {
                        const newMob = { ...m, instanceId: Math.random(), x: dead.x, z: dead.z };
                        bestiaryDeadMobs.current.splice(i, 1);
                        mobsRef.current.push(newMob);
                        setMobs([...mobsRef.current]); // Update state to reflect count change if needed
                        addNotification(`RESPAWN >> ${dead.name}`);
                    }
                }
            }
        }




        // Boss Rings: Rotation animation
        if (bossRingsTex) {
            bossRingsTex.rotation = t * 0.1;
        }
    });

    useEffect(() => {
        if (!maze || !maze.grid) return;
        const newMobs = []; const deadEnds = [];
        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                if (cell !== 1) return;
                let walls = 0;
                if (x === 0 || maze.grid[z][x - 1] === 0) walls++; if (x === maze.width - 1 || maze.grid[z][x + 1] === 0) walls++;
                if (z === 0 || maze.grid[z - 1][x] === 0) walls++; if (z === maze.height - 1 || maze.grid[z + 1][x] === 0) walls++;
                if (walls >= 3) deadEnds.push({ x, z });
            });
        });

        if (floorLevel === 10) {
            const boss = MobLogic.createMob('IO_SENTINEL', floorLevel);
            if (boss) { newMobs.push({ ...boss, instanceId: Math.random(), x: 30, z: 30, phase: 1 }); updateBossStatus({ active: true, name: boss.name, hp: boss.currentHp, maxHp: boss.maxHp }); }
        } else if (floorLevel === 999) {
            const specs = [{ id: 'BIT_MITE', x: 4, z: 4 }, { id: 'NULL_WISP', x: 4, z: 10 }, { id: 'HUNTER', x: 10, z: 4 }, { id: 'STATELESS_SENTRY', x: 10, z: 10 }, { id: 'IO_SENTINEL', x: 7, z: 7 }];
            specs.forEach(s => {
                const d = MobLogic.createMob(s.id, 1);
                if (d) {
                    const mob = { ...d, instanceId: Math.random(), x: s.x * 2, z: s.z * 2, isStasis: true };
                    if (s.id === 'STATELESS_SENTRY') mob.isStationary = true; // Sentries don't chase
                    newMobs.push(mob);
                }
            });
        } else {
            deadEnds.forEach(pos => {
                const rand = Math.random();
                let type = 'BIT_MITE';
                if (floorLevel >= 11 && rand < 0.2) type = 'NULL_WISP';
                else if (rand < 0.05) type = 'HUNTER';
                else if (rand > 0.8) type = 'STATELESS_SENTRY';
                const mob = MobLogic.createMob(type, floorLevel || 1);
                if (mob) {
                    const newMob = { ...mob, instanceId: Math.random(), x: pos.x * 2, z: pos.z * 2 };
                    if (type === 'STATELESS_SENTRY') newMob.isStationary = true; // Sentries don't chase
                    newMobs.push(newMob);
                }
            });
        }
        setMobs(newMobs.slice(0, MAX_MOBS)); mobsRef.current = newMobs.slice(0, MAX_MOBS);
    }, [maze, floorLevel]);

    useFrame((state, delta) => {
        const playerPos = fastStateRef.current.playerWorldPos; if (!playerPos) return;
        let mobsDirty = false;
        let miteC = 0, wispC = 0, hunterC = 0, sentryC = 0, miteScanC = 0, wispScanC = 0, hunterScanC = 0, sentryScanC = 0, bossC = 0, bossScanC = 0;
        const playerLevel = getLevelFromXP(gameState.xp || 0);
        const currentMobs = mobsRef.current;

        // Clear mob buffers initially
        if (mobPositionBuffer && mobPositionBuffer.current) {
            const posArr = mobPositionBuffer.current;
            const lifeArr = mobLifeBuffer.current;
            for (let b = 0; b < MAX_MOBS; b++) { posArr[b * 3 + 1] = -1000; lifeArr[b] = 0; }
        }

        const scannedTargets = []; // Collect scanned mobs for mini-map

        currentMobs.forEach((mob, i) => {
            const dx = playerPos.x - mob.x, dz = playerPos.z - mob.z, distSq = dx * dx + dz * dz;

            // Sync with Combat System (Mob Buffers)
            if (mobPositionBuffer && mobPositionBuffer.current && i < MAX_MOBS) {
                const posArr = mobPositionBuffer.current;
                posArr[i * 3] = mob.x;
                // Accurate Y-pos for hit detection: Wisp higher (3.5), Sentry mid (2.5), Boss core (3.5)
                const mobY = (mob.id === 'NULL_WISP' ? 3.5 : mob.id === 'IO_SENTINEL' ? 3.5 : mob.id === 'STATELESS_SENTRY' ? 2.5 : 1.0);
                posArr[i * 3 + 1] = mobY;
                posArr[i * 3 + 2] = mob.z;
                mobLifeBuffer.current[i] = mob.currentHp / mob.maxHp;
                mobTypeBuffer.current[i] = (mob.id === 'BIT_MITE' ? 1 : mob.id === 'NULL_WISP' ? 2 : mob.id === 'HUNTER' ? 3 : 4);

                // Check Status Buffer (Infection)
                if (mobStatusBuffer && mobStatusBuffer.current && mobStatusBuffer.current[i] === 1) {
                    mob.isHacked = true;
                    mob.hackTimer = 5.0; // 5s DOT
                    mobStatusBuffer.current[i] = 0; // Reset buffer
                }

                // Read Damage Buffer
                if (mobDamageBuffer.current[i] > 0) {
                    let dmg = mobDamageBuffer.current[i];

                    // BOSS ARMOR LOGIC (80% Resistance unless Vulnerable/Hacked)
                    if (mob.id === 'IO_SENTINEL' && !mob.isVulnerable && !mob.isHacked) {
                        dmg *= 0.2; // 80% Reduction
                    }

                    if (mob.isVulnerable) {
                        dmg *= 2; // Critical Hit on Vulnerable
                        if (Math.random() < 0.5) addNotification("CRITICAL HIT!");
                    }
                    mob.currentHp -= dmg;
                    mobDamageBuffer.current[i] = 0; // Reset
                    if (Math.random() < 0.2) triggerImpact({ x: mob.x, y: mobY, z: mob.z }, "#FF0000");

                    // Hunter: Reveal on hit
                    if (mob.id === 'HUNTER') {
                        mob.isRevealed = true;
                        mob.revealTimer = 2.0; // Reveal for 2 seconds
                    }
                }

                // SHRED v2 DOT logic (Level 5+ Only)
                if (mob.isHacked) {
                    // SHRED doesn't exist before level 5
                    if (playerLevel < 5) {
                        mob.isHacked = false;
                        return;
                    }

                    mob.hackTimer -= delta;

                    // Initialize damage tick tracker
                    if (!mob.hackDamageTick) mob.hackDamageTick = 0;
                    mob.hackDamageTick += delta;

                    // Damage per tick: 2 @ lvl1, 3 @ lvl3, 4 @ lvl5+
                    let tickDamage;
                    if (playerLevel <= 2) tickDamage = 2;
                    else if (playerLevel <= 4) tickDamage = 3;
                    else tickDamage = 4; // 4 at level 5+



                    // Tick timing: 2s at level 1, -0.1s per level (minimum 0.5s)
                    const tickInterval = Math.max(0.5, 2.0 - (playerLevel * 0.1));

                    //Apply damage on tick (not continuous DPS)
                    if (mob.hackDamageTick >= tickInterval) {
                        mob.currentHp -= tickDamage;
                        triggerImpact({ x: mob.x, y: mobY, z: mob.z }, "#00FF00");
                        mob.hackDamageTick = 0;
                    }

                    // INFECTION SPREAD (Continuous jump chance while alive)
                    if (Math.random() < 0.1 * delta) {
                        const jumpRange = 3 + (playerLevel * 0.2);
                        const jumpRangeSq = jumpRange * jumpRange;

                        currentMobs.forEach((target, j) => {
                            if (i !== j && !target.isHacked && target.currentHp > 0) {
                                const dx = mob.x - target.x;
                                const dz = mob.z - target.z;
                                if (dx * dx + dz * dz < jumpRangeSq) {
                                    const jumpChance = 0.05 + (playerLevel * 0.01);
                                    if (Math.random() < jumpChance) {
                                        target.isHacked = true;
                                        target.hackTimer = 3.0 + (playerLevel * 0.2);
                                        target.hackDamageTick = 0;
                                        triggerImpact({ x: target.x, y: 1.0, z: target.z }, "#00FF00");
                                        addNotification("SHRED_v2 >> SPREAD");
                                    }
                                }
                            }
                        });
                    }

                    if (mob.hackTimer <= 0) {
                        mob.isHacked = false;
                        mob.hackDamageTick = 0;
                    }
                }

                // SHRED v2 DEATH JUMP - Worm jumps to nearest mob on host death
                if (mob.currentHp <= 0 && mob.isHacked && mob.wasAliveLastFrame) {
                    const deathJumpChance = 0.15 + (playerLevel * 0.01); // 15% + 1% per level
                    if (Math.random() < deathJumpChance) {
                        const jumpRange = 3 + (playerLevel * 0.2);
                        const jumpRangeSq = jumpRange * jumpRange;

                        let nearestTarget = null;
                        let nearestDistSq = Infinity;

                        currentMobs.forEach((target, j) => {
                            if (i !== j && !target.isHacked && target.currentHp > 0) {
                                const dx = mob.x - target.x;
                                const dz = mob.z - target.z;
                                const distSq = dx * dx + dz * dz;
                                if (distSq < jumpRangeSq && distSq < nearestDistSq) {
                                    nearestTarget = target;
                                    nearestDistSq = distSq;
                                }
                            }
                        });

                        if (nearestTarget) {
                            nearestTarget.isHacked = true;
                            nearestTarget.hackTimer = 3.0 + (playerLevel * 0.2);
                            nearestTarget.hackDamageTick = 0;
                            triggerImpact({ x: nearestTarget.x, y: 1.0, z: nearestTarget.z }, "#00FF00");
                            addNotification("SHRED_v2 >> WORM_JUMP");
                        }
                    }
                }

                // Track alive state for death detection
                mob.wasAliveLastFrame = mob.currentHp > 0;
            }

            // Ensure Sentry is Stationary
            if (mob.id === 'STATELESS_SENTRY') mob.isStationary = true;

            // MOVEMENT LOGIC (Disabled in Bestiary / Stasis)
            if (!mob.isStasis && !mob.isStationary && floorLevel !== 999) { // Stationary sentries don't move
                if (distSq < 3600 || mob.id === "HUNTER") {
                    const speed = (mob.id === 'HUNTER' ? 3.5 : 2.5);
                    const dist = Math.sqrt(distSq);

                    // WISP LOGIC: Maintain 2m distance
                    let dirMultiplier = 1;
                    if (mob.id === 'NULL_WISP' && dist < 2.5) dirMultiplier = -1; // Back away if closer than 2.5m

                    const nextX = mob.x + (dx / dist) * speed * delta * dirMultiplier;
                    const nextZ = mob.z + (dz / dist) * speed * delta * dirMultiplier;

                    const gx = Math.round(nextX / 2), gz = Math.round(nextZ / 2);
                    const canMove = (gx >= 0 && gx < maze.width && gz >= 0 && gz < maze.height) ? maze.grid[gz][gx] !== 0 : false;
                    if (canMove || mob.id === 'NULL_WISP') { mob.x = nextX; mob.z = nextZ; }

                    // BOSS MOVEMENT (Phase 2)
                    // Slower speed (1.5) and Maintain Distance (> 3.5m)
                    if (mob.id === 'IO_SENTINEL' && !mob.isStationary) {
                        if (dist > 3.5) { // Only move if far away
                            const bSpeed = 1.5;
                            const bNextX = mob.x + (dx / dist) * bSpeed * delta;
                            const bNextZ = mob.z + (dz / dist) * bSpeed * delta;
                            // Boundary Check
                            const bgx = Math.round(bNextX / 2), bgz = Math.round(bNextZ / 2);
                            if (bgx >= 0 && bgx < maze.width && bgz >= 0 && bgz < maze.height && maze.grid[bgz][bgx] !== 0) {
                                mob.x = bNextX; mob.z = bNextZ;
                            }
                        }
                    }

                    currentMobs.forEach((m2, i2) => {
                        if (i === i2) return;
                        const sdx = mob.x - m2.x, sdz = mob.z - m2.z, sdSq = sdx * sdx + sdz * sdz;
                        if (sdSq < 0.25) { mob.x += sdx * delta; mob.z += sdz * delta; }
                    });
                }
            }

            // Boss minion summoning & Animation
            if (mob.id === 'IO_SENTINEL') {
                // PHASE 2 LOGIC (HP < 60%)
                if (mob.currentHp < mob.maxHp * 0.6) {
                    if (mob.phase !== 2) {
                        mob.phase = 2;
                        addNotification("ALERT: SENTINEL_CORE_UNSTABLE // PHASE_2_INITIATED");
                        setBossSubtitle("WARNING: STACK_OVERFLOW. EMOTIONAL_THROTTLE_FAILING.", 4000);
                    }
                }
                // Stationary in Phase 1, Chasing in Phase 2
                mob.isStationary = (mob.phase !== 2);

                // --- BOSS AI STATE MACHINE ---
                if (!mob.bossState) mob.bossState = 'IDLE';
                if (mob.bossTimer === undefined) mob.bossTimer = 0;

                // BESTIARY MODE: Keep boss in stasis (no state changes)
                if (floorLevel !== 999) {
                    mob.bossTimer -= delta;
                }

                // Rotation Tracking (Look at player)
                const targetDx = playerPos.x - mob.x;
                const targetDz = playerPos.z - mob.z;
                const targetRot = Math.atan2(-targetDx, -targetDz); // Standard Three.js Y-rotation

                // Smooth Rotate
                let currentRot = mob.rotationY || 0;
                // Shortest angle interpolation
                let diff = targetRot - currentRot;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                // Rotate speed depends on state
                const rotSpeed = mob.bossState === 'FIRING' ? 0.5 : 2.0;
                mob.rotationY = currentRot + diff * rotSpeed * delta;


                if (mob.bossState === 'IDLE') {
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'CHARGING';
                        mob.bossTimer = 2.0;
                        setBossSubtitle("HANDSHAKE_PROTOCOL_DENIED [CHARGING]", 2000);
                    }
                } else if (mob.bossState === 'CHARGING') {
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'FIRING';
                        mob.bossTimer = 4.0;
                        setBossSubtitle("DATA_STREAM_PURGE [FIRING]", 4000);
                    }
                } else if (mob.bossState === 'FIRING') {
                    // Trigger Dialogue ONCE per phase start
                    if (!mob.hasspokenFiring) {
                        setBossSubtitle("ALIGNING_LOGIC_RAILS... STAND_STILL. DE-COMPILATION_IS_PAINLESS.", 3000);
                        mob.hasspokenFiring = true;
                    }

                    // BEAM DAMAGE LOGIC
                    const rotY = mob.rotationY;
                    const pDx = playerPos.x - mob.x;
                    const pDz = playerPos.z - mob.z;
                    // Project player pos onto beam vector
                    // Beam vector: -sin(rotY), -cos(rotY)
                    const bx = -Math.sin(rotY), bz = -Math.cos(rotY);
                    // Dot product to find distance along beam
                    const dot = pDx * bx + pDz * bz;
                    // Perpendicular distance
                    const cross = pDx * bz - pDz * bx; // 2D cross product magnitude

                    if (dot > 0 && Math.abs(cross) < 1.5) { // 1.5 width tolerance
                        // Raycast check for walls (Occlusion)
                        let hasLineOfSight = true;
                        if (dot < 40 && maze && maze.grid) {
                            const checkDist = Math.ceil(dot); // Check up to player distance
                            const dirX = -Math.sin(rotY);
                            const dirZ = -Math.cos(rotY);
                            for (let d = 2; d < checkDist; d += 1.0) {
                                const checkX = Math.round((mob.x + dirX * d) / 2);
                                const checkZ = Math.round((mob.z + dirZ * d) / 2);
                                if (maze.grid[checkZ] && maze.grid[checkZ][checkX] === 0) {
                                    hasLineOfSight = false; // Blocked by wall
                                    break;
                                }
                            }
                        }

                        if (hasLineOfSight && dot < 40) { // Max range
                            // BESTIARY: No outgoing damage from mobs
                            if (floorLevel !== 999) {
                                damageKernel(40 * delta); // 40 DPS
                                if (Math.random() < 0.1) triggerImpact(playerPos, "#00FFFF");
                            }
                        }
                    }

                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'COOLDOWN';
                        mob.bossTimer = 3.0;
                        setBossSubtitle("RECALIBRATING...", 2000);
                    }
                } else if (mob.bossState === 'COOLDOWN') {
                    mob.hasspokenFiring = false; // Reset Dialogue flag
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'IDLE';
                        mob.bossTimer = 1.0;
                    }
                }

                // Minion summoning (Phase 2) - DISABLED IN BESTIARY
                if (mob.phase === 2 && floorLevel !== 999) {
                    mob.summonTimer = (mob.summonTimer || 0) - delta;
                    if (mob.summonTimer <= 0) {
                        mob.summonTimer = 25.0; // Every 25 seconds
                        const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 Minions

                        setBossSubtitle(`FORK_PROCESS_ACTIVE. CLEAN_THE_ARENA. [SPAWNING_${count}_UNITS]`, 3000);

                        for (let k = 0; k < count; k++) {
                            const m = MobLogic.createMob('BIT_MITE', floorLevel);
                            // Spawn randomly around boss (Widened to 12m spread)
                            spawnQueue.current.push({
                                ...m,
                                instanceId: Math.random(),
                                x: mob.x + (Math.random() - 0.5) * 12,
                                z: mob.z + (Math.random() - 0.5) * 12
                            });
                        }
                        mobsDirty = true;
                    }
                }

                // Update Boss Instances (Core + Rings)
                // APPLY ROTATION TO INSTANCES
                const bossRot = mob.rotationY || 0;

                if (bossCore.current) {
                    tempObject.position.set(mob.x, 3.5, mob.z); // Core height
                    tempObject.rotation.set(0, bossRot, 0); // Apply Y rotation
                    tempObject.scale.setScalar(1);
                    tempObject.updateMatrix();
                    bossCore.current.setMatrixAt(bossC, tempObject.matrix); // Only 1 boss usually
                }
                const t = state.clock.elapsedTime;
                if (bossRing1Ref.current) {
                    tempObject.position.set(mob.x, 3.5, mob.z);
                    tempObject.rotation.set(t * 0.5, bossRot, 0); // X + Y
                    tempObject.updateMatrix();
                    bossRing1Ref.current.setMatrixAt(bossC, tempObject.matrix);
                }
                if (bossRing2Ref.current) {
                    tempObject.position.set(mob.x, 3.5, mob.z);
                    tempObject.rotation.set(0, bossRot + t * 0.4, 0); // Y + Y
                    tempObject.updateMatrix();
                    bossRing2Ref.current.setMatrixAt(bossC, tempObject.matrix);
                }
                if (bossRing3Ref.current) {
                    tempObject.position.set(mob.x, 3.5, mob.z);
                    tempObject.rotation.set(0, bossRot, t * 0.3); // Z + Y
                    tempObject.updateMatrix();
                    bossRing3Ref.current.setMatrixAt(bossC, tempObject.matrix);
                }
                if (mob.scanTimer > 0 && bossScanRef.current) {
                    tempObject.position.set(mob.x, 3.5, mob.z);
                    tempObject.rotation.set(0, bossRot, 0);
                    tempObject.scale.setScalar(1);
                    tempObject.updateMatrix();
                    bossScanRef.current.setMatrixAt(bossScanC++, tempObject.matrix);
                }
                bossC++; // Increment boss count

                // --- LIVE BOSS HP UPDATE ---
                // Only update if HP changed significantly or every 0.5s to avoid React thrashing
                if (!mob.lastReportedHp) mob.lastReportedHp = mob.currentHp;
                if (!mob.lastReportTime) mob.lastReportTime = 0;

                const now = state.clock.elapsedTime;
                if (mob.currentHp !== mob.lastReportedHp && (now - mob.lastReportTime > 0.1)) {
                    updateBossStatus({ active: true, name: mob.name, hp: mob.currentHp, maxHp: mob.maxHp });
                    mob.lastReportedHp = mob.currentHp;
                    mob.lastReportTime = now;
                }
            }


            if (mob.currentHp <= 0 && !mob.isDead) {
                mob.isDead = true;
                mobsDirty = true;

                // BESTIARY (Floor 999): Track for respawn and override XP
                let rewardXP, rewardEBits;
                if (floorLevel === 999) {
                    // Calculate XP needed to reach next level
                    const currentLevel = getLevelFromXP(gameState.xp);
                    const xpForNext = getNextLevelXP(currentLevel);
                    rewardXP = Math.max(100, xpForNext - gameState.xp + 1); // +1 to ensure bump
                    rewardEBits = Math.floor(rewardXP / 4);

                    // Track mob for 5-second respawn
                    bestiaryDeadMobs.current.push({
                        id: mob.id,
                        name: mob.name,
                        x: mob.x,
                        z: mob.z,
                        originalMob: { ...mob, currentHp: mob.maxHp, isDead: false },
                        respawnTimer: 5.0 // 5 seconds
                    });
                } else {
                    // Normal XP rewards
                    rewardXP = (mob.id === 'BIT_MITE' ? 25 : mob.id === 'NULL_WISP' ? 40 : mob.id === 'HUNTER' ? 65 : mob.id === 'STATELESS_SENTRY' ? 80 : 500);
                    rewardEBits = Math.floor(rewardXP / 4);
                }

                setGameState(prev => ({
                    ...prev,
                    xp: prev.xp + rewardXP,
                    eBits: prev.eBits + rewardEBits
                }));

                addNotification(`ENTITY_PURGED: ${mob.name} +${rewardXP} XP +${rewardEBits} eBITS`);
                if (mob.id === 'IO_SENTINEL') { setBossSubtitle("REBOOT_ABORTED.", 3000); setBossKey({ x: mob.x, z: mob.z }); updateBossStatus({ active: false }); }
            }

            if (gameState.lastScanTime && (Date.now() - gameState.lastScanTime) / 1000 < 2.5) {
                const radius = ((Date.now() - gameState.lastScanTime) / 1000) * 25, d = Math.sqrt(distSq);
                if (d < radius && d > radius - 5) {
                    mob.scanTimer = 10;
                    if (playerLevel >= 5) mob.isVulnerable = true;
                    // Add to scanned targets for mini-map
                    scannedTargets.push({ x: mob.x, z: mob.z, type: 'MOB' });
                }
            }
            if (mob.scanTimer > 0) {
                mob.scanTimer -= delta;
                if (mob.scanTimer <= 0) mob.isVulnerable = false; // Reset vulnerability
            }

            // CRITICAL: Reset scale to prevent contamination from previous mobs (especially sentry hearts)
            tempObject.scale.set(1, 1, 1);

            // Bit Mites are 35% smaller
            if (mob.id === 'BIT_MITE') {
                tempObject.scale.set(0.65, 0.65, 0.65);
            }

            tempObject.position.set(mob.x, mob.id === 'NULL_WISP' ? 3.5 : 1, mob.z); // Wisp lowered to 3.5 (Aligned with collision)
            if (floorLevel !== 999) tempObject.lookAt(playerPos.x, tempObject.position.y, playerPos.z);
            else { tempObject.rotation.set(0, 0, 0); }
            tempObject.updateMatrix();

            if (mob.id === 'BIT_MITE' && miteRef.current) {
                miteRef.current.setMatrixAt(miteC++, tempObject.matrix);
                if (mob.scanTimer > 0 && miteScanRef.current) miteScanRef.current.setMatrixAt(miteScanC++, tempObject.matrix);
            } else if (mob.id === 'NULL_WISP' && wispRef.current) {
                wispRef.current.setMatrixAt(wispC, tempObject.matrix);

                // Overlay Offset (180deg Rotation)
                if (wispOverlayRef.current) {
                    tempObject.rotateZ(Math.PI);
                    tempObject.updateMatrix();
                    wispOverlayRef.current.setMatrixAt(wispC, tempObject.matrix);
                }
                wispC++;
                if (mob.scanTimer > 0 && wispScanRef.current) wispScanRef.current.setMatrixAt(wispScanC++, tempObject.matrix);
            } else if (mob.id === 'HUNTER' && hunterRef.current) {
                hunterRef.current.setMatrixAt(hunterC++, tempObject.matrix);
                if (mob.scanTimer > 0 && hunterScanRef.current) hunterScanRef.current.setMatrixAt(hunterScanC++, tempObject.matrix);
            } else if (mob.id === 'STATELESS_SENTRY') {
                const t = state.clock.elapsedTime;
                const expansion = Math.sin(t * 1.5) * 0.15 + 0.45; // 0.3 to 0.6 range (meet at middle)
                const ti = sentryC++;

                // Middle segment (heart housing) stays centered
                if (sentryMidRef.current) {
                    tempObject.position.set(mob.x, 2.5, mob.z);
                    tempObject.rotation.y = t * 0.5; // Clockwise
                    tempObject.updateMatrix();
                    sentryMidRef.current.setMatrixAt(ti, tempObject.matrix);
                }

                // Top segment (inverted teardrop) - contracts down toward heart
                if (sentryTopRef.current) {
                    tempObject.position.y = 2.5 + expansion;
                    tempObject.rotation.y = -t * 0.8; // Counter-clockwise
                    tempObject.updateMatrix();
                    sentryTopRef.current.setMatrixAt(ti, tempObject.matrix);
                }

                // Bottom segment (raindrop) - contracts up toward heart
                if (sentryBotRef.current) {
                    tempObject.position.y = 2.5 - expansion;
                    tempObject.rotation.y = -t * 1.2; // Counter-clockwise
                    tempObject.updateMatrix();
                    sentryBotRef.current.setMatrixAt(ti, tempObject.matrix);
                }

                // Heart (core) stays centered
                if (sentryHeartRef.current) {
                    tempObject.position.set(mob.x, 2.5, mob.z);
                    tempObject.scale.setScalar(0.2);
                    tempObject.updateMatrix();
                    sentryHeartRef.current.setMatrixAt(ti, tempObject.matrix);
                }
                if (mob.scanTimer > 0 && sentryScanRef.current) {
                    tempObject.position.set(mob.x, 2.5, mob.z); tempObject.scale.setScalar(1.0); tempObject.updateMatrix();
                    sentryScanRef.current.setMatrixAt(sentryScanC++, tempObject.matrix);
                }
            }
        });

        [miteRef, wispRef, wispOverlayRef, hunterRef, sentryTopRef, sentryMidRef, sentryBotRef, sentryHeartRef, bossCore, bossRing1Ref, bossRing2Ref, bossRing3Ref, miteScanRef, wispScanRef, hunterScanRef, sentryScanRef, bossScanRef].forEach(r => {
            if (r.current) {
                r.current.count = (
                    r === miteRef ? miteC :
                        r === wispRef || r === wispOverlayRef ? wispC :
                            r === hunterRef ? hunterC :
                                r === bossCore || r === bossRing1Ref || r === bossRing2Ref || r === bossRing3Ref ? bossC :
                                    r === miteScanRef ? miteScanC :
                                        r === wispScanRef ? wispScanC :
                                            r === hunterScanRef ? hunterScanC :
                                                r === sentryScanRef ? sentryScanC :
                                                    r === bossScanRef ? bossScanC : sentryC
                );
                r.current.instanceMatrix.needsUpdate = true;
            }
        });

        if (mobsDirty) {
            const surviving = currentMobs.filter(m => m.currentHp > 0);
            if (spawnQueue.current.length > 0) { surviving.push(...spawnQueue.current); spawnQueue.current = []; }
            mobsRef.current = surviving.slice(0, MAX_MOBS);
            if (state.clock.elapsedTime - lastSyncRef.current > 0.1) { setMobs([...surviving]); lastSyncRef.current = state.clock.elapsedTime; }
        }

        // Update mini-map with scanned targets
        if (scannedTargets.length > 0) {
            updateScannedTargets(scannedTargets);
        }
        // Note: Don't clear targets - other components (LootManager, MazeRenderer) may add theirs
    });

    return (
        <group>
            {/* BIT MITE: Tetrahedron, Cyan/Magenta Texture */}
            <instancedMesh ref={miteRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <tetrahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial ref={miteMatRef} alphaMap={miteTex} emissiveMap={miteTex} emissive="#FFFFFF" emissiveIntensity={2} transparent opacity={1} />
            </instancedMesh>

            {/* NULL WISP: Sphere, Blue/Purple Texture */}
            <instancedMesh ref={wispRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial ref={wispMatRef} alphaMap={wispTex} emissiveMap={wispTex} emissive="#FFFFFF" emissiveIntensity={2} transparent opacity={1} />
            </instancedMesh>

            {/* NULL WISP OVERLAY: Second layer with opposite rotation */}
            <instancedMesh ref={wispOverlayRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.26, 16, 16]} />
                <meshStandardMaterial ref={wispOverlayMatRef} alphaMap={wispTex2} emissiveMap={wispTex2} emissive="#FFFFFF" emissiveIntensity={2} transparent opacity={1} depthWrite={false} />
            </instancedMesh>

            {/* HUNTER: Dodecahedron - Metallic Shimmer with Fade */}
            <instancedMesh ref={hunterRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <dodecahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial ref={hunterMatRef} map={hunterTex} emissiveMap={hunterTex} emissive="#FFFFFF" emissiveIntensity={1} metalness={0.8} roughness={0.2} transparent opacity={0.8} />
            </instancedMesh>

            {/* SENTRIES: 3 Segments - Top: Inverted Teardrop (15% smaller) */}
            <instancedMesh ref={sentryTopRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <cylinderGeometry args={[0.17, 0.34, 0.6, 16]} />
                <meshStandardMaterial ref={sentryTopMatRef} alphaMap={sentryTex} emissiveMap={sentryTex} emissive="#00FFFF" emissiveIntensity={1} transparent opacity={1} />
            </instancedMesh>
            {/* Sentry Middle: Sphere Housing */}
            <instancedMesh ref={sentryMidRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.45, 16, 16]} />
                <meshStandardMaterial ref={sentryMidMatRef} alphaMap={sentryTex} emissiveMap={sentryTex} emissive="#00FFFF" emissiveIntensity={1} transparent opacity={1} />
            </instancedMesh>
            {/* Sentry Bottom: Raindrop Shape (15% smaller) */}
            <instancedMesh ref={sentryBotRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <cylinderGeometry args={[0.34, 0.17, 0.6, 16]} />
                <meshStandardMaterial ref={sentryBotMatRef} alphaMap={sentryTex} emissiveMap={sentryTex} emissive="#00FFFF" emissiveIntensity={1} transparent opacity={1} />
            </instancedMesh>

            {/* Sentry Heart: Sphere Core */}
            <instancedMesh ref={sentryHeartRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial ref={sentryHeartMatRef} color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} metalness={0.8} roughness={0.3} />
            </instancedMesh>

            {/* BOSS (IO_SENTINEL): Core + 3 Rotating Rings */}
            <instancedMesh ref={bossCore} args={[null, null, 5]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial ref={bossCoreMatRef} map={bossCoreTex} emissiveMap={bossCoreTex} emissive="#FFFFFF" emissiveIntensity={0.5} metalness={0.5} roughness={0.2} />
            </instancedMesh>
            <instancedMesh ref={bossRing1Ref} args={[null, null, 5]} count={0} frustumCulled={false}>
                <torusGeometry args={[2, 0.15, 16, 32]} />
                <meshStandardMaterial ref={bossRing1MatRef} map={bossRingsTex} emissiveMap={bossRingsTex} emissive="#FF00FF" emissiveIntensity={2} transparent opacity={1} />
            </instancedMesh>
            <instancedMesh ref={bossRing2Ref} args={[null, null, 5]} count={0} frustumCulled={false}>
                <torusGeometry args={[2.3, 0.15, 16, 32]} />
                <meshStandardMaterial ref={bossRing2MatRef} map={bossRingsTex} emissiveMap={bossRingsTex} emissive="#00FFFF" emissiveIntensity={2} transparent opacity={1} />
            </instancedMesh>
            <instancedMesh ref={bossRing3Ref} args={[null, null, 5]} count={0} frustumCulled={false}>
                <torusGeometry args={[2.6, 0.15, 16, 32]} />
                <meshStandardMaterial ref={bossRing3MatRef} map={bossRingsTex} emissiveMap={bossRingsTex} emissive="#FFFF00" emissiveIntensity={2} transparent opacity={1} />
            </instancedMesh>
            {/* SCAN WIREFRAMES DISABLED - User Request (EXCEPT BOSS) */}
            <instancedMesh ref={bossScanRef} args={[null, null, 5]} count={0} frustumCulled={false}>
                <sphereGeometry args={[1.0, 32, 32]} /><meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>

            {/* SCAN WIREFRAMES - Re-enabled for feedback */}
            <instancedMesh ref={miteScanRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <tetrahedronGeometry args={[0.8, 0]} /><meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>
            <instancedMesh ref={wispScanRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <sphereGeometry args={[0.25, 16, 16]} /><meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>
            <instancedMesh ref={hunterScanRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <boxGeometry args={[0.8, 0.8, 0.8]} /><meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>
            <instancedMesh ref={sentryScanRef} args={[null, null, MAX_MOBS]} count={0} frustumCulled={false}>
                <boxGeometry args={[1.2, 3.2, 1.2]} /><meshBasicMaterial color="#EA00FF" wireframe transparent opacity={0.6} depthTest={false} />
            </instancedMesh>
            {/* Boss now uses instanced meshes below instead of BossFX component */}
            {bossKey && <KernelShard position={bossKey} maze={maze} />}
            {/* Render Boss Beams */}
            {mobs.map(m => m.id === 'IO_SENTINEL' && <BossBeam key={m.instanceId} mob={m} maze={maze} />)}
        </group>
    );
}
