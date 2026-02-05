import React, { useMemo, useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { generateMaze } from '../../engine/MazeGenerator';

/**
 * IDENTITY: ARCH_SYS_01 (Debug View)
 * PURPOSE: Visualize the Grid Integrity and Seed Consistency.
 */
export default function DebugMazeView() {
    const { gameState } = useGame();
    const [mazeData, setMazeData] = useState(null);

    // Regenerate maze whenever Level or Seed changes
    useEffect(() => {
        if (gameState.seed) {
            const data = generateMaze(gameState.seed, gameState.floorLevel);
            setMazeData(data);
        }
    }, [gameState.seed, gameState.floorLevel]);

    if (!mazeData) return <div className="p-4 text-cyan-glow">INITIALIZING_GRID...</div>;

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-50 bg-black/80">
            <div className="flex flex-col items-center pointer-events-auto">
                <h2 className="text-xs text-cyan-dim mb-2">
                    ARCH_SYS_01_MAP // SIZE: {mazeData.width}x{mazeData.height} // POS: [{gameState.playerGridPos.x}, {gameState.playerGridPos.y}]
                </h2>

                {/* LEGEND */}
                <div className="flex gap-4 mb-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white rounded-full"></div> YOU</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500"></div> START</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500"></div> CACHE</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-magenta animate-pulse"></div> EXIT</span>
                </div>

                <div
                    className="relative grid gap-[1px] bg-gray-900 border border-cyan/30 p-1"
                    style={{
                        gridTemplateColumns: `repeat(${mazeData.width}, 1fr)`,
                        width: 'min(80vw, 600px)',
                        height: 'min(80vw, 600px)'
                    }}
                >
                    {/* PLAYER MARKER OVERLAY */}
                    <div
                        className="absolute w-full h-full pointer-events-none z-10 transition-all duration-300 ease-out"
                        style={{

                        }}
                    >
                        {/* We calculate absolute position overlaid: 
                 But CSS Grid makes this hard to overlap perfectly without pixel math. 
                 Easiest way: Render the player INSIDE the grid map loop.
             */}
                    </div>

                    {mazeData.grid.flatMap((row, y) =>
                        row.map((cell, x) => {
                            const isPlayer = x === gameState.playerGridPos.x && y === gameState.playerGridPos.y;
                            // Check if Cache is looted
                            const cacheId = `${x},${y}`;
                            const isLooted = cell === 9 && gameState.lootedCaches.includes(cacheId);

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`
                  w-full h-full text-[0px] relative
                  ${cell === 0 ? 'bg-black' : ''} 
                  ${cell === 1 ? 'bg-cyan/10' : ''}
                  ${cell === 2 ? 'bg-green-500 animate-pulse' : ''}
                  ${cell === 3 ? 'bg-magenta animate-pulse' : ''}
                  ${cell === 9 ? (isLooted ? 'bg-gray-800' : 'bg-yellow-500') : ''}
                `}
                                >
                                    {isPlayer && (
                                        <div className="absolute inset-0 bg-white rounded-full shadow-[0_0_5px_white] z-20 animate-ping opacity-50"></div>
                                    )}
                                    {isPlayer && (
                                        <div className="absolute inset-1 bg-white rounded-full z-30"></div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>

                <p className="text-[10px] text-gray-500 mt-2">PRESS [M] TO TOGGLE MAP</p>
            </div>
        </div>
    );
}
