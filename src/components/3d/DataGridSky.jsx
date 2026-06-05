import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * IDENTITY: AESTHETICS_NODE
 * DIRECTIVE: Render Sector 3 (Floors 21-30) "Logic Lattice" Sky
 */
export default function DataGridSky() {
    const groupRef = useRef();

    // Create a procedural hex/grid texture
    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#0a0500';
        ctx.fillRect(0, 0, 512, 512);

        // Draw grid lines
        ctx.strokeStyle = '#ffaa00'; // Gold/Orange
        ctx.lineWidth = 4;

        // Vertical lines
        for (let i = 0; i <= 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }

        // Random intersection nodes
        ctx.fillStyle = '#ff5500';
        for (let x = 0; x <= 512; x += 64) {
            for (let y = 0; y <= 512; y += 64) {
                if (Math.random() > 0.5) {
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        // Tile the texture across the large sphere
        tex.repeat.set(16, 8);
        return tex;
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= delta * 0.02; // Slow counter-clockwise spin
            gridTexture.offset.y += delta * 0.05; // Lines scrolling downwards
            gridTexture.offset.x += delta * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Outer Grid Sphere */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial 
                    map={gridTexture} 
                    side={THREE.BackSide} 
                    transparent 
                    opacity={0.3} 
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            
            {/* Inner rotating data rings */}
            {[...Array(3)].map((_, i) => (
                <mesh key={`ring-${i}`} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                    <torusGeometry args={[150 + i * 20, 2, 16, 100]} />
                    <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} blending={THREE.AdditiveBlending} wireframe />
                </mesh>
            ))}
        </group>
    );
}
