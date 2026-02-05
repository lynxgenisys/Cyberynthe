import React, { useRef, useLayoutEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';

/**
 * VISUAL_FX: SCANNER_PULSE
 * Description: A "Wall of Code" radar ping that expands from the player.
 */

export default function Shockwave() {
    const groupRef = useRef();
    const cylinderRef = useRef();
    const ringRef = useRef();
    const materialRef = useRef();
    const ringMatRef = useRef();
    const [active, setActive] = useState(false);
    const timeRef = useRef(0);
    const { gameState } = useGame(); // Use Context to notify HUD

    // We now rely on GameContext.lastScanTime to trigger visuals
    React.useEffect(() => {
        if (gameState.lastScanTime && Date.now() - gameState.lastScanTime < 100) {
            triggerPulse();
        }
    }, [gameState.lastScanTime]);

    const triggerPulse = () => {
        setActive(true);
        timeRef.current = 0;
        if (groupRef.current) {
            groupRef.current.visible = true;
        }
    };

    useFrame((state, delta) => {
        if (!active || !groupRef.current) return;

        timeRef.current += delta;
        const duration = 2.0; // Slower expanded duration
        const progress = timeRef.current / duration;

        if (progress >= 1) {
            setActive(false);
            groupRef.current.visible = false;
            return;
        }

        // 1. EXPANSION (Radius 1 -> 50)
        const radius = 1 + (progress * 50);

        // Update Group Position (Follow Camera XZ)
        const camPos = state.camera.position;
        groupRef.current.position.set(camPos.x, 0, camPos.z);
        groupRef.current.visible = true;

        // SCALE CHILDREN
        // Cylinder (Wall): Scale X/Z only. Y is height.
        if (cylinderRef.current) {
            cylinderRef.current.scale.set(radius, 1, radius); // Y fixed
        }

        // Torus (Floor Ring): Scale X/Y (since it lives flat? No, Torus is XY plane rotated). 
        // Torus is created lying flat? "rotation={[-Math.PI / 2, 0, 0]}" usually. 
        // My previous code didn't rotate the torus, so it was a standing tire.
        // Let's make it a lying down ring.
        if (ringRef.current) {
            ringRef.current.scale.set(radius, radius, 1); // Scale X/Y because of rotation?
            // Actually, if I rotate X -90, X->X, Y->Z. So scale X, Y.
        }

        // 3. FADE OUT
        if (materialRef.current && ringMatRef.current) {
            const alpha = 1.0 - Math.pow(progress, 2);
            materialRef.current.opacity = alpha * 0.3; // Wall is faint
            ringMatRef.current.opacity = alpha * 1.0;  // Ring is bright
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            {/* WALL OF CODE (Cylinder) */}
            <mesh ref={cylinderRef} position={[0, 5, 0]} frustumCulled={false} renderOrder={100}>
                <cylinderGeometry args={[1, 1, 10, 32, 1, true]} />
                <meshBasicMaterial
                    ref={materialRef}
                    color="#00FF00"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    depthTest={true} // OCCLUDE BY WALLS
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* FLOOR RING (Scanner) */}
            <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={101}>
                {/* Radius 1, Tube 0.05 */}
                <torusGeometry args={[1, 0.05, 16, 64]} />
                <meshBasicMaterial ref={ringMatRef} color="#00FF00" transparent opacity={1} depthTest={false} />
            </mesh>
        </group>
    );
}
