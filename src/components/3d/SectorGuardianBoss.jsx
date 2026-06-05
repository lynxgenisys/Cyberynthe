import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function SectorGuardianBoss({ mob }) {
    const groupRef = useRef();
    const coreRef = useRef();
    const shieldsRef = useRef([]);

    // Load textures
    const shieldTex = useTexture('/boss_shield_texture.png');
    const bodyTex = useTexture('/boss_body_texture.png');
    
    // Set texture wrapping
    useMemo(() => {
        shieldTex.wrapS = shieldTex.wrapT = THREE.RepeatWrapping;
        shieldTex.repeat.set(2, 2);
        bodyTex.wrapS = bodyTex.wrapT = THREE.RepeatWrapping;
        bodyTex.repeat.set(2, 2);
    }, [shieldTex, bodyTex]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Sync position & rotation from mob state
        groupRef.current.position.set(mob.x, 3.5, mob.z); // Hovering height
        groupRef.current.rotation.y = mob.rotationY || 0;

        const time = state.clock.elapsedTime;
        
        // Hover animation
        groupRef.current.position.y = 3.5 + Math.sin(time * 2.0) * 0.5;

        // Core pulsing
        if (coreRef.current) {
            coreRef.current.rotation.x += delta * 0.5;
            coreRef.current.rotation.y += delta * 0.7;
            const targetScale = mob.bossState === 'FIRING' ? 1.5 : 1.0;
            coreRef.current.scale.setScalar(THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.1));
        }

        // Shields rotating
        shieldsRef.current.forEach((shield, i) => {
            if (shield) {
                const speed = mob.bossState === 'FIRING' ? 4.0 : 1.0;
                shield.rotation.y += delta * speed * (i % 2 === 0 ? 1 : -1);
                shield.rotation.z = Math.sin(time * 2 + i) * 0.2;
            }
        });
    });

    const isVulnerable = mob.isVulnerable;
    const isFiring = mob.bossState === 'FIRING';
    const isCharging = mob.bossState === 'CHARGING';
    
    const coreColor = isVulnerable ? "#FFFF00" : (isFiring ? "#FFFFFF" : (isCharging ? "#FFAA00" : "#FF0000"));

    // 4 Orbiting Shield Plates
    const shields = [];
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i;
        shields.push(
            <group key={`shield-${i}`} rotation={[0, angle, 0]} ref={el => shieldsRef.current[i] = el}>
                <mesh position={[4, 0, 0]}>
                    <boxGeometry args={[0.5, 4, 2]} />
                    <meshStandardMaterial 
                        map={shieldTex}
                        color="#222222" 
                        emissive={coreColor} 
                        emissiveIntensity={isVulnerable ? 0.2 : 0.8} 
                        metalness={0.9} 
                        roughness={0.1} 
                        transparent
                        opacity={0.9}
                        wireframe={isVulnerable}
                    />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={groupRef} scale={0.9}>
            {/* CORE (Octahedron) */}
            <mesh ref={coreRef}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial 
                    map={bodyTex}
                    color="#FFFFFF" 
                    emissive={coreColor} 
                    emissiveIntensity={isFiring ? 2.0 : 1.0} 
                    wireframe={isVulnerable} 
                    metalness={0.5} 
                    roughness={0.2} 
                />
                <pointLight position={[0, 0, 0]} intensity={isFiring ? 2 : 1} distance={15} color={coreColor} />
            </mesh>

            {/* SHIELDS */}
            {shields}

            {/* SCAN WIREFRAME */}
            {mob.scanTimer > 0 && (
                <mesh>
                    <sphereGeometry args={[4.5, 16, 16]} />
                    <meshBasicMaterial color="#FF0000" wireframe transparent opacity={0.5} depthTest={false} />
                </mesh>
            )}
        </group>
    );
}
