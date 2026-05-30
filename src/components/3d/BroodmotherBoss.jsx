import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';

export default function BroodmotherBoss({ mob }) {
    const groupRef = useRef();
    const bodyRef = useRef();
    const headRef = useRef();
    const legsRef = useRef([]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Sync position & rotation from mob state
        groupRef.current.position.set(mob.x, 2.0, mob.z);
        groupRef.current.rotation.y = mob.rotationY || 0;

        // Hover animation
        const time = state.clock.elapsedTime;
        groupRef.current.position.y = 2.0 + Math.sin(time * 2) * 0.3;

        // Body pulsing/rotation
        if (bodyRef.current) {
            bodyRef.current.rotation.x += delta * 0.2;
            bodyRef.current.rotation.z += delta * 0.2;
            // Scale pulse based on state
            const targetScale = mob.bossState === 'SPAWNING' ? 1.2 : 1.0;
            bodyRef.current.scale.setScalar(THREE.MathUtils.lerp(bodyRef.current.scale.x, targetScale, 0.1));
        }

        // Head looking around slightly
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(time * 3) * 0.2;
        }

        // Leg movement (creepy spider wiggling)
        legsRef.current.forEach((leg, i) => {
            if (leg) {
                leg.rotation.z = Math.sin(time * 5 + i) * 0.2;
                leg.rotation.x = Math.cos(time * 4 + i) * 0.2;
            }
        });
    });

    const isVulnerable = mob.isVulnerable;
    const bodyColor = isVulnerable ? "#FFFF00" : "#88AA00";
    const emissiveColor = isVulnerable ? "#FFFF00" : "#445500";

    // 6 legs spread around
    const legs = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        legs.push(
            <group key={`leg-${i}`} rotation={[0, angle, 0]} position={[0, -0.5, 0]}>
                <mesh ref={el => legsRef.current[i] = el} position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <cylinderGeometry args={[0.1, 0.05, 2, 8]} />
                    <meshStandardMaterial color="#222222" emissive="#111100" />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={groupRef}>
            {/* BODY (Flattened D20) */}
            <mesh ref={bodyRef} scale={[1, 0.7, 1]} position={[0, 0, 0]}>
                <icosahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color={bodyColor} emissive={emissiveColor} wireframe={false} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh scale={[1.05, 0.75, 1.05]}>
                <icosahedronGeometry args={[1.5, 0]} />
                <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.2} />
            </mesh>

            {/* HEAD (Inverted Pyramid = Tetrahedron) */}
            <mesh ref={headRef} position={[0, 0, 1.2]} rotation={[Math.PI, 0, 0]}>
                <tetrahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial color="#88AA00" emissive="#445500" metalness={0.8} />
            </mesh>

            {/* LEGS */}
            {legs}

            {/* SCAN WIREFRAME (If scanned) */}
            {mob.scanTimer > 0 && (
                <mesh scale={[1.8, 1.8, 1.8]}>
                    <icosahedronGeometry args={[1.5, 0]} />
                    <meshBasicMaterial color="#FFFF00" wireframe transparent opacity={0.8} depthTest={false} />
                </mesh>
            )}
        </group>
    );
}
