import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCombat } from '../../context/CombatContext';
import * as THREE from 'three';

/**
 * IDENTITY: FX_RENDERER_01
 * DIRECTIVE: Visualize Kinetic Impacts (Glitch Scatter)
 */

const MAX_PARTICLES = 1500;

export default function ImpactSystem() {
    const { impactsRef } = useCombat();
    const meshRef = useRef();

    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    useLayoutEffect(() => {
        if (meshRef.current) {
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
        }
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const particles = impactsRef.current;

        // 1. UPDATE
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.life -= delta;
            p.position.addScaledVector(p.velocity, delta);
            // Drag
            p.velocity.multiplyScalar(0.95);
        }

        // 2. CLEANUP
        if (particles.some(p => p.life <= 0)) {
            impactsRef.current = particles.filter(p => p.life > 0);
        }

        // 3. RENDER
        const activeCount = Math.min(impactsRef.current.length, MAX_PARTICLES);
        meshRef.current.count = activeCount;

        for (let i = 0; i < activeCount; i++) {
            const p = impactsRef.current[i];

            tempObject.position.copy(p.position);
            tempObject.scale.setScalar(p.scale * (p.life / 0.5)); // Shrink out
            tempObject.rotation.x += delta * 10;
            tempObject.rotation.y += delta * 10;
            tempObject.updateMatrix();

            meshRef.current.setMatrixAt(i, tempObject.matrix);
            meshRef.current.setColorAt(i, p.color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, MAX_PARTICLES]} frustumCulled={false}>
            {/* Chunky "Glitch Pixels" */}
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial
                toneMapped={false}
                transparent
                opacity={1.0}
            />
        </instancedMesh>
    );
}
