/**
 * IDENTITY: ARCH_SYS_01 (The Architect - Worker Thread)
 * DIRECTIVE: Offload Maze Generation to Background Thread
 */

// --- SHARED CONSTANTS ---
const TILE = {
    WALL: 0,
    PATH: 1,
    START: 2,
    EXIT: 3,
    CACHE: 9
};

// --- RNG CLASS ---
class RNG {
    constructor(seedString) {
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash |= 0;
        }
        this.state = Math.abs(hash);
    }
    next() {
        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        return this.state / 4294967296;
    }
}

// --- GENERATION LOGIC ---
function generateMazeLogic(seed, floorLevel) {
    // 0. BESTIARY TEST ROOM (Floor 999) - EARLY EXIT
    if (floorLevel === 999) {
        const ROOM_SIZE = 15;
        const bestiaryGrid = Array(ROOM_SIZE).fill().map(() => Array(ROOM_SIZE).fill(TILE.WALL)); // TILE.WALL = 0

        // Carve Main Floor (Open Room)
        for (let y = 1; y < ROOM_SIZE - 1; y++) {
            for (let x = 1; x < ROOM_SIZE - 1; x++) {
                bestiaryGrid[y][x] = TILE.PATH; // TILE.PATH = 1
            }
        }

        return {
            grid: bestiaryGrid,
            width: ROOM_SIZE,
            height: ROOM_SIZE,
            metadata: {
                seed: "BESTIARY_DEBUG",
                sector: 1,
                start: { x: 7, y: 12 },
                exit: { x: 7, y: 2 }
            }
        };
    }

    const size = floorLevel + 9;
    const floorSeed = `${seed}_F${floorLevel}`;
    const rng = new RNG(floorSeed);

    let gridDim = size % 2 === 0 ? size + 1 : size;
    let grid = Array(gridDim).fill().map(() => Array(gridDim).fill(TILE.WALL));

    const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];

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

            if (nx > 0 && nx < gridDim - 1 && ny > 0 && ny < gridDim - 1 && grid[ny][nx] === TILE.WALL) {
                grid[y + dy / 2][x + dx / 2] = TILE.PATH;
                carve(nx, ny);
            }
        }
    };

    carve(1, 1);
    grid[1][1] = TILE.START;

    // BFS for Exit
    const bfs = (startX, startY) => {
        const queue = [[startX, startY, 0]];
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

            const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
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

    const exitPos = bfs(1, 1);
    grid[exitPos.y][exitPos.x] = TILE.EXIT;

    // Rotation
    const rotations = Math.floor(rng.next() * 4);

    // Helper to rotate point metadata
    const rotatePoint = (x, y, times) => {
        let rx = x;
        let ry = y;
        for (let i = 0; i < times; i++) {
            const oldX = rx;
            rx = gridDim - 1 - ry;
            ry = oldX;
        }
        return { x: rx, y: ry };
    };

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

    const finalStart = rotatePoint(1, 1, rotations);
    const finalExit = rotatePoint(exitPos.x, exitPos.y, rotations);

    // Boss Room (Floor 10) - ARENA (SAFE MODE)
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
        // Center: 15,15. Side Pillars at X=8 and X=22. Y=7, 15, 23.
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

        // Safe Start/Exit (Center Y)
        finalStart.x = 2;
        finalStart.y = 15;

        finalExit.x = 28;
        finalExit.y = 15;

        gridDim = ARENA_SIZE;
    }

    // Cache Placement
    let cacheCount = 1 + Math.floor(rng.next() * 2);
    let placedCaches = 0;
    const candidates = [];

    // GridDim is now potentially wrong if we expanded. Use actual grid.
    const h = finalGrid.length;
    const w = finalGrid[0].length;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            if (finalGrid[y][x] === TILE.PATH) {
                let walls = 0;
                if (finalGrid[y][x - 1] === TILE.WALL) walls++;
                if (finalGrid[y][x + 1] === TILE.WALL) walls++;
                if (finalGrid[y - 1][x] === TILE.WALL) walls++;
                if (finalGrid[y + 1][x] === TILE.WALL) walls++;

                if ((x === finalStart.x && y === finalStart.y) || (x === finalExit.x && y === finalExit.y)) continue;

                if (walls >= 3) candidates.push({ x, y, type: 'dead_end' });
                else candidates.push({ x, y, type: 'path' });
            }
        }
    }

    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    for (const spot of candidates) {
        if (placedCaches >= cacheCount) break;
        finalGrid[spot.y][spot.x] = TILE.CACHE;
        placedCaches++;
    }

    return {
        grid: finalGrid,
        width: finalGrid[0].length,
        height: finalGrid.length,
        metadata: {
            seed: floorSeed,
            sector: Math.ceil(floorLevel / 25),
            start: finalStart,
            exit: finalExit
        }
    };
}

// --- WORKER MESSAGE HANDLER ---
self.onmessage = (e) => {
    const { seed, floorLevel } = e.data;
    // Request received
    try {
        const result = generateMazeLogic(seed, floorLevel);
        self.postMessage({ success: true, data: result });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
