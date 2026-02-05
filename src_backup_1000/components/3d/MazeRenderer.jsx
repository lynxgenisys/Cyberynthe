import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../../context/GameContext';
// import { generateMaze } from '../../engine/MazeGenerator'; // Legacy Sync
// Worker Import handled via new URL() pattern
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import MobManager from './MobManager';
import LootManager from './LootManager';
import InstancedWalls from './InstancedWalls';

import HazardManager from './HazardManager';
import * as THREE from 'three';

import wallGlitchASrc from '../../assets/Wall_GlitchCode_A.webp';
import wallGlitchBSrc from '../../assets/Wall_GlitchCode_B.webp';
import wallGlitchAASrc from '../../assets/Wall_GlitchCode_AA.webp';
import wallCityASrc from '../../assets/Wall_City_A.webp';
import floorASrc from '../../assets/Floor_A.webp';
import floorCSrc from '../../assets/Floor_C.webp';

/**
 * IDENTITY: ARCH_SYS_01
 * DIRECTIVE: Render the 3D Labyrinth with HD Procedural Textures & Objectives
 * OPTIMIZATION: InstancedMesh for Walls (Draw Calls: ~1)
 */

// 27. (Procedural Texture Generator Removed - Using WebP Assets)

// Extracted EXIT Component to handle Scan State
const ExitTile = React.memo(({ x, z, gameState, advanceFloor, addNotification, WallHeight, CellSize }) => {
    const [scanTimer, setScanTimer] = useState(0);
    const { fastStateRef, updateScannedTargets, setGameState } = useGame();
    const meshRef = useRef();

    // SCAN & ANIMATION LOGIC
    useFrame((state, delta) => {
        // 1. ANIMATION (Rotate & Pulse)
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            meshRef.current.scale.setScalar(pulse);
        }

        // 2. SCAN VISIBILITY (Ref-based)
        const playerPos = fastStateRef.current.playerWorldPos;
        if (gameState.lastScanTime && playerPos) {
            const dx = playerPos.x - x;
            const dz = playerPos.z - z;
            const distSq = dx * dx + dz * dz;

            const scanAge = (Date.now() - gameState.lastScanTime) / 1000;
            if (scanAge < 2.5) {
                const waveRadius = scanAge * 25;
                const dist = Math.sqrt(distSq);
                if (dist < waveRadius && dist > waveRadius - 5) {
                    if (scanTimer <= 0) {
                        setScanTimer(10.0);
                        // Add portal to mini-map as permanent marker
                        // SAFE UPDATE: Append to existing array using function callback if available, 
                        // but updateScannedTargets currently replaces. We must fetch current first?
                        // No, updateScannedTargets in GameContext uses setGameState.
                        // We need to bypass the 'replace' logic of updateScannedTargets if we can't change it.
                        // Actually, looking at GameContext, updateScannedTargets is: setGameState(prev => ({ ...prev, scannedTargets: targets }))
                        // We can't access 'prev' here easily without changing the API. 
                        // BUT, we can use the main setGameState exposed!

                        // Using direct setGameState to APPEND
                        addNotification("PORTAL_LOCATED");
                        setGameState(prev => {
                            const exists = prev.scannedTargets.some(t => t.type === 'PORTAL' && t.x === x && t.z === z);
                            if (exists) return prev;
                            return {
                                ...prev,
                                scannedTargets: [...prev.scannedTargets, { x, z, type: 'PORTAL' }]
                            };
                        });
                    }
                }
            }
        }
        if (scanTimer > 0) setScanTimer(prev => prev - delta);
    });

    return (
        <group>
            {gameState.isPortalLocked && (
                <RigidBody position={[x, WallHeight / 2, z]} type="fixed">
                    <CuboidCollider args={[0.4, WallHeight / 2, 1.0]} />
                    <mesh>
                        <boxGeometry args={[1.8, WallHeight, 0.2]} />
                        <meshBasicMaterial color="#FF0000" wireframe transparent opacity={0.3} />
                    </mesh>
                </RigidBody>
            )}

            <RigidBody
                type="fixed"
                sensor
                onIntersectionEnter={() => {
                    if (gameState.isPortalLocked) {
                        addNotification("PORTAL_LOCKED: REQUIRES_KERNEL_KEY");
                    } else {
                        addNotification("PORTAL_BREACH: ADVANCING...");
                        advanceFloor();
                    }
                }}
                position={[x, 0, z]}
            >
                <group>
                    <pointLight
                        color={gameState.isPortalLocked ? "#FF0000" : "#EA00FF"}
                        intensity={2}
                        distance={5}
                        position={[0, 2, 0]}
                    />
                    <mesh ref={meshRef} position={[0, WallHeight / 2, 0]}>
                        <torusGeometry args={[1, 0.2, 16, 32]} />
                        <meshStandardMaterial
                            color={gameState.isPortalLocked ? "#FF0000" : "#EA00FF"}
                            emissive={gameState.isPortalLocked ? "#FF0000" : "#EA00FF"}
                            emissiveIntensity={2}
                        />
                    </mesh>

                    {/* SCAN WIREFRAME DISABLED - User Request
                    {scanTimer > 0 && (
                        <mesh position={[0, 10, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 20]} />
                            <meshBasicMaterial color="#EA00FF" transparent opacity={0.5} depthTest={false} />
                        </mesh>
                    )}
                    */}

                    {gameState.isPortalLocked && (
                        <mesh position={[0, WallHeight / 2, 0]}>
                            <boxGeometry args={[2.2, WallHeight, 2.2]} />
                            <meshBasicMaterial color="#FF0000" wireframe transparent opacity={0.5} />
                        </mesh>
                    )}
                </group>
            </RigidBody>
        </group>
    );
});

export default function MazeRenderer() {
    const { gameState, advanceFloor, setGameState, addNotification } = useGame();
    const CELL_SIZE = 2;
    const WALL_HEIGHT = 4;
    const [maze, setMaze] = useState(null);

    useEffect(() => {
        // GHOST MODE LEVEL 10 OVERRIDE
        if (gameState.gameMode === 'ghost' && gameState.floorLevel % 10 === 0) {
            const width = 12; // Matches previous fix attempt
            const height = 60;

            // Construct 2D Grid (Array of Int8Arrays) to match Worker output format
            const grid = [];
            for (let y = 0; y < height; y++) {
                const row = new Int8Array(width).fill(0); // Fill Walls (0 = Wall in InstancedWalls)
                grid.push(row);
            }

            // Carve Passage (Width 3)
            for (let y = 1; y < height - 1; y++) {
                grid[y][5] = 1; // 1 = Floor (Empty Space)
                grid[y][6] = 1;
                grid[y][7] = 1;
            }

            setMaze({
                width,
                height,
                grid,
                metadata: {
                    start: { x: 6, y: 2 },
                    exit: { x: 6, y: 58 } // Unlocked
                }
                // No Boss Data
            });
            return;
        }

        // STANDARD GENERATION
        setMaze(null);
        const worker = new Worker(new URL('../../workers/maze.worker.js?v=13', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
            if (e.data.success) setMaze(e.data.data);
            worker.terminate();
        };
        worker.postMessage({
            seed: gameState.seed,
            floorLevel: gameState.floorLevel,
            gameMode: gameState.gameMode
        });
        return () => worker.terminate();
    }, [gameState.seed, gameState.floorLevel, gameState.gameMode]);


    const [materials, setMaterials] = useState(null);

    useEffect(() => {
        if (!maze) return;
        const isSector2 = gameState.floorLevel >= 11 && gameState.floorLevel <= 25;
        const loader = new THREE.TextureLoader();
        let wallTex = null;
        let floorTex = null;

        if (isSector2) {
            wallTex = loader.load(wallCityASrc);
            floorTex = loader.load(floorCSrc);
            wallTex.colorSpace = floorTex.colorSpace = THREE.SRGBColorSpace;
            wallTex.wrapS = wallTex.wrapT = floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
            floorTex.repeat.set(320, 320);
            floorTex.offset.set(0.75, 0.75);
        } else if (gameState.floorLevel === 999) {
            wallTex = loader.load(floorASrc);
            floorTex = loader.load(floorASrc);
            wallTex.colorSpace = floorTex.colorSpace = THREE.SRGBColorSpace;
            wallTex.wrapS = wallTex.wrapT = floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
            floorTex.repeat.set(4, 4);
        } else {
            wallTex = loader.load(wallGlitchAASrc);
            floorTex = loader.load(floorASrc);
            wallTex.colorSpace = floorTex.colorSpace = THREE.SRGBColorSpace;
            wallTex.wrapS = wallTex.wrapT = floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
            if (gameState.floorLevel === 10) {
                floorTex.repeat.set(maze.width, maze.height);
            } else {
                floorTex.repeat.set(500, 500);
                floorTex.offset.set(0.5, 0.5);
            }
        }

        const wallMat = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            emissive: isSector2 ? '#442200' : '#008888', // Darkened copper for city neon depth
            emissiveIntensity: isSector2 ? 1.2 : 0.4,
            roughness: 0.2,
            metalness: 0.8,
            map: wallTex,
            emissiveMap: wallTex // RESTORED
        });

        const floorMat = new THREE.MeshStandardMaterial({
            color: isSector2 ? '#AAAAFF' : '#FFFFFF',
            roughness: isSector2 ? 0.05 : 0.4,
            metalness: isSector2 ? 0.6 : 0.1,
            map: floorTex,
            emissive: isSector2 ? '#111122' : '#222222', // Darker base to allow neon to pop
            emissiveMap: floorTex, // RESTORED
            emissiveIntensity: isSector2 ? 0.3 : 0.15
        });

        setMaterials({ wall: wallMat, floor: floorMat, wallTexture: wallTex, sector: gameState.floorLevel });

        return () => {
            wallMat.dispose();
            floorMat.dispose();
        };
    }, [gameState.floorLevel, maze]);

    if (!maze || !materials) return null;

    return (
        <MazeScene
            maze={maze}
            materials={materials}
            gameState={gameState}
            advanceFloor={advanceFloor}
            addNotification={addNotification}
            setGameState={setGameState}
            CELL_SIZE={CELL_SIZE}
            WALL_HEIGHT={WALL_HEIGHT}
        />
    );
}

const MazeScene = React.memo(({ maze, materials, gameState, advanceFloor, addNotification, setGameState, CELL_SIZE, WALL_HEIGHT }) => {
    const { wall: wallMaterial, floor: floorMaterial, wallTexture, sector } = materials;

    useEffect(() => {
        if (maze.metadata?.start) {
            const startNode = maze.metadata.start;
            setGameState(prev => ({
                ...prev,
                spawnPoint: { x: startNode.x * CELL_SIZE, y: 1.5, z: startNode.y * CELL_SIZE },
                playerGridPos: { x: startNode.x, y: startNode.y },
                mazeGrid: maze.grid,
                mazeWidth: maze.width,
                mazeHeight: maze.height
            }));
        }
    }, [maze, setGameState, CELL_SIZE]);

    return (
        <group>
            <InstancedWalls
                key={`walls-${gameState.floorLevel}`}
                maze={maze}
                wallMaterial={wallMaterial}
                cellSize={CELL_SIZE}
                wallHeight={WALL_HEIGHT}
                floorLevel={gameState.floorLevel}
                texture={wallTexture}
                sector={sector}
            />

            {maze.metadata?.start && (
                <group position={[maze.metadata.start.x * CELL_SIZE, 0.1, maze.metadata.start.y * CELL_SIZE]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.8, 32]} />
                        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1} />
                    </mesh>
                </group>
            )}

            {maze.metadata?.exit && (
                <ExitTile
                    key={`exit-${maze.metadata.exit.x}-${maze.metadata.exit.y}`}
                    x={maze.metadata.exit.x * CELL_SIZE}
                    z={maze.metadata.exit.y * CELL_SIZE}
                    gameState={gameState}
                    advanceFloor={advanceFloor}
                    addNotification={addNotification}
                    WallHeight={WALL_HEIGHT}
                    CellSize={CELL_SIZE}
                />
            )}

            <RigidBody key={`floor-stabilized-${gameState.floorLevel}`} type="fixed" position={[0, -1.0, 0]}>
                <CuboidCollider args={[500, 1.0, 500]} />
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.0, 0]}>
                    <planeGeometry args={[1000, 1000]} />
                    <primitive object={floorMaterial} attach="material" />
                </mesh>
            </RigidBody>

            <MobManager maze={maze} floorLevel={gameState.floorLevel} />
            <HazardManager maze={maze} floorLevel={gameState.floorLevel} />
            <LootManager maze={maze} floorLevel={gameState.floorLevel} />
        </group>
    );
});
