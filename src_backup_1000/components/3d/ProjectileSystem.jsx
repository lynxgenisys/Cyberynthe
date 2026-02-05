import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCombat } from '../../context/CombatContext';
import { useGame } from '../../context/GameContext';
import * as THREE from 'three';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Render Active Projectiles (OPTIMIZED)
 * MECHANIC: InstancedMesh for <1 draw call per frame
 */

const MAX_PROJECTILES = 200;

export default function ProjectileSystem() {
    const { positionBuffer, velocityBuffer, lifeBuffer, typeBuffer, mobPositionBuffer, mobLifeBuffer, mobTypeBuffer, mobDamageBuffer, mobStatusBuffer, MAX_PROJECTILES, MAX_MOBS, triggerImpact } = useCombat();
    const { gameState, getLevelFromXP } = useGame();
    const meshRef = useRef();

    // Reusable Temporary Objects
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Initialize Color Buffer
    useLayoutEffect(() => {
        if (meshRef.current) {
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PROJECTILES * 3), 3);
        }
    }, [MAX_PROJECTILES]);

    useFrame((state, delta) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        // PAUSE LOGIC
        if (gameState.isPaused) return;

        const pArr = positionBuffer.current;
        const vArr = velocityBuffer.current;
        const lArr = lifeBuffer.current;
        const tArr = typeBuffer.current;

        const playerLevel = getLevelFromXP(gameState.xp || 0);

        // Iterate ALL slots (Ring Buffer is sparse)
        for (let i = 0; i < MAX_PROJECTILES; i++) {
            if (lArr[i] <= 0) {
                tempObject.scale.setScalar(0);
                tempObject.updateMatrix();
                mesh.setMatrixAt(i, tempObject.matrix);
                continue;
            }

            // ACTIVE: Update Physics
            lArr[i] -= delta;
            if (lArr[i] <= 0) {
                tempObject.scale.setScalar(0);
                tempObject.updateMatrix();
                mesh.setMatrixAt(i, tempObject.matrix);
                continue;
            }

            // Move
            const idx3 = i * 3;
            pArr[idx3] += vArr[idx3] * delta;
            pArr[idx3 + 1] += vArr[idx3 + 1] * delta;
            pArr[idx3 + 2] += vArr[idx3 + 2] * delta;

            const px = pArr[idx3], py = pArr[idx3 + 1], pz = pArr[idx3 + 2];

            // COLLISION: MOBS
            if (mobPositionBuffer && mobPositionBuffer.current) {
                const mPos = mobPositionBuffer.current;
                const mLife = mobLifeBuffer.current;
                for (let m = 0; m < MAX_MOBS; m++) {
                    if (mLife[m] <= 0) continue;
                    const mx = mPos[m * 3], my = mPos[m * 3 + 1], mz = mPos[m * 3 + 2];
                    const mdx = px - mx, mdy = py - my, mdz = pz - mz;

                    // COLLISION RADIUS LOGIC
                    // Type 4 (Boss) needs much larger radius (Core is high, body is wide)
                    // Standard: 1.0 (Radius 1.0)
                    // Boss: 16.0 (Radius 4.0 covers the 2.0 height diff)
                    const hitRadiusSq = (mobTypeBuffer.current[m] === 4) ? 16.0 : 1.0;

                    if (mdx * mdx + mdy * mdy + mdz * mdz < hitRadiusSq) {
                        lArr[i] = 0;
                        // Data Spike damage: 2 base + 1.5 per level
                        const dataSpikeBaseDamage = 2 + (playerLevel * 1.5);
                        mobDamageBuffer.current[m] += (tArr[i] === 0 ? dataSpikeBaseDamage : 25);
                        // Logic Breach: Apply Hacked status if Shred V2 (Type 1, Lvl 5+)
                        if (tArr[i] === 1 && playerLevel >= 5 && mobStatusBuffer && mobStatusBuffer.current) {
                            mobStatusBuffer.current[m] = 1;
                        }

                        const impactColor = (tArr[i] === 1 && playerLevel >= 5) ? '#00FF00' : (tArr[i] === 1 ? '#EA00FF' : '#00FFFF');
                        triggerImpact({ x: px, y: py, z: pz }, impactColor);
                        break;
                    }
                }
            }
            if (lArr[i] <= 0) continue;

            // COLLISION: WALL
            const gx = Math.round(px / 2), gz = Math.round(pz / 2);
            if (gameState.mazeGrid && gx >= 0 && gx < gameState.mazeWidth && gz >= 0 && gz < gameState.mazeHeight) {
                if (gameState.mazeGrid[gz][gx] === 0) {
                    lArr[i] = 0;
                    const impactColor = (tArr[i] === 1 && playerLevel >= 5) ? '#00FF00' : (tArr[i] === 1 ? '#EA00FF' : '#00FFFF');
                    triggerImpact({ x: px, y: py, z: pz }, impactColor);
                    continue;
                }
            }

            // COLLISION: FLOOR
            if (py <= 0.2) {
                lArr[i] = 0;
                const impactColor = (tArr[i] === 1 && playerLevel >= 5) ? '#00FF00' : (tArr[i] === 1 ? '#EA00FF' : '#00FFFF');
                triggerImpact({ x: px, y: 0, z: pz }, impactColor);
                continue;
            }

            // RENDER
            tempObject.position.set(px, py, pz);
            tempObject.lookAt(px + vArr[idx3], py + vArr[idx3 + 1], pz + vArr[idx3 + 2]);

            const isPing = tArr[i] === 0;
            if (isPing) {
                tempColor.set('#00FFFF').multiplyScalar(3);
                tempObject.scale.set(1, 1, 1);
            } else {
                tempColor.set(playerLevel >= 5 ? '#00FF00' : '#EA00FF').multiplyScalar(3);
                tempObject.scale.set(1, playerLevel >= 5 ? 0.5 : 1, playerLevel >= 5 ? 0.5 : 1);
            }

            tempObject.updateMatrix();
            mesh.setMatrixAt(i, tempObject.matrix);
            mesh.setColorAt(i, tempColor);
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });


    return (
        <instancedMesh ref={meshRef} args={[null, null, MAX_PROJECTILES]} frustumCulled={false}>
            {/* Spherical projectiles - Tiny (approx 2x reticle bead size) */}
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial
                toneMapped={false}
                color="#FFFFFF" // Tinted by instanceColor
            />
        </instancedMesh>
    );
}
