import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Manage Combat State (Projectiles & Hit Registration)
 */

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {
    // We use a Ref for projectiles to avoid React Render Cycle Thrashing on every frame update
    // We only trigger re-renders when adding/removing, but the movement is ref-based
    // POOLING ARCHITECTURE (Ring Buffer)
    // MAX: 200 Projectiles (Same as InstancedMesh limit)
    // LAYOUT:
    // Positions: Float32Array(200 * 3) [x, y, z]
    // Velocities: Float32Array(200 * 3) [vx, vy, vz]
    // Life: Float32Array(200) [life]
    // Type: Float32Array(200) [0=PING, 1=SHRED]

    const MAX_PROJECTILES = 200;
    const MAX_MOBS = 50;
    const poolIndex = useRef(0);

    // Data Buffers
    const positionBuffer = useRef(new Float32Array(MAX_PROJECTILES * 3));
    const velocityBuffer = useRef(new Float32Array(MAX_PROJECTILES * 3));
    const lifeBuffer = useRef(new Float32Array(MAX_PROJECTILES));
    const typeBuffer = useRef(new Float32Array(MAX_PROJECTILES));

    // Mob Buffers (Logic Breach: Shared Memory)
    const mobPositionBuffer = useRef(new Float32Array(MAX_MOBS * 3));
    const mobLifeBuffer = useRef(new Float32Array(MAX_MOBS));
    const mobTypeBuffer = useRef(new Float32Array(MAX_MOBS));
    const mobDamageBuffer = useRef(new Float32Array(MAX_MOBS));
    const mobStatusBuffer = useRef(new Float32Array(MAX_MOBS)); // 0=None, 1=Hacked

    const impactsRef = useRef([]); // Keep impacts simple for now (Particle System usually handles this)

    const fireProjectile = useCallback((startPos, direction, type) => {
        const idx = poolIndex.current;
        poolIndex.current = (poolIndex.current + 1) % MAX_PROJECTILES;

        // Write Data
        const pMap = positionBuffer.current;
        pMap[idx * 3] = startPos.x;
        pMap[idx * 3 + 1] = startPos.y;
        pMap[idx * 3 + 2] = startPos.z;

        const vMap = velocityBuffer.current;
        const speed = type === 'PING' ? 40 : 25;
        vMap[idx * 3] = direction.x * speed;
        vMap[idx * 3 + 1] = direction.y * speed;
        vMap[idx * 3 + 2] = direction.z * speed;

        lifeBuffer.current[idx] = 60.0; // 60 Seconds (Effectively Infinite Range)
        typeBuffer.current[idx] = type === 'PING' ? 0 : 1;

    }, []);

    const fireBurst = useCallback((startPos, direction, type) => {
        // burst of 3 shots
        const delay = 100; // ms
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                fireProjectile(startPos, direction, type);
            }, i * delay);
        }
    }, [fireProjectile]);

    const triggerImpact = useCallback((pos, color) => {
        // Spawn 16-24 particles (2x density)
        const count = 16 + Math.floor(Math.random() * 10);
        for (let i = 0; i < count; i++) {
            // Defensive: ensure we have a Vector3 or compatible object
            const startPos = pos.clone ? pos.clone() : new THREE.Vector3(pos.x, pos.y || 1, pos.z);

            impactsRef.current.push({
                position: startPos,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 8, // 2x+ spread (was 3)
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                ),
                scale: Math.random() * 0.125 + 0.05, // 50% smaller (was 0.1-0.35)
                life: 0.5, // 0.5 seconds
                color: new THREE.Color(color)
            });
        }
    }, []);

    // Frame Loop Logic will be handled in a helper hook or component
    // But the Context provides the API

    // Logic moved to ProjectileSystem.jsx (Zero GC Loop)

    return (
        <CombatContext.Provider value={{
            positionBuffer, velocityBuffer, lifeBuffer, typeBuffer,
            mobPositionBuffer, mobLifeBuffer, mobTypeBuffer, mobDamageBuffer, mobStatusBuffer,
            MAX_PROJECTILES, MAX_MOBS, impactsRef, fireProjectile, fireBurst, triggerImpact
        }}>
            {children}
        </CombatContext.Provider>
    );
};

export const useCombat = () => useContext(CombatContext);
