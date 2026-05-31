import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';
import cyberChitinSkinSrc from '../../assets/mobs/cyber_chitin_skin.png';
import biteMiteSkinSrc from '../../assets/mobs/Bite_Mite_Skin.webp';

export default function ByteMotherBoss({ mob }) {
    const groupRef = useRef();
    const bodyRef = useRef();
    const headRef = useRef();
    const legsRef = useRef([]);
    const [chitinTex, setChitinTex] = useState(null);
    const [biteMiteTex, setBiteMiteTex] = useState(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(cyberChitinSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(3, 3);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            setChitinTex(tex);
        });
        loader.load(biteMiteSkinSrc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            setBiteMiteTex(tex);
        });
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Sync position & rotation from mob state
        groupRef.current.position.set(mob.x, 1.0, mob.z); // On the floor
        groupRef.current.rotation.y = mob.rotationY || 0;

        // Hover animation (reduced so it stays on floor)
        const time = state.clock.elapsedTime * 2.0; // 200% animation speed
        groupRef.current.position.y = 1.0 + Math.sin(time * 5.0) * 0.02; // Very subtle wiggle

        // Body pulsing/rotation
        if (bodyRef.current) {
            bodyRef.current.rotation.x += delta * 0.4;
            bodyRef.current.rotation.z += delta * 0.4;
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
                leg.rotation.z = Math.sin(time * 10 + i) * 0.2;
                leg.rotation.x = Math.cos(time * 8 + i) * 0.2;
            }
        });
    });

    const isVulnerable = mob.isVulnerable;
    const bodyColor = isVulnerable ? "#FFFF00" : "#2A3A4A";
    const emissiveColor = isVulnerable ? "#FFFF00" : "#0A1520";

    // 6 legs spread around (Attached to middle of body, 50% height)
    const legs = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        legs.push(
            <group key={`leg-${i}`} rotation={[0, angle, 0]} position={[0, 0, -1.0]}>
                <mesh ref={el => legsRef.current[i] = el} position={[2.5, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <cylinderGeometry args={[0.42, 0.21, 2.45, 8]} />
                    <meshStandardMaterial map={biteMiteTex} color="#55AAFF" emissive="#003366" emissiveIntensity={0.5} metalness={0.4} roughness={0.6} />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={groupRef} scale={1.02}>
            {/* BODY (Flattened D20, Elongated) */}
            <mesh ref={bodyRef} scale={[2.0, 1.4, 3.0]} position={[0, 0, 0]}>
                <icosahedronGeometry args={[1.5, 1]} />
                <meshStandardMaterial map={chitinTex} emissiveMap={chitinTex} color={isVulnerable ? "#FFFF00" : "#FFFFFF"} emissive={isVulnerable ? "#444400" : "#00FFFF"} emissiveIntensity={isVulnerable ? 1.0 : 1.2} wireframe={false} metalness={0.7} roughness={0.3} />
                <pointLight position={[0, 2, 0]} intensity={1.5} distance={8} color={isVulnerable ? "#FFFF00" : "#2244AA"} />
            </mesh>

            {/* HEAD (Inverted Pyramid = Tetrahedron) */}
            <mesh ref={headRef} position={[0, 0.2, 1.8]} rotation={[Math.PI, 0, 0]}>
                <tetrahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial map={chitinTex} emissiveMap={chitinTex} color="#FFFFFF" emissive={isVulnerable ? "#444400" : "#00FFFF"} emissiveIntensity={1.0} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* LEGS */}
            {legs}

            {/* SCAN WIREFRAME & CRIT POINT (If scanned) */}
            {mob.scanTimer > 0 && (
                <>
                    {/* CRIT POINT (Byte Mite Pooper Spawner) attached to back */}
                    <mesh position={[0, 0, -2.8]}>
                        <octahedronGeometry args={[0.8, 0]} />
                        <meshBasicMaterial color={isVulnerable ? "#FF0000" : "#FF8800"} wireframe={!isVulnerable} transparent opacity={isVulnerable ? 1.0 : 0.8} depthTest={false} />
                    </mesh>
                </>
            )}
        </group>
    );
}



