import React, { useMemo } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';

/**
 * IDENTITY: ARCH_SYS_01_SUB
 * DIRECTIVE: Instanced Floor Rendering (Tiles)
 */

export default function InstancedFloors({ maze, floorMaterial, cellSize }) {

    // Compute Instance Data for Floor Tiles (Walkable cells: 1, 2, 3)
    const instances = useMemo(() => {
        const data = [];
        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                // Render floor for Path(1), Start(2), Exit(3)
                // We do NOT render floor for Wall(0) if walls sit ON TOP of a base floor,
                // BUT usually walls replace the floor.
                // Let's render floor everywhere for completeness or just paths?
                // The MazeGenerator returns 0 for wall, 1 for path.
                // If we want a solid floor everywhere:
                // data.push(...)

                // OPTIMIZATION: Only render floor where there are no walls ?? 
                // Or just render a grid.
                // Converting to tiles allows us to make "Floor 0" (Void) where there is no tile.

                if (cell !== 0) { // Render floor on non-wall tiles
                    data.push({
                        key: `floor-${x}-${z}`,
                        position: [x * cellSize, -cellSize / 2, z * cellSize], // Centered at 0 height relative to bottom?
                        // If walls are at y = WallHeight/2 (2), Floor should be at...
                        // MazeRenderer had floor at -2.5 (Box of height 5). Top was at 0.
                        // Let's place these tiles such that top is at 0.
                        // Box height = 0.5?
                        rotation: [0, 0, 0],
                        scale: [1, 1, 1]
                    });
                }
            });
        });
        return data;
    }, [maze, cellSize]);

    if (instances.length === 0) return null;

    return (
        <InstancedRigidBodies
            instances={instances}
            type="fixed"
            colliders="cuboid"
        >
            <instancedMesh args={[null, null, instances.length]} count={instances.length} receiveShadow>
                <boxGeometry args={[cellSize, 0.5, cellSize]} />
                {/* 0.5 thickness, top at 0 if position y is -0.25 */}
                <primitive object={floorMaterial} attach="material" />
            </instancedMesh>
        </InstancedRigidBodies>
    );
}
