import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../../context/GameContext';
import * as THREE from 'three';
import cacheNodeSkin from '../../assets/cache_node_skin.webp';

/**
 * IDENTITY: ARCH_SYS_01
 * DIRECTIVE: Trinity Data Node - L1 Cache Extraction Point
 * VISUAL: Octahedron Core + Wireframe Sphere Shell
 */

const DataNode = React.memo(({ cache, onExtract }) => {
    const { gameState, fastStateRef } = useGame();
    const groupRef = useRef();
    const octahedronRef = useRef();
    const beadRef = useRef();
    const [isProximity, setIsProximity] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractProgress, setExtractProgress] = useState(0);
    const [texture, setTexture] = useState(null);

    const isLooted = cache.isLooted;

    // Load texture
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        const tex = loader.load(cacheNodeSkin);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        setTexture(tex);

        return () => {
            tex.dispose();
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isProximity) {
                setIsProximity(false);
            }
        };
    }, []);

    useFrame((state, delta) => {
        if (isLooted) return;

        const playerPos = fastStateRef.current.playerWorldPos;
        if (!playerPos) return;

        const dx = playerPos.x - cache.x;
        const dz = playerPos.z - cache.z;
        const distSq = dx * dx + dz * dz;

        // Proximity check (3 units = 9 squared)
        if (distSq < 9) {
            if (!isProximity) setIsProximity(true);

            // Handshake progress (2 second extraction)
            // GHOST MODE: 0.2s Extraction
            const extractTime = (gameState.gameMode === 'ghost') ? 0.2 : 2.0;

            setExtractProgress(prev => {
                const next = Math.min(prev + delta / extractTime, 1); // Normalized rate
                return next;
            });

            if (extractProgress >= 1 && !isExtracting) {
                setIsExtracting(true);
                // Trigger extraction animation then callback
                const animDelay = (gameState.gameMode === 'ghost') ? 50 : 500;
                setTimeout(() => {
                    onExtract(cache.id);
                }, animDelay); // Wait for spin animation
            }
        } else {
            // Decay progress
            if (isProximity) setIsProximity(false);
            if (extractProgress > 0) {
                setExtractProgress(prev => Math.max(prev - delta, 0));
            }
        }

        // ANIMATIONS
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        // Octahedron rotation (normal or 5x during extraction)
        if (octahedronRef.current) {
            const spinSpeed = isExtracting ? 5 : 1;
            octahedronRef.current.rotation.y += delta * spinSpeed;
            octahedronRef.current.rotation.x += delta * 0.3 * spinSpeed;
        }



        // Bead pulse
        if (beadRef.current) {
            const pulse = 1 + Math.sin(time * 2) * 0.2;
            beadRef.current.scale.setScalar(pulse * 0.3);
        }

        // Group float (gentle bob)
        groupRef.current.position.y = 0.5 + Math.sin(time * 1.5) * 0.1;


    });

    if (isLooted) return null;

    // Emissive intensity based on time
    const emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;

    return (
        <group ref={groupRef} position={[cache.x, 0.5, cache.z]} scale={[0.5, 0.5, 0.5]}>


            {/* Octahedron Core */}
            <mesh ref={octahedronRef}>
                <octahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial
                    color="#FFFFFF"
                    emissive={isExtracting ? "#FF00FF" : "#00FFFF"}
                    emissiveIntensity={isExtracting ? 5 : (emissiveIntensity * 3)}
                    metalness={1.0}
                    roughness={0.0}
                    map={texture}
                    emissiveMap={texture}
                    transparent={true}
                    opacity={0.9}
                />
            </mesh>

            {/* Center Bead */}
            <mesh ref={beadRef}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial
                    color="#00FFFF"
                    emissive="#00FFFF"
                    emissiveIntensity={10}
                    metalness={1}
                    roughness={0}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            {/* Point Light for glow */}
            <pointLight
                color={isExtracting ? "#FF00FF" : "#00FFFF"}
                intensity={isProximity ? 2 : 1}
                distance={5}
            />

            {/* Proximity indicator - floating text */}
            {isProximity && !isExtracting && (
                <group position={[0, 1.5, 0]}>
                    {/* This would be a sprite/text in a real implementation */}
                    <mesh position={[0, 0.2 + Math.sin(Date.now() * 0.003) * 0.1, 0]}>
                        <planeGeometry args={[0.1, 0.1]} />
                        <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} />
                    </mesh>
                </group>
            )}

            {/* Extract progress indicator */}
            {extractProgress > 0 && extractProgress < 1 && (
                <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.9, 1.0, 32, 1, 0, Math.PI * 2 * extractProgress]} />
                    <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
});

export default DataNode;
