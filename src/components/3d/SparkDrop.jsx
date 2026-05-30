import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

/**
 * IDENTITY: AESTHETICS_NODE
 * DIRECTIVE: Render physical loot drops as glowing, dancing sparks
 */
const SparkDrop = ({ position, type, color = '#00FFFF', isSpecial = false, isFullRecovery = false }) => {
    const groupRef = useRef();
    const meshRef = useRef();
    const materialRef = useRef();

    // Randomize initial offsets for the bobbing/dancing animation
    const offsets = useMemo(() => ({
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 0.5
    }), []);

    useFrame((state, delta) => {
        if (!groupRef.current || !meshRef.current) return;

        const time = state.clock.elapsedTime;

        // Bobbing up and down
        groupRef.current.position.y = position[1] + Math.sin(time * offsets.speed + offsets.y) * 0.2;
        
        // Slight dancing/wobbling on X and Z
        groupRef.current.position.x = position[0] + Math.cos(time * offsets.speed * 0.7 + offsets.x) * 0.1;
        groupRef.current.position.z = position[2] + Math.sin(time * offsets.speed * 0.8 + offsets.z) * 0.1;

        // Spinning
        meshRef.current.rotation.x += delta * 2;
        meshRef.current.rotation.y += delta * 3;

        // Special drops (Logic Shard) cycle colors
        if (isSpecial && materialRef.current) {
            // Cycle between Cyan (#00FFFF) and Magenta (#EA00FF)
            const cycle = (Math.sin(time * 3) + 1) / 2; // 0 to 1
            const r = 0 + (0.917 * cycle); // 0 to 0.917 (EA)
            const g = 1 - cycle;           // 1 to 0
            const b = 1;                   // Always 1
            materialRef.current.color.setRGB(r, g, b);
            materialRef.current.emissive.setRGB(r, g, b);
        } else if (isFullRecovery && materialRef.current) {
            // Cycle between Green (#00FFAA) and Magenta (#EA00FF)
            const cycle = (Math.sin(time * 5) + 1) / 2; 
            const r = 0 + (0.917 * cycle); 
            const g = 1 - cycle;           
            const b = 0.66 + (0.34 * cycle); 
            materialRef.current.color.setRGB(r, g, b);
            materialRef.current.emissive.setRGB(r, g, b);
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[isSpecial ? 0.3 : 0.15, 0]} />
                <meshStandardMaterial 
                    ref={materialRef}
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={isSpecial ? 2 : 1}
                    transparent 
                    opacity={0.8} 
                    wireframe={isSpecial}
                />
            </mesh>
            
            {/* Ambient glow */}
            <pointLight 
                color={color} 
                intensity={isSpecial ? 2 : 0.8} 
                distance={3} 
            />

            {/* Sparkles */}
            <Sparkles 
                count={isSpecial ? 30 : 10} 
                scale={isSpecial ? 2 : 1} 
                size={isSpecial ? 4 : 2} 
                speed={isSpecial ? 2 : 1} 
                color={color}
            />
        </group>
    );
};

export default React.memo(SparkDrop);
