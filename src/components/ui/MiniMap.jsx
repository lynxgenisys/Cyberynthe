import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

/**
 * COMPONENT: TACTICAL_NAV_SYSTEM
 * DIRECTIVE: Render Mini-Map / Tactical View with Fog of War
 */
export const MiniMap = React.memo(() => {
    const { gameState, discoveryRef, fastStateRef, revealMap, toggleTacticalView, playerRotationRef } = useGame();
    const canvasRef = useRef(null);
    const temporaryBlipsRef = useRef({}); // Fading blips (mobs)
    const permanentMarkersRef = useRef({}); // Permanent markers (caches, portals)

    const { mode, showScanLines } = gameState.navSettings;
    const isTactical = gameState.isTacticalView;

    // KEYBINDINGS
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.code === 'KeyM') toggleTacticalView();
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [toggleTacticalView]);

    // RENDER LOOP
    useEffect(() => {
        if ((mode === 'HIDDEN' && !isTactical) || gameState.isTransitioning) {
            // Clear temporary blips and permanent markers on hide/transition
            temporaryBlipsRef.current = {};
            permanentMarkersRef.current = {};
            return;
        }

        let animationFrameId;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            // 1. UPDATE DISCOVERY
            const pGrid = fastStateRef.current.playerGridPos;
            if (pGrid) {
                // Reveal 1-tile radius (Tight fit to hallway width)
                revealMap(pGrid.x, pGrid.y, 1);
            }

            // 2. CLEAR
            ctx.clearRect(0, 0, width, height);

            // 3. TRANSFORM SETUP
            ctx.save();
            const scale = isTactical ? 20 : 12; // Zoom level

            // Center Canvas at true center (player icon handles its own offset)
            ctx.translate(width / 2, height / 2);

            // ROTATION LOGIC
            const playerRot = playerRotationRef.current || 0;
            if (mode === 'ROTATING' && !isTactical) {
                // Rotating: Map rotates opposite to player
                ctx.scale(-1, 1); // Fix Mirroring (Left/Right Good, Up/Down Switched logic)
                ctx.rotate(-playerRot);
            }

            // Draw Compass (N, E, S, W)
            ctx.save();
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Use fixed radius based on view size
            const compassR = isTactical ? (Math.min(width, height) / 2 - 30) : (Math.min(width, height) / 2 - 15);

            ctx.fillStyle = '#FF0000'; ctx.fillText('N', 0, -compassR);
            ctx.fillStyle = '#0055FF'; ctx.fillText('S', 0, compassR);
            ctx.fillStyle = '#00FF00'; ctx.fillText('E', compassR, 0);
            ctx.fillStyle = '#00FF00'; ctx.fillText('W', -compassR, 0);
            ctx.restore();

            // Translate World so Player is at Center
            // World layout: x, y (from grid z).
            // Player Pos: pGrid.x, pGrid.y
            // Smooth Pos from fastStateRef if possible, but grid is discrete.
            // Use world pos for smoothness.
            const pWorld = fastStateRef.current.playerWorldPos;
            const pX = pWorld.x, pZ = pWorld.z; // Use meters.
            // 2 meters per grid cell.
            // Scale applies to meters? Or Grid Units?
            // Let's use Grid Units for discovery lookup.
            // World / 2 = Grid.
            const pGX = pX / 2;
            const pGZ = pZ / 2;

            ctx.translate(-pGX * scale, -pGZ * scale);

            // 4. DRAW FOG OF WAR (DISCOVERY MATRIX)
            // Iterate visible range to optimize
            const viewRadius = Math.ceil(width / scale / 2) + 2;
            const startX = Math.floor(pGX - viewRadius);
            const endX = Math.ceil(pGX + viewRadius);
            const startY = Math.floor(pGZ - viewRadius);
            const endY = Math.ceil(pGZ + viewRadius);

            const grid = discoveryRef.current || [];

            // Path Lines Logic (Thin Wireframe -> Thick Corridors)
            ctx.strokeStyle = '#00AAAA'; // Cyan Line
            ctx.lineWidth = 8; // 2/3 of Player Icon Width (12px) = 8px
            ctx.beginPath();

            const mazeGrid = gameState.mazeGrid;
            for (let y = startY; y <= endY; y++) {
                if (!grid[y]) continue;
                for (let x = startX; x <= endX; x++) {
                    if (grid[y][x]) { // Revealed
                        // Check if it is a Path (1, 2, 3, 9). Walls (0) are ignored (Black Void)
                        const cell = mazeGrid && mazeGrid[y] && mazeGrid[y][x];
                        const isPath = (cell !== undefined && cell !== 0);

                        if (isPath) {
                            const cx = x * scale + scale / 2;
                            const cy = y * scale + scale / 2;

                            // Draw connection right (if path)
                            if (grid[y][x + 1]) { // If neighbor revealed
                                const rightCell = mazeGrid && mazeGrid[y] && mazeGrid[y][x + 1];
                                const isRightPath = (rightCell !== undefined && rightCell !== 0);
                                if (isRightPath) {
                                    ctx.moveTo(cx, cy);
                                    ctx.lineTo(cx + scale, cy);
                                }
                            }
                            // Draw connection down (if path)
                            if (grid[y + 1] && grid[y + 1][x]) {
                                const downCell = mazeGrid && mazeGrid[y + 1] && mazeGrid[y + 1][x];
                                const isDownPath = (downCell !== undefined && downCell !== 0);
                                if (isDownPath) {
                                    ctx.moveTo(cx, cy);
                                    ctx.lineTo(cx, cy + scale);
                                }
                            }
                            // Draw node
                            ctx.rect(cx - 0.5, cy - 0.5, 1, 1);
                        }
                    }
                }
            }
            ctx.stroke();

            // 5. DRAW ENTITIES (SCANNER BLIPS)
            const now = Date.now();

            // Update blips from scanned targets
            if (gameState.scannedTargets && gameState.scannedTargets.length > 0) {
                gameState.scannedTargets.forEach(target => {
                    const id = `${target.x},${target.z}`;

                    // Separate permanent markers from temporary blips
                    if (target.type === 'CACHE' || target.type === 'PORTAL') {
                        // Permanent markers - never fade
                        permanentMarkersRef.current[id] = { ...target, opacity: 1.0 };
                    } else if (target.type === 'MOB') {
                        // Temporary blips - fade over time
                        temporaryBlipsRef.current[id] = { ...target, opacity: 1.0, timestamp: now };
                    }
                });
            }

            // Filter out looted caches from permanent markers
            if (gameState.lootedCaches && gameState.lootedCaches.length > 0) {
                gameState.lootedCaches.forEach(cacheId => {
                    const [cx, cz] = cacheId.split(',').map(Number);
                    const worldX = cx * 2;
                    const worldZ = cz * 2;
                    const markerId = `${worldX},${worldZ}`;
                    delete permanentMarkersRef.current[markerId];
                });
            }

            // Render permanent markers (never fade)
            Object.values(permanentMarkersRef.current).forEach(marker => {
                const bGX = marker.x / 2;
                const bGZ = marker.z / 2;

                ctx.beginPath();
                ctx.arc(bGX * scale, bGZ * scale, scale * 0.5, 0, Math.PI * 2);

                // Color by type with constant glow
                if (marker.type === 'CACHE') {
                    ctx.fillStyle = 'rgba(255, 165, 0, 1)';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(255, 165, 0, 0.8)';
                } else if (marker.type === 'PORTAL') {
                    ctx.fillStyle = 'rgba(200, 0, 255, 1)';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(200, 0, 255, 0.8)';
                }

                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Render and decay temporary blips (mobs)
            Object.keys(temporaryBlipsRef.current).forEach(key => {
                const b = temporaryBlipsRef.current[key];
                const age = now - (b.timestamp || 0);

                // Fade over 2.5 seconds (slower than before)
                if (age > 2500) {
                    delete temporaryBlipsRef.current[key];
                    return;
                }

                b.opacity = 1 - (age / 2500);

                // Convert world coords to grid coords (2m per cell)
                const bGX = b.x / 2;
                const bGZ = b.z / 2;

                // Draw blip circle - pulsing
                ctx.beginPath();
                const pulseSize = scale * (0.6 + Math.sin(age / 200) * 0.1); // Slight pulse
                ctx.arc(bGX * scale, bGZ * scale, pulseSize, 0, Math.PI * 2);

                // Red glow for mobs
                ctx.fillStyle = `rgba(255, 50, 50, ${b.opacity})`;
                ctx.shadowBlur = 8 * b.opacity;
                ctx.shadowColor = `rgba(255, 0, 0, ${b.opacity})`;

                ctx.fill();
                ctx.shadowBlur = 0;
            });

            ctx.restore(); // Restore to screen space

            // 6. DRAW PLAYER ICON (Overlay)
            ctx.save();
            // Center the player icon at the true canvas center
            ctx.translate(width / 2, height / 2);

            if (mode === 'STATIC' || isTactical) {
                // Map is Fixed North (Up). Player Rotates.
                ctx.rotate(playerRot); // Align rotation
            } else {
                // Map Rotates. Player is Fixed Up.
                // No rotation needed (Up is default)
            }

            // Draw Arrow (centered at 0,0)
            ctx.beginPath();

            ctx.moveTo(0, -8); // Tip
            ctx.lineTo(6, 8);
            ctx.lineTo(0, 4); // Notch
            ctx.lineTo(-6, 8);
            ctx.closePath();
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00FFFF';
            ctx.fill();
            ctx.restore();

            // 7. EFFECTS
            if ((showScanLines || isTactical) && isTactical) {
                // Scanlines
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                for (let i = 0; i < height; i += 4) {
                    ctx.fillRect(0, i, width, 2);
                }

                // Vignette / No Signal borders handled by CSS mostly
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mode, isTactical, showScanLines, gameState.scannedTargets, gameState.isTransitioning, gameState.floorLevel]);

    // Explicitly clear markers when floor changes
    useEffect(() => {
        permanentMarkersRef.current = {};
        temporaryBlipsRef.current = {};
    }, [gameState.floorLevel]);

    if (mode === 'HIDDEN' && !isTactical) return null;

    return (
        <div className={`
            ${isTactical ? 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center' : 'absolute right-4 bottom-4 z-20'}
            transition-all duration-300 ease-out pointer-events-none
        `}>
            <div className={`
                relative overflow-hidden border border-cyan/50 bg-black/90 shadow-[0_0_20px_rgba(0,255,255,0.2)]
                ${isTactical ? 'w-[90vw] h-[90vh] rounded-lg' : 'w-48 h-48 rounded-full'}
            `}>
                <canvas
                    ref={canvasRef}
                    width={isTactical ? window.innerWidth * 0.9 : 200}
                    height={isTactical ? window.innerHeight * 0.9 : 200}
                    className="w-full h-full object-contain opacity-80"
                />

                {/* Tactical Legend */}
                {isTactical && (
                    <div className="absolute bottom-4 left-4 text-xs font-mono text-cyan space-y-1">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> HOSTILE_SIGNATURE</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> DATA_FRAGMENT</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> KERNEL_GATE</div>
                    </div>
                )}

                {/* Decoration */}
                <div className="absolute inset-0 pointer-events-none border-2 border-cyan/20 rounded-[inherit]"></div>
                {!isTactical && (
                    <div className="absolute bottom-2 right-0 left-0 text-center text-[8px] text-cyan/50 font-mono tracking-widest">NAV_SYS_V4</div>
                )}
            </div>
        </div>
    );
});
