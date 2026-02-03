import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../../context/GameContext';
import { useInventory } from '../../context/InventoryContext';
import DataNode from './DataNode';
import { rollLoot } from '../../engine/LootTable';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Manage Data Node Extraction (L1 Cache Loot System)
 * MECHANIC: Proximity → Handshake (2s) → Loot
 */

const LootManager = React.memo(({ maze, floorLevel }) => {
    const [caches, setCaches] = useState([]);
    const { addItem } = useInventory();
    const { gameState, setGameState, addNotification, markCacheLooted, updateScannedTargets, fastStateRef, processLootDrop } = useGame();

    useMemo(() => {
        const newCaches = [];
        if (!maze || !maze.grid) return;

        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                if (cell === 9) {
                    newCaches.push({
                        id: `${x},${z}`,
                        x: x * 2,
                        z: z * 2
                    });
                }
            });
        });
        setCaches(newCaches);
    }, [maze]);

    const handleExtract = React.useCallback((cacheId) => {
        const [cx, cz] = cacheId.split(',').map(Number);
        markCacheLooted(cx, cz);

        // Roll for loot
        const collectedFragments = gameState.collectedFragments || [];
        const lootItem = rollLoot(floorLevel, collectedFragments);

        // Process the loot drop
        if (processLootDrop) {
            processLootDrop(lootItem);
        } else {
            // Fallback to basic handling
            if (lootItem.type === 'EBIT_CLUSTER') {
                setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                addNotification(`[DE-FRAGMENTED]: ${lootItem.description}`);
            }
        }
    }, [floorLevel, markCacheLooted, addNotification, setGameState, gameState.collectedFragments, processLootDrop]);

    // Scan detection loop for caches
    useFrame(() => {
        if (!gameState.lastScanTime || !fastStateRef.current.playerWorldPos) return;

        const scanAge = (Date.now() - gameState.lastScanTime) / 1000;
        if (scanAge >= 2.5) return; // Scan expired

        const playerPos = fastStateRef.current.playerWorldPos;
        const waveRadius = scanAge * 25; // 25m/s speed
        const scannedCaches = [];

        caches.forEach(cache => {
            if (gameState.lootedCaches.includes(cache.id)) return; // Skip looted

            const dx = playerPos.x - cache.x;
            const dz = playerPos.z - cache.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Check if scan wave is hitting this cache
            if (dist < waveRadius && dist > waveRadius - 5) {
                scannedCaches.push({ x: cache.x, z: cache.z, type: 'CACHE' });
            }
        });

        if (scannedCaches.length > 0) {
            updateScannedTargets(scannedCaches);
        }
    });

    return (
        <group>
            {caches.map(cache => (
                <DataNode
                    key={cache.id}
                    cache={{ ...cache, isLooted: gameState.lootedCaches.includes(cache.id) }}
                    onExtract={handleExtract}
                />
            ))}
        </group>
    );
});

export default LootManager;
