/**
 * IDENTITY: ARCH_SYS_01 (The Architect)
 * DIRECTIVE: Construct the Infinite Labyrinth
 * CONSTRAINTS:
 * - Scaling Law: Size = (Floor + 9) x (Floor + 9)
 * - Algorithm: Recursive Backtracking
 * - Output: 0=Wall, 1=Path, 2=Start, 3=Exit, 9=L1_Cache
 */

// Simple pseudo-random number generator for deterministic seeds
// Based on Mulberry32 or similar linear congruential generator logic
class RNG {
    constructor(seedString) {
        // Convert string to numeric hash
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        this.state = Math.abs(hash);
    }

    // Returns float between 0 and 1
    next() {
        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        return this.state / 4294967296;
    }
}

const TILE = {
    WALL: 0,
    PATH: 1,
    START: 2,
    EXIT: 3,
    CACHE: 9
};

export function generateMaze(seed, floorLevel) {
    // 0. BESTIARY TEST ROOM (Floor 999) - EARLY EXIT
    if (floorLevel === 999) {
        const ROOM_SIZE = 15;
        const bestiaryGrid = Array(ROOM_SIZE).fill().map(() => Array(ROOM_SIZE).fill(TILE.WALL));

        // Carve Main Floor (Open Room)
        for (let y = 1; y < ROOM_SIZE - 1; y++) {
            for (let x = 1; x < ROOM_SIZE - 1; x++) {
                bestiaryGrid[y][x] = TILE.PATH;
            }
        }

        return {
            grid: bestiaryGrid,
            width: ROOM_SIZE,
            height: ROOM_SIZE,
            metadata: {
                seed: "BESTIARY_DEBUG",
                sector: 1,
                start: { x: 7, y: 12 }, // Spawn at bottom center
                exit: { x: 7, y: 2 }   // Exit at top center
            }
        };
    }

    // 1. Calculate Grid Size
    // INFINITE GROWTH PROTOCOL RESTORED
    // Formula: (Floor + 9) - UNBOUNDED as per user request
    const size = floorLevel + 9;

    // Unique seed for this specific floor instance
    // Combines Daily Seed + Floor Level
    const floorSeed = `${seed}_F${floorLevel}`;
    const rng = new RNG(floorSeed);

    // 2. Initialize Grid (All Walls)
    // Ensure odd dimensions for proper maze generation walls
    // If size is even, add 1 to make it odd (standard for recursive backtracking)
    const gridDim = size % 2 === 0 ? size + 1 : size;
    let grid = Array(gridDim).fill().map(() => Array(gridDim).fill(TILE.WALL));

    // 3. Recursive Backtracking Algorithm
    const directions = [
        [0, -2], // Up
        [0, 2],  // Down
        [-2, 0], // Left
        [2, 0]   // Right
    ];

    // Shuffle array utility ensuring deterministic shuffle via our RNG
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(rng.next() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const carve = (x, y) => {
        grid[y][x] = TILE.PATH;

        const shuffledDirs = shuffle([...directions]);

        for (const [dx, dy] of shuffledDirs) {
            const nx = x + dx;
            const ny = y + dy;

            // Check bounds (leaving 1 tile border)
            if (nx > 0 && nx < gridDim - 1 && ny > 0 && ny < gridDim - 1 && grid[ny][nx] === TILE.WALL) {
                // Carve through the wall between
                grid[y + dy / 2][x + dx / 2] = TILE.PATH;
                carve(nx, ny);
            }
        }
    };

    // Start carving from (1,1)
    carve(1, 1);
    grid[1][1] = TILE.START;

    // 5. BFS to find Furthest Point (EXIT)
    const bfs = (startX, startY) => {
        const queue = [[startX, startY, 0]]; // [x, y, dist]
        const visited = new Set();
        visited.add(`${startX},${startY}`);

        let maxDist = -1;
        let furthestPoint = { x: startX, y: startY };

        while (queue.length > 0) {
            const [cx, cy, dist] = queue.shift();

            if (dist > maxDist) {
                maxDist = dist;
                furthestPoint = { x: cx, y: cy };
            }

            for (const [dx, dy] of directions) {
                // Check neighbors (Cell Size 2 in grid logic?) 
                // Wait, grid is dense: Path is 1, Wall is 0.
                // We just check standard 1-step neighbors in the array
                // But carve used 2-step. The intermediate cells are also PATH.
                // So we check standard neighbors [0,1], [0,-1], [1,0], [-1,0]
            }
            // Standard neighbors for BFS
            const neighbors = [
                [0, 1], [0, -1], [1, 0], [-1, 0]
            ];

            for (const [dx, dy] of neighbors) {
                const nx = cx + dx;
                const ny = cy + dy;

                if (nx >= 0 && nx < gridDim && ny >= 0 && ny < gridDim) {
                    if (grid[ny][nx] !== TILE.WALL && !visited.has(`${nx},${ny}`)) {
                        visited.add(`${nx},${ny}`);
                        queue.push([nx, ny, dist + 1]);
                    }
                }
            }
        }
        return furthestPoint;
    };

    // Run BFS
    const exitPos = bfs(1, 1);
    grid[exitPos.y][exitPos.x] = TILE.EXIT;

    // 6. Random Rotation (0, 90, 180, 270)
    // 0 = 0, 1 = 90, 2 = 180, 3 = 270
    const rotations = Math.floor(rng.next() * 4);

    // Helper to rotate point
    const rotatePoint = (x, y, times) => {
        let rx = x;
        let ry = y;
        for (let i = 0; i < times; i++) {
            // 90 deg clockwise: (x, y) -> (dim-1-y, x)
            const oldX = rx;
            rx = gridDim - 1 - ry;
            ry = oldX;
        }
        return { x: rx, y: ry };
    };

    // Rotate Grid
    let finalGrid = grid;
    for (let i = 0; i < rotations; i++) {
        const newGrid = Array(gridDim).fill().map(() => Array(gridDim).fill(0));
        for (let y = 0; y < gridDim; y++) {
            for (let x = 0; x < gridDim; x++) {
                newGrid[x][gridDim - 1 - y] = finalGrid[y][x];
            }
        }
        finalGrid = newGrid;
    }

    // Update Metadata Points
    const finalStart = rotatePoint(1, 1, rotations);
    const finalExit = rotatePoint(exitPos.x, exitPos.y, rotations);

    // 6.5 BOSS ROOM PROTOCOL (Floor 10)
    // Clear an 8x8 arena around the exit for the Sentinel
    // 6.5 BOSS ROOM PROTOCOL (Floor 10) - ARENA (SAFE MODE)
    // NOTE: This MUST match workers/maze.worker.js logic for consistency!
    if (floorLevel === 10) {
        // FORCE REGENERATE AS ARENA (Standard 31x31)
        const ARENA_SIZE = 31;
        const newGrid = Array(ARENA_SIZE).fill().map(() => Array(ARENA_SIZE).fill(TILE.WALL));

        // Carve Main Floor
        for (let y = 1; y < ARENA_SIZE - 1; y++) {
            for (let x = 1; x < ARENA_SIZE - 1; x++) {
                newGrid[y][x] = TILE.PATH;
            }
        }

        // Add 6 Pillars (Standard Layout)
        const pillars = [
            // Left Side
            { x: 8, y: 7 }, { x: 8, y: 15 }, { x: 8, y: 23 },

            // Right Side
            { x: 22, y: 7 }, { x: 22, y: 15 }, { x: 22, y: 23 }
        ];

        pillars.forEach(p => {
            newGrid[p.y][p.x] = TILE.WALL;
        });

        finalGrid = newGrid;

        // Safe Start/Exit
        finalStart.x = 2;
        finalStart.y = 15;

        finalExit.x = 28;
        finalExit.y = 15;

        // Override Grid Dimensions for Return
        // Note: The loop below for Caches uses 'gridDim' which is stale here.
        // We should break and update gridDim if we want caches (but Boss Room usually has no caches?)
        // Let's just return here to avoid complexity, or update cache loop.

        return {
            grid: finalGrid,
            width: ARENA_SIZE,
            height: ARENA_SIZE,
            metadata: {
                seed: floorSeed,
                sector: Math.ceil(floorLevel / 25),
                start: finalStart,
                exit: finalExit
            }
        };
    }



    // 7. L1_CACHE Logic (Place 1-2 Caches per floor)
    let cacheCount = 1 + Math.floor(rng.next() * 2); // 1 to 2 (Rare but guaranteed)
    let placedCaches = 0;

    // Attempt to place in dead ends first (but not Start/Exit)
    // We already rotated the grid, so we need to scan the *finalGrid*
    const candidates = [];
    for (let y = 1; y < gridDim - 1; y++) {
        for (let x = 1; x < gridDim - 1; x++) {
            if (finalGrid[y][x] === TILE.PATH) {
                // Check neighbors for dead end
                let walls = 0;
                if (finalGrid[y][x - 1] === TILE.WALL) walls++;
                if (finalGrid[y][x + 1] === TILE.WALL) walls++;
                if (finalGrid[y - 1][x] === TILE.WALL) walls++;
                if (finalGrid[y + 1][x] === TILE.WALL) walls++;

                // Avoid Start/Exit
                if ((x === finalStart.x && y === finalStart.y) || (x === finalExit.x && y === finalExit.y)) continue;

                if (walls >= 3) {
                    candidates.push({ x, y, type: 'dead_end' });
                } else {
                    candidates.push({ x, y, type: 'path' });
                }
            }
        }
    }

    // Shuffle candidates
    // Simple shuffle since we have RNG
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Place Caches
    for (const spot of candidates) {
        if (placedCaches >= cacheCount) break;
        finalGrid[spot.y][spot.x] = TILE.CACHE;
        placedCaches++;
    }

    return {
        grid: finalGrid,
        width: gridDim,
        height: gridDim,
        metadata: {
            seed: floorSeed,
            sector: Math.ceil(floorLevel / 25),
            start: finalStart,
            exit: finalExit
        }
    };
}
