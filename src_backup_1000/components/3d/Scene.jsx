import React, { Suspense, useRef, useMemo } from 'react';
import { useThree, extend, Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

import MazeRenderer from './MazeRenderer';
import Player from './Player';
import ProjectileSystem from './ProjectileSystem';
import ImpactSystem from './ImpactSystem';
import Shockwave from './Shockwave';
import AuroraSky from './AuroraSky';
import { useGame, GameContext } from '../../context/GameContext';
import { PlayerContext } from '../../context/PlayerContext';
import { InventoryContext } from '../../context/InventoryContext';
import { CombatContext } from '../../context/CombatContext';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Environmental Refactor (Parallax Streams + Texture Bleed)
 */

// PROCEDURAL BINARY TEXTURE GENERATOR
const createBinaryTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Clear (Transparent)
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 1024);

    // Draw Binary
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00FFFF'; // Cyan Text
    ctx.textAlign = 'center';

    for (let i = 0; i < 400; i++) { // Render random strings
        const x = Math.random() * 512;
        const y = Math.random() * 1024;
        const char = Math.random() > 0.5 ? '1' : '0';
        ctx.globalAlpha = Math.random() * 0.5 + 0.2;
        ctx.fillText(char, x, y);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

// COMPONENT: INFORMATION STREAM (Sector 01 Background)
const InformationStream = () => {
    const meshRef = useRef();
    const texture = useMemo(() => createBinaryTexture(), []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05; // Slow Spin
            texture.offset.y += delta * 0.2; // Vertical Scroll
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={[1, 2, 1]}>
            {/* Massive Cylinder surrounding the world */}
            <cylinderGeometry args={[200, 200, 200, 32, 1, true]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.3}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
};

// COMPONENT: TEXTURE BLEED SPHERE (Global Glitch Layer)
const TextureBleedSphere = () => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.z += 0.001;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[300, 32, 32]} />
            <meshBasicMaterial
                color="#AA00FF"
                wireframe
                transparent
                opacity={0.08}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

const CyberScene = () => {
    const { gameState } = useGame();
    const isQuarantine = gameState.visualFilter === 'QUARANTINE_LUT';
    // Deep Violet for Quarantine, Standard Deep Void otherwise
    const fogColor = isQuarantine ? '#1a0520' : '#000000'; // Darker fog for Aurora
    const lightColor = isQuarantine ? '#ff00ff' : '#EA00FF';

    const isSector1 = gameState.floorLevel <= 10;

    return (
        <>
            <color attach="background" args={[fogColor]} />

            {isSector1 ? (
                <>
                    {/* SECTOR 01: FRACTAL AURORA SKY */}
                    <AuroraSky />
                    <fog attach="fog" args={[fogColor, 5, 55]} />
                    <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </>
            ) : (
                <>
                    {/* SECTOR 02: PHYSICAL LAYER */}
                    <fog attach="fog" args={['#050505', 10, 60]} />
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                    <gridHelper args={[500, 100, 0x333333, 0x111111]} position={[0, -2, 0]} />

                    {/* Distant Structural Suggestion */}
                    <mesh position={[0, 50, -100]}>
                        <boxGeometry args={[200, 10, 10]} />
                        <meshBasicMaterial color="#331100" transparent opacity={0.2} />
                    </mesh>
                    <TextureBleedSphere />
                </>
            )}

            {/* AMBIENT GLOW (DARKER FOR MYSTERY) */}
            <ambientLight intensity={0.2} color="#FFFFFF" />
            <pointLight position={[10, 10, 10]} intensity={0.5} color={lightColor} />

            <Physics gravity={[0, -20, 0]}>
                <MazeRenderer />
                <Player />
            </Physics>

            <ProjectileSystem />
            <ImpactSystem />
            <Shockwave />

            {/* POST PROCESSING */}
            <EffectComposer>
                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={0.5} />
                <Noise opacity={0.1} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
};

export default function Scene3D() {
    return (
        <div className="absolute inset-0 -z-10">
            {/* BRIDGE CONTEXTS INTO CANVAS */}
            <GameContext.Consumer>
                {game => (
                    <PlayerContext.Consumer>
                        {player => (
                            <InventoryContext.Consumer>
                                {inventory => (
                                    <CombatContext.Consumer>
                                        {combat => (
                                            <Canvas shadows camera={{ position: [0, 5, 0], fov: 60 }}>
                                                <GameContext.Provider value={game}>
                                                    <PlayerContext.Provider value={player}>
                                                        <InventoryContext.Provider value={inventory}>
                                                            <CombatContext.Provider value={combat}>
                                                                <Suspense fallback={null}>
                                                                    <CyberScene />
                                                                </Suspense>
                                                            </CombatContext.Provider>
                                                        </InventoryContext.Provider>
                                                    </PlayerContext.Provider>
                                                </GameContext.Provider>
                                            </Canvas>
                                        )}
                                    </CombatContext.Consumer>
                                )}
                            </InventoryContext.Consumer>
                        )}
                    </PlayerContext.Consumer>
                )}
            </GameContext.Consumer>
        </div>
    );
}
