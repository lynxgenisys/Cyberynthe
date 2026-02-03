import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import DilemmaOrb from './DilemmaOrb';
import { useGame } from '../../context/GameContext';
import { useFrame } from '@react-three/fiber';

// Simple Depth-First Search Maze Generator
const generateMaze = (width, height) => {
    // Ensure odd dimensions for grid-based maze
    const w = width % 2 === 0 ? width + 1 : width;
    const h = height % 2 === 0 ? height + 1 : height;

    const maze = Array(h).fill().map(() => Array(w).fill(1)); // 1 = Wall, 0 = Path
    const stack = [];
    const start = { x: 1, y: 1 };

    maze[start.y][start.x] = 0;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        // Directions: Up, Right, Down, Left (jump 2)
        const dirs = [
            { x: 0, y: -2 },
            { x: 2, y: 0 },
            { x: 0, y: 2 },
            { x: -2, y: 0 }
        ];

        for (const dir of dirs) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;

            if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny, dx: dir.x / 2, dy: dir.y / 2 });
            }
        }

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[next.y][next.x] = 0;
            maze[current.y + next.dy][current.x + next.dx] = 0; // Knock down wall
            stack.push({ x: next.x, y: next.y });
        } else {
            stack.pop();
        }
    }

    // FORCE SAFE SPAWN AT CENTER
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    // Ensure odd center for path alignment, adjust if needed
    const safeCx = cx % 2 === 0 ? cx + 1 : cx;
    const safeCy = cy % 2 === 0 ? cy + 1 : cy;

    // Clear a 3x3 area at center for spawn
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
            if (maze[safeCy + y] && maze[safeCy + y][safeCx + x] !== undefined) {
                maze[safeCy + y][safeCx + x] = 0;
            }
        }
    }

    return { maze, center: [safeCx, safeCy] };
};

const NeonCity = ({ level = 1 }) => {
    // Level 1 = 10x10 CELLS. 
    // Grid width = Cells * 2 + 1
    // Formula: (10 + (level - 1)) * 2 + 1
    const dimensionCells = 10 + (level - 1);
    const dimensionGrid = dimensionCells * 2 + 1;
    const CELL_SIZE = 4;
    const WALL_HEIGHT = 12;

    const { gameState, addNotification } = useGame();

    // GHOST PROTOCOL: Narrative Hooks handled in GameContext now.

    const { maze: mazeData, center: centerIndices } = useMemo(() => {
        // SPECIAL: FLOOR 10 ARENA
        if (level === 10) {
            const w = 31; // 30x30 effectively (odd number)
            const h = 31;
            const maze = Array(h).fill().map(() => Array(w).fill(0)); // All Empty first

            // Build Walls borders
            for (let z = 0; z < h; z++) {
                for (let x = 0; x < w; x++) {
                    if (x === 0 || x === w - 1 || z === 0 || z === h - 1) maze[z][x] = 1;
                    // Add some pillars for cover
                    if (x % 6 === 0 && z % 6 === 0 && x > 0 && x < w - 1 && z > 0 && z < h - 1) maze[z][x] = 1;
                }
            }

            // Exit at far corner relative to center
            const exit = { x: 25, y: 25 };

            return { maze, center: [15, 15] }; // Center of 31 is 15
        }

        return generateMaze(dimensionGrid, dimensionGrid);
    }, [level, dimensionGrid]);
    const [cx, cz] = centerIndices;

    // We need to shift everything so the Player (at 0,0,0) is at the Maze Center
    // Maze Center World Pos = cx * CELL_SIZE, cz * CELL_SIZE
    // Offset = -Maze Center
    const offsetX = -(cx * CELL_SIZE);
    const offsetZ = -(cz * CELL_SIZE);

    // --- GHOST PROTOCOL: INSTANCED RENDERING ---
    const wallMeshRef = useRef();
    const floorMeshRef = useRef();

    // 1. Calculate Transforms ONCE per level
    const { wallCount, floorCount, goalPos, wallMatrices, floorMatrices } = useMemo(() => {
        const wallTransforms = [];
        const floorTransforms = [];
        let possibleGoals = [];
        const dummy = new THREE.Object3D();

        mazeData.forEach((row, z) => {
            row.forEach((cell, x) => {
                const posX = x * CELL_SIZE + offsetX;
                const posZ = z * CELL_SIZE + offsetZ;

                if (cell === 1) {
                    // Wall Transform
                    dummy.position.set(posX, WALL_HEIGHT / 2, posZ);
                    dummy.scale.set(1, 1, 1);
                    dummy.rotation.set(0, 0, 0);
                    dummy.updateMatrix();
                    wallTransforms.push(dummy.matrix.clone());
                } else {
                    // Floor Transform
                    dummy.position.set(posX, 0, posZ);
                    dummy.scale.set(1, 1, 1);
                    dummy.rotation.set(-Math.PI / 2, 0, 0); // Rotate flat
                    dummy.updateMatrix();
                    floorTransforms.push(dummy.matrix.clone());

                    // Candidate for goal if it's far from center
                    if (Math.abs(posX) > 20 || Math.abs(posZ) > 20) {
                        possibleGoals.push([posX, 2, posZ]);
                    }
                }
            });
        });

        // Fallback if small maze
        let goal = possibleGoals.length > 0
            ? possibleGoals[Math.floor(Math.random() * possibleGoals.length)]
            : [10, 2, 10]; // Fallback

        return {
            wallCount: wallTransforms.length,
            floorCount: floorTransforms.length,
            goalPos: goal,
            wallMatrices: wallTransforms,
            floorMatrices: floorTransforms
        };
    }, [mazeData, offsetX, offsetZ]);

    // 2. Apply Matrices to Instances
    useEffect(() => {
        if (wallMeshRef.current) {
            wallMatrices.forEach((matrix, i) => wallMeshRef.current.setMatrixAt(i, matrix));
            wallMeshRef.current.instanceMatrix.needsUpdate = true;
        }
        if (floorMeshRef.current) {
            floorMatrices.forEach((matrix, i) => floorMeshRef.current.setMatrixAt(i, matrix));
            floorMeshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [wallMatrices, floorMatrices]);


    // --- GHOST PROTOCOL: LOCAL PHYSICS CULLING ---
    // Only generate rigid bodies for walls within a 3x3 chunk radius
    const [localColliders, setLocalColliders] = useState([]);
    const lastPlayerGridPos = useRef({ x: -999, y: -999 });

    useFrame(() => {
        // Player Grid Pos is updated in GameState, but we can approximate here efficiently or use GameState
        // Let's use the GameState one since it's already tracking it
        if (!gameState.playerGridPos) return;

        const px = gameState.playerGridPos.x;
        const py = gameState.playerGridPos.y;

        // Check if player moved to a new cell (throttled check)
        if (Math.abs(px - lastPlayerGridPos.current.x) > 0 || Math.abs(py - lastPlayerGridPos.current.y) > 0) {
            lastPlayerGridPos.current = { x: px, y: py };

            // Find all walls within radius
            // Map coordinates are 1:1 with maze grid indices IF we offset correctly
            // But wait, playerGridPos FROM GameContext might be different coordinate space?
            // Re-calculating:
            // Player World Pos X approx = px * 2? No, GameState tracks grid indices (x, y)
            // So we can look up mazeData[py][px] directly.

            // Current Maze Indices (approximate from world space if needed, but Context *should* have grid indices)
            // Let's rely on GameState.playerGridPos being correct (updated in Player.jsx)
            // Note: Player.jsx updates it based on worldPos / 2.
            // Our Maze uses CELL_SIZE = 4. 
            // So Grid Index = (WorldPos - Offset) / 4. 
            // GameState might be using scale 2 logic from MobManager? 
            // Let's recalculate strictly based on World Position here to be safe and independent.
        }
    });

    // Actually, let's do the calculation inside useFrame properly with world refs? 
    // No, better to use the GameState's grid pos if we trust it, OR simpler:
    // Just calc purely on local state to avoid Context dependency loop if possible.
    // Let's use the Context Pos.

    useEffect(() => {
        if (!gameState.playerGridPos) return;

        // Re-align coordinate systems
        // GameState playerGridPos is usually based on "Unit 2" scale from MobManager.
        // This maze is "Unit 4" (CELL_SIZE).
        // So Player Grid X (Context) * 2 = World X. World X / 4 = Maze Grid X.
        // => MazeGridX = ContextGridX * 0.5.

        // Let's calculate purely:
        // We know the maze center is at World (0,0).
        // Center Grid Index is (cx, cz).
        // So Grid Index X = cx + (PlayerWorldX / 4).
        // PlayerWorldX = (ContextGridX) * 2. 
        // So Grid Index X = cx + (ContextGridX * 2 / 4) = cx + ContextGridX/2.

        const contextX = gameState.playerGridPos.x;
        const contextY = gameState.playerGridPos.y; // Actually Y in context is Z in 3D usually

        const mazeGridX = Math.floor(cx + (contextX * 2 / 4));
        const mazeGridZ = Math.floor(cz + (contextY * 2 / 4));

        const RADIUS = 4; // Check 4 cells in each direction (9x9 block roughly)
        const newColliders = [];

        for (let z = mazeGridZ - RADIUS; z <= mazeGridZ + RADIUS; z++) {
            for (let x = mazeGridX - RADIUS; x <= mazeGridX + RADIUS; x++) {
                if (z >= 0 && z < mazeData.length && x >= 0 && x < mazeData[0].length) {
                    if (mazeData[z][x] === 1) { // Wall
                        const worldX = (x - cx) * CELL_SIZE; // Revert offset logic: x * size + offset. 
                        // Offset = -cx * size. So x*size - cx*size = (x-cx)*size.
                        const worldZ = (z - cz) * CELL_SIZE;

                        newColliders.push(
                            <RigidBody key={`c-${x}-${z}`} type="fixed" colliders={false} position={[worldX, WALL_HEIGHT / 2, worldZ]}>
                                <CuboidCollider args={[CELL_SIZE / 2, WALL_HEIGHT / 2, CELL_SIZE / 2]} />
                            </RigidBody>
                        );
                    }
                }
            }
        }
        setLocalColliders(newColliders);

    }, [gameState.playerGridPos, cx, cz, mazeData]);


    // Simplified rendering for production

    return (
        <group>
            {/* THICK BASE FLOOR - Prevents falling through */}
            <RigidBody type="fixed" colliders={false} position={[0, -5.1, 0]} friction={2}>
                <CuboidCollider args={[dimensionGrid * CELL_SIZE / 2, 5, dimensionGrid * CELL_SIZE / 2]} />
                <mesh receiveShadow>
                    <boxGeometry args={[dimensionGrid * CELL_SIZE, 10, dimensionGrid * CELL_SIZE]} />
                    <meshStandardMaterial color="#020205" roughness={0.1} metalness={0.5} />
                </mesh>
            </RigidBody>

            {/* PERIMETER WALLS - Keeps player in bounds - GLOBAL */}
            <RigidBody type="fixed" colliders={false} position={[dimensionGrid * CELL_SIZE / 2, WALL_HEIGHT / 2, 0]}>
                <CuboidCollider args={[0.5, WALL_HEIGHT, dimensionGrid * CELL_SIZE / 2]} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[-dimensionGrid * CELL_SIZE / 2, WALL_HEIGHT / 2, 0]}>
                <CuboidCollider args={[0.5, WALL_HEIGHT, dimensionGrid * CELL_SIZE / 2]} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[0, WALL_HEIGHT / 2, dimensionGrid * CELL_SIZE / 2]}>
                <CuboidCollider args={[dimensionGrid * CELL_SIZE / 2, WALL_HEIGHT, 0.5]} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} position={[0, WALL_HEIGHT / 2, -dimensionGrid * CELL_SIZE / 2]}>
                <CuboidCollider args={[dimensionGrid * CELL_SIZE / 2, WALL_HEIGHT, 0.5]} />
            </RigidBody>

            {/* INSTANCED RENDERER - VISUALS ONLY */}
            <instancedMesh ref={wallMeshRef} args={[null, null, wallCount]} color="#4040ff" castShadow={false} receiveShadow={false}>
                <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
                <meshStandardMaterial color="#4040ff" />
            </instancedMesh>

            <instancedMesh ref={floorMeshRef} args={[null, null, floorCount]} receiveShadow>
                <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
                <meshBasicMaterial color="lime" side={THREE.DoubleSide} />
            </instancedMesh>

            {/* LOCAL PHYSICS - INVISIBLE COLLIDERS */}
            {localColliders}

            {/* GRID HELPER */}
            <gridHelper position={[0, WALL_HEIGHT, 0]} args={[dimensionGrid * CELL_SIZE, dimensionCells, 0x333333, 0x111111]} />

            {/* Dynamic Dilemma Orb - Has its own RigidBody */}
            <DilemmaOrb
                position={goalPos}
                id={`level_${level}_node`}
                title={`! LEVEL ${level} ANOMALY !`}
            />
        </group>
    );
};

export default NeonCity;
