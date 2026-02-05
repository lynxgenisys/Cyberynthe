import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../../context/GameContext';
import { useInventory } from '../../context/InventoryContext';
import { usePlayer } from '../../context/PlayerContext';
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
    const { gameState, setGameState, addNotification, markCacheLooted, updateScannedTargets, fastStateRef, processLootDrop, startDecryption, triggerMobSpawn } = useGame();
    const { damageKernel } = usePlayer();

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

        // Use Minigame for Standard Caches (Not Bestiary)
        if (floorLevel !== 999) {
            startDecryption((result) => {
                // ALWAYS Mark Looted (Consumed) regardless of outcome
                markCacheLooted(cx, cz);

                if (result === "FATAL_ERROR") {
                    // Damage handled in SpectralScroll component
                    addNotification("CACHE_SELF_DESTRUCTED // DATA_PURGED");
                } else if (result === "LOGIC_BREACH") {
                    // Damage handled in SpectralScroll component
                    // SPAWN BIT-MITE
                    triggerMobSpawn('BIT_MITE', cx, cz);
                    addNotification("SECURITY_BREACH // THREAT_DETECTED");
                } else if (result === "STABLE_HANDSHAKE") {
                    // Standard Loot
                    const collectedFragments = gameState.collectedFragments || [];
                    const lootItem = rollLoot(floorLevel, collectedFragments);
                    if (processLootDrop) processLootDrop(lootItem);
                    // NOTIFY USER
                    addNotification(`DATA_EXTRACTED: ${lootItem.name} [${lootItem.type}]`);
                    showFloatingMessage(`+ ${lootItem.name}`, "text-green-400", 3000);

                } else if (result === "CRITICAL_SYNC") {
                    // 2x LOOT + OVERCLOCKER
                    const collectedFragments = gameState.collectedFragments || [];
                    // Loot 1
                    const loot1 = rollLoot(floorLevel, collectedFragments);
                    if (processLootDrop) processLootDrop(loot1);
                    addNotification(`CRITICAL_DATA: ${loot1.name}`);

                    // Loot 2
                    const loot2 = rollLoot(floorLevel, collectedFragments);
                    if (processLootDrop) processLootDrop(loot2);
                    addNotification(`BONUS_DATA: ${loot2.name}`);

                    // Bonus Rare
                    const clocker = {
                        type: 'BUFFER_OVERCLOCKER',
                        name: 'BUFFER_OVERCLOCKER',
                        description: 'System Cycle Speed Boosted',
                        color: '#EA00FF',
                        buffType: 'CLOCK_SPEED',
                        duration: 5,
                        buffValue: 20
                    };
                    if (processLootDrop) processLootDrop(clocker);
                    addNotification("SYSTEM_UPGRADE: BUFFER_OVERCLOCKER INSTALLED");

                    showFloatingMessage("CRITICAL SYNC: TRIPLE DATA!", "text-magenta", 4000);

                } else if (result === "FORCE_QUIT") {
                    addNotification("DECRYPTION_ABORTED // CACHE_SEALED");
                }
            });
            return;
        }

        // LEGACY / BESTIARY FALLBACK
        markCacheLooted(cx, cz);
        const collectedFragments = gameState.collectedFragments || [];
        const lootItem = rollLoot(floorLevel, collectedFragments);

        if (processLootDrop) {
            processLootDrop(lootItem);
        } else {
            if (lootItem.type === 'EBIT_CLUSTER') {
                setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                addNotification(`[DE-FRAGMENTED]: ${lootItem.description}`);
            }
        }
    }, [floorLevel, markCacheLooted, addNotification, setGameState, gameState.collectedFragments, processLootDrop, startDecryption, triggerMobSpawn, damageKernel]);

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
