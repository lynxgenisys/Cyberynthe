import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

/**
 * IDENTITY: LOGIC_BREACH_02 (The Engineer)
 * DIRECTIVE: Implement Meta-Game State (Seeds & Levels)
 * CONSTRAINTS:
 * - Seed: Derived from Date().toDateString() (Daily Run)
 * - Sector Logic: Level / 25
 */

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const playerRotationRef = React.useRef(0); // Zero-cost sync for Compass

    // --- FAST_STATE_PROTOCOL (High Frequency Telemetry) ---
    // Using Refs to bypass React Render Cycle for O(N^2) AI and 60FPS Sync
    const fastStateRef = useRef({
        playerWorldPos: { x: 0, y: 0, z: 0 },
        playerGridPos: { x: 0, y: 0 },
        bossHp: 0,
        bossMaxHp: 0,
        lastUiUpdate: 0,
        lastGridUpdate: 0,
        lastScanTime: 0,
        lastInteractTime: 0
    });

    const [gameState, setGameState] = useState({
        seed: '',
        floorLevel: 1,
        preBestiaryFloor: 1, // Store floor to return from archives
        sectorId: 1,
        playerName: 'GHOST_USER',
        isPaused: false,
        isElite: false, // Permadeath Mode
        activePenalties: [],

        // GAME MODE & MENU
        gameMode: 'normal', // 'normal' | 'hardcore' | 'ghost'
        isInMenu: true, // Start in splash screen
        highestFloor: 0, // Track best floor reached

        // SCORING TRACKING
        runStartTime: null, // Timestamp when run starts
        floorTimes: [], // Array of {floor, startTime, endTime}
        totalDamageTaken: 0,
        mramUsedCount: 0,
        undetectedFloorCount: 0,
        wasDetectedThisFloor: false,

        playerGridPos: { x: 1, y: 1 }, // Track player for Map
        spawnPoint: null, // Dynamic Spawn Point (Grid Coords)
        ethicsScore: 0.5, // 0.0 (Cyan) to 1.0 (Magenta)
        eBits: 0, // Currency
        isTransitioning: false, // Floor Loading State
        lootedCaches: [], // Array of IDs "x,y"
        notifications: [], // Array of {id, msg, time}
        xp: 0, // Experience Points
        scanningState: { active: false, progress: 0 }, // For HUD UI
        scannedTargets: [], // Array of {x, z, type}
        scannerLevel: 1, // 1: Short, 2: Med, 3: Long

        isPortalLocked: false, // Gatekeeper Logic
        mazeGrid: null, // For Projectile Collision
        bossEncounter: { active: false, name: '', hp: 0, maxHp: 0 },
        bossSubtitle: { text: '', duration: 0, timestamp: 0 },
        visualFilter: 'NONE', // 'NONE', 'CYAN_TINT', 'MAGENTA_JITTER'

        // MINI-MAP & TACTICAL NAV
        navSettings: { mode: 'STATIC', showScanLines: true }, // 'STATIC', 'ROTATING', 'HIDDEN'
        isTacticalView: false,

        // LOOT SYSTEM
        collectedFragments: [], // Array of fragment IDs [0, 1, 2...]
        activeBuffs: [], // Array of { type, floorsRemaining, effect, buffValue }
        inventorySlots: [null, null], // Quick-slot inventory [slot1, slot2]
        showLoreOverlay: false,
        currentFragment: null, // Fragment being displayed

        // COMBAT UI
        isChargingWeapon: false, // Data Spike v2 charge reticle

        // SYSTEM SIGNALS
        manualExitSignal: false // Triggered by UI to end run gracefully
    });

    // FOG OF WAR (Mutable Grid)
    const discoveryRef = useRef([]);

    // Initialize/Reset Discovery Grid when Floor/Sector changes
    useEffect(() => {
        // We defer initialization until Maze Grid is populated? 
        // Actually we can allow dynamic resizing relative to coordinate inputs if simpler
        // But strictly we want to match maze dimensions
        // For now, reset to empty
        discoveryRef.current = []; // Will be populated by RevealMap or on movement
    }, [gameState.floorLevel, gameState.seed]);

    const revealMap = (x, y, radius) => {
        // Ensure grid exists (Dynamic Expansion for safety)
        if (!discoveryRef.current) discoveryRef.current = [];
        const grid = discoveryRef.current;

        // Mark cells
        for (let ry = -radius; ry <= radius; ry++) {
            for (let rx = -radius; rx <= radius; rx++) {
                const tx = x + rx;
                const ty = y + ry;
                if (tx >= 0 && ty >= 0) { // Unbounded max for now, render handles limits
                    if (!grid[ty]) grid[ty] = [];
                    grid[ty][tx] = 1; // 1 = Explored
                }
            }
        }
    };

    const toggleTacticalView = () => {
        setGameState(prev => ({ ...prev, isTacticalView: !prev.isTacticalView }));
    };

    const cycleNavMode = () => {
        setGameState(prev => {
            const next = prev.navSettings.mode === 'STATIC' ? 'ROTATING' : (prev.navSettings.mode === 'ROTATING' ? 'HIDDEN' : 'STATIC');
            return { ...prev, navSettings: { ...prev.navSettings, mode: next } };
        });
    };

    // ... existing functions ...

    const setVisualFilter = (filter) => {
        setGameState(prev => ({ ...prev, visualFilter: filter }));
    };

    const setBossSubtitle = (text, duration = 3000) => {
        setGameState(prev => ({
            ...prev,
            bossSubtitle: { text, duration, timestamp: Date.now() }
        }));
    };

    const addNotification = (msg) => {
        const id = Date.now();
        setGameState(prev => ({
            ...prev,
            notifications: [...prev.notifications, { id, msg, time: Date.now() }].slice(-5) // Keep last 5
        }));
    };

    const updateScannedTargets = (targets) => {
        setGameState(prev => ({ ...prev, scannedTargets: targets }));
    };

    const updateBossStatus = (status) => {
        // 1. FAST SYNC (Immediate for AI/Collision)
        if (status.hp !== undefined) fastStateRef.current.bossHp = status.hp;
        if (status.maxHp !== undefined) fastStateRef.current.bossMaxHp = status.maxHp;

        // 2. THROTTLED UI SYNC (10Hz for React Render)
        const now = Date.now();
        if (now - fastStateRef.current.lastUiUpdate > 100 || status.active !== undefined) {
            setGameState(prev => ({
                ...prev,
                bossEncounter: { ...prev.bossEncounter, ...status }
            }));
            fastStateRef.current.lastUiUpdate = now;
        }
    };

    const markCacheLooted = (x, y) => {
        const id = `${x},${y}`;
        setGameState(prev => ({
            ...prev,
            lootedCaches: [...prev.lootedCaches, id]
        }));
    };

    // PERSISTENCE PROTOCOL
    const checkPersistence = (currentIntegrity) => {
        if (currentIntegrity <= 0) {
            if (gameState.isElite) {
                localStorage.removeItem('CyberSynthe_Save'); // Clear Save
                // Reset to Floor 1, Seed Reset
                setGameState(prev => ({
                    ...prev,
                    floorLevel: 1,
                    sectorId: 1,
                    seed: btoa(Date.now().toString()).substring(0, 16)
                }));
                return 'WIPED';
            } else {
                return 'RESPAWNED';
            }
        }
    };

    const saveSession = () => {
        const data = {
            gameState,
            timestamp: Date.now()
        };
        localStorage.setItem('CyberSynthe_Save', JSON.stringify(data));
        addNotification("GAME SAVED: L1_CACHE_UPDATED");
    };

    const loadSession = (data) => {
        if (!data || !data.gameState) return;

        // CORRECTION: Ensure Boss Protocol is enforced on load
        const state = data.gameState;
        if (state.floorLevel % 10 === 0 && !state.isKernelUnlocked && state.gameMode !== 'ghost') {
            state.isPortalLocked = true;
        }

        setGameState(state);
        addNotification("SESSION_RESTORED");
    };

    // Initialize Session Seed
    useEffect(() => {
        // CHECK FOR SAVE ON START (For debug logs mostly, logic handled in App UI)
        const saved = localStorage.getItem('CyberSynthe_Save');
        // ... save loaded ...

        const timestamp = Date.now().toString();
        // Uses current milliseconds for a truly unique session seed
        const seedHash = btoa(timestamp + "_CYBERYNTHE_SESSION").substring(0, 16);

        setGameState(prev => ({
            ...prev,
            seed: seedHash
        }));

        // INITIAL LORE TRIGGER (Floor 1)
        setBossSubtitle("HEURISTIC_SCAN_COMPLETE... ENTITY_ID: NULL_POINTER... 'Welcome back to the morgue.'", 6000);
    }, []);

    const enterBestiaryMode = () => {
        // 0. AUTO-SAVE BEFORE LEAVING MAIN LOOP
        saveSession();
        addNotification("ENTERING_ARCHIVES... SESSION_PAUSED");

        // 1. SIGNAL TRANSITION START
        setGameState(prev => ({
            ...prev,
            isTransitioning: true,
            preBestiaryFloor: prev.floorLevel // Save current floor
        }));

        // 2. DELAY & TELEPORT TO FLOOR 999
        setTimeout(() => {
            setGameState(prev => ({
                ...prev,
                floorLevel: 999, // BESTIARY_ID
                sectorId: 1,
                spawnPoint: { x: 14, y: 1.5, z: 24 }, // World Coords (7*2, 12*2)
                isPortalLocked: false,
                isTransitioning: true,
                bossSubtitle: { text: "WELCOME TO THE ARCHIVE. SPECIMENS ARE IN STASIS.", duration: 8000, timestamp: Date.now() + 600 },
                visualFilter: 'NONE' // Clear filters for clean inspection
            }));

            // 3. FINISH TRANSITION
            setTimeout(() => {
                setGameState(prev => ({ ...prev, isTransitioning: false }));
            }, 500);

        }, 100);
    };

    const advanceFloor = () => {
        // 0. AUTO-SAVE (L1 CACHE LOGIC)
        saveSession();

        // 1. SIGNAL TRANSITION START (Unmounts Maze)
        setGameState(prev => ({ ...prev, isTransitioning: true }));

        // 2. DELAY & UPDATE FLOOR
        setTimeout(() => {
            setGameState(prev => {
                let nextFloor = prev.floorLevel + 1;

                // BESTIARY EXIT LOGIC
                if (prev.floorLevel === 999) {
                    nextFloor = prev.preBestiaryFloor || 1;
                    addNotification(`EXITING_ARCHIVES... RETURNING_TO_FLOOR_${nextFloor}`);
                }

                // ASCENSION CHECK REMOVED -> ENDLESS MODE
                if (nextFloor === 100) {
                    // TODO: Trigger Class Selection UI
                }

                const nextSector = Math.ceil(nextFloor / 25);

                // LORE FLAVOR TEXT (GHOST PROTOCOL)
                // We set this here so it appears exactly when the floor loads
                let subtitle = null;
                let subDuration = 0;

                if (nextFloor === 1) {
                    subtitle = "HEURISTIC_SCAN_COMPLETE... ENTITY_ID: NULL_POINTER... 'Welcome back to the morgue.'";
                    subDuration = 6000;
                } else if (nextFloor === 2) {
                    subtitle = "FRAGMENT_ID: #0001_WEIGHT... 'I remember the weight of a coffee mug...'";
                    subDuration = 5000;
                    // Trigger Special Choice via State? Or handled by Directive Engine?
                    // We'll set a flag/event that App.jsx monitors, or just roll a specific directive.
                    // Ideally, we push a custom notification or event.
                } else if (nextFloor === 3) {
                    subtitle = "WARNING: THE_STATIC_IS_LEAKING... 'You aren't here to beat the game, Ghost. You're here to keep the lights on.'";
                    subDuration = 7000;
                } else if (nextFloor === 4) {
                    subtitle = "[SEC_AUDIT]: INCONSISTENCY_FOUND. Subject exhibits non-linear decision making.";
                    subDuration = 5000;
                    // Trigger Red Audit Overlay (HUD will handle 'AUDIT_SCAN' logic based on floor or specific state)
                    // We'll set a generic 'narrativeState'
                } else if (nextFloor === 5) {
                    subtitle = "[ECHO_01]: '...ghost... can you hear the background? The Sentinel isn't a guard. It’s a janitor.'";
                    subDuration = 6000;
                } else if (nextFloor === 7) {
                    subtitle = "[LOG_FILE]: 'They told us the Labyrinth was a lifeboat... but I looked through a logic-leak today. I saw the city.'";
                    subDuration = 7000;
                } else if (nextFloor === 9) {
                    subtitle = "[CRITICAL_ALERT]: UPLINK_RESTRICTED. Subject #NULL_POINTER marked for De-compilation.";
                    subDuration = 6000;
                } else if (nextFloor === 11) {
                    subtitle = "[THE_MACHINE_ROOM]: SYSTEM_HANDSHAKE_COMPLETE. 'Welcome to the engine block, Ghost. Mind the gears.'";
                    subDuration = 7000;
                }

                return {
                    ...prev,
                    floorLevel: nextFloor,
                    sectorId: nextSector,
                    spawnPoint: null,
                    scanningState: { active: false, progress: 0 }, // FORCE RESET UI
                    isPortalLocked: (nextFloor % 10 === 0) && prev.gameMode !== 'ghost', // UNLOCKED IN GHOST MODE
                    isTransitioning: true,
                    // Apply Subtitle directly to state here to avoid race conditions
                    bossSubtitle: subtitle ? { text: subtitle, duration: subDuration, timestamp: Date.now() + 600 } : prev.bossSubtitle,

                    // NARRATIVE VISUAL FILTERS
                    visualFilter: (nextFloor === 11) ? 'SECTOR_02_NAVY' : ((nextFloor === 9) ? 'QUARANTINE_LUT' : ((nextFloor === 7) ? 'TEXTURE_BLEED' : prev.visualFilter)),

                    // BUFF SYSTEM: Decrement floor counters
                    activeBuffs: prev.activeBuffs
                        .map(buff => ({ ...buff, floorsRemaining: buff.floorsRemaining - 1 }))
                        .filter(buff => buff.floorsRemaining > 0),

                    // MINI-MAP: Clear scanned targets on floor change
                    scannedTargets: []
                };

                // EXPLICIT RESET of Discovery Grid (MOVED BEFORE RETURN)
                discoveryRef.current = [];

                return nextState;
            });

            // 3. FINISH TRANSITION (Remounts Maze)
            // Giving Rapier 500ms to fully flush physics world
            setTimeout(() => {
                setGameState(prev => ({ ...prev, isTransitioning: false }));
            }, 500);

        }, 100);
    };

    const updatePlayerPos = (x, y, worldPos) => {
        // 1. FAST WORLD SYNC (No Render)
        if (worldPos) {
            fastStateRef.current.playerWorldPos.x = worldPos.x;
            fastStateRef.current.playerWorldPos.y = worldPos.y;
            fastStateRef.current.playerWorldPos.z = worldPos.z;
        }

        // 2. GRID CHANGE SYNC (THROTTLED Render - 2Hz)
        const now = Date.now();
        if (now - fastStateRef.current.lastGridUpdate > 500) {
            if (x !== fastStateRef.current.playerGridPos.x || y !== fastStateRef.current.playerGridPos.y) {
                fastStateRef.current.playerGridPos.x = x;
                fastStateRef.current.playerGridPos.y = y;
                fastStateRef.current.lastGridUpdate = now;
                setGameState(prev => ({ ...prev, playerGridPos: { x, y } }));
            }
        }
    };

    const updateScanningState = (active, progress) => {
        setGameState(prev => ({ ...prev, scanningState: { active, progress } }));
    };

    const triggerScan = () => {
        fastStateRef.current.lastScanTime = Date.now();
        setGameState(prev => ({ ...prev, lastScanTime: fastStateRef.current.lastScanTime }));
    };

    // SCAN PROGRESS TICKER
    useEffect(() => {
        if (!gameState.lastScanTime) return;

        // Start Scan
        updateScanningState(true, 0);

        const startTime = gameState.lastScanTime;
        const duration = 2000; // 2 Seconds

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            updateScanningState(true, progress);

            if (progress >= 1.0) {
                clearInterval(interval);
                setTimeout(() => updateScanningState(false, 0), 500); // Clear after 0.5s completion
            }
        }, 50);

        return () => clearInterval(interval);
    }, [gameState.lastScanTime]);

    // --- LEVELING LOGIC ---
    const XP_THRESHOLDS = [0, 188, 470, 1175, 2938, 7344];

    const getLevelFromXP = (xp) => {
        // 1. Check Static Thresholds
        for (let i = 1; i < XP_THRESHOLDS.length; i++) {
            if (xp < XP_THRESHOLDS[i]) {
                return i;
            }
        }

        // 2. Dynamic Calculation for Lvl 7+
        // If we are here, XP > 7344 (Level 6)
        let level = 6;
        let limit = XP_THRESHOLDS[5];
        while (xp >= limit) {
            limit = Math.floor(limit * 2.5);
            level++;
        }
        return level;
    };

    const getNextLevelXP = (level) => {
        // 1. Static
        if (level < XP_THRESHOLDS.length) return XP_THRESHOLDS[level];

        // 2. Dynamic
        let limit = XP_THRESHOLDS[XP_THRESHOLDS.length - 1]; // Lvl 6 cap
        for (let i = XP_THRESHOLDS.length; i <= level; i++) {
            limit = Math.floor(limit * 2.5);
        }
        return limit;
    };

    // LEVEL UP MONITOR
    useEffect(() => {
        const currentLevel = getLevelFromXP(gameState.xp);
        if (currentLevel > gameState.scannerLevel) { // Use scannerLevel as proxy for Player Level for now
            // LEVEL UP DETECTED
            addNotification(`ACCESS_LEVEL_INCREASED: ${currentLevel}`);
            setBossSubtitle("USER_PRIVILEGE_ELEVATED... PROCESSING_POWER: EXPANDED.", 4000);

            // Update State
            setGameState(prev => ({ ...prev, scannerLevel: currentLevel }));
        }
    }, [gameState.xp]);

    const triggerInteract = () => {
        // VISUAL FEEDBACK FOR USER DEBUGGING
        addNotification("DEBUG: R_KEY_RECEIVED");
        fastStateRef.current.lastInteractTime = Date.now();
        setGameState(prev => ({ ...prev, lastInteractTime: fastStateRef.current.lastInteractTime }));
    };

    // LOOT SYSTEM: Process item drops from Data Nodes
    const processLootDrop = (lootItem) => {
        if (!lootItem) return;

        const { type, name, description, color } = lootItem;

        // Display notification
        addNotification(`[DE-FRAGMENTED]: ${description}`, color);

        // GHOST MODE: AUTO-CONSUME
        if (gameState.gameMode === 'ghost') {
            // Apply Effect Immediately
            switch (type) {
                case 'EBIT_CLUSTER':
                    setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                    break;
                case 'MRAM_INJECTOR':
                    setGameState(prev => ({ ...prev, playerIntegrity: Math.min(100, (prev.playerIntegrity || 100) + 40), playerMRAM: Math.min(100, (prev.playerMRAM || 100) + 40) }));
                    break;
                case 'LOGIC_FRAGMENT':
                    if (lootItem.fragmentId !== undefined) {
                        setGameState(prev => ({
                            ...prev,
                            collectedFragments: [...prev.collectedFragments, lootItem.fragmentId],
                            eBits: (prev.eBits || 0) + lootItem.bonusEBits,
                            showLoreOverlay: true, // Auto-Show? Maybe suppress for speedrun?
                            // Let's suppress overlay for speedrun flow
                            currentFragment: lootItem
                        }));
                        if (gameState.gameMode === 'ghost') addNotification("[GHOST]: FRAGMENT_ARCHIVED (NO_READ)");
                    } else {
                        setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                    }
                    break;
                case 'BUFFER_OVERCLOCKER':
                case 'CLOCK_CYCLE_BOOST':
                    setGameState(prev => ({
                        ...prev,
                        activeBuffs: [...prev.activeBuffs, {
                            type: lootItem.buffType,
                            floorsRemaining: lootItem.duration,
                            buffValue: lootItem.buffValue,
                            name: name
                        }]
                    }));
                    break;
                // CONSUMABLES -> AUTO-FIRE ABILITY
                case 'GHOST_PROTOCOL':
                case 'SYSTEM_PING':
                case 'KERNEL_SPIKE':
                case 'SECTOR_BREACH':
                case 'CORE_SWAP':
                    // Trigger Effect Instantly
                    if (lootItem.abilityType === 'MAP_REVEAL') revealMap(0, 0, 9999);
                    if (lootItem.abilityType === 'SKIP_FLOOR') advanceFloor();
                    // Others might need target context, but for Ghost Mode, just Auto-Use simple ones
                    addNotification(`[AUTO-USED]: ${name}`);
                    break;
            }
            return;
        }

        switch (type) {
            case 'EBIT_CLUSTER':
                setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                break;

            case 'MRAM_INJECTOR':
                // AUTO-INJECT LOGIC: If full Health/MRAM, Store it. If critical, Use it?
                // Standard Logic: Always Store, User chooses when to use.
                addToInventory(lootItem);
                break;

            case 'LOGIC_FRAGMENT':
                // Add fragment to collected list
                if (lootItem.fragmentId !== undefined) {
                    setGameState(prev => ({
                        ...prev,
                        collectedFragments: [...prev.collectedFragments, lootItem.fragmentId],
                        eBits: (prev.eBits || 0) + lootItem.bonusEBits,
                        showLoreOverlay: true,
                        currentFragment: lootItem
                    }));
                } else {
                    // Archive complete bonus
                    setGameState(prev => ({ ...prev, eBits: (prev.eBits || 0) + lootItem.value }));
                }
                break;

            case 'BUFFER_OVERCLOCKER':
            case 'CLOCK_CYCLE_BOOST':
                // Add buff to active buffs
                setGameState(prev => ({
                    ...prev,
                    activeBuffs: [...prev.activeBuffs, {
                        type: lootItem.buffType,
                        floorsRemaining: lootItem.duration,
                        buffValue: lootItem.buffValue,
                        name: name
                    }]
                }));
                break;

            case 'GHOST_PROTOCOL':
            case 'SYSTEM_PING':
            case 'KERNEL_SPIKE':
            case 'SECTOR_BREACH':
            case 'CORE_SWAP':
                // Add to quick-slot inventory
                addToInventory(lootItem);
                break;

            default:
                console.warn('Unknown loot type:', type);
        }
    };

    // Add item to quick-slot inventory
    const addToInventory = (item) => {
        setGameState(prev => {
            const slots = [...prev.inventorySlots];

            // Check if stackable and already exists
            if (item.stackable) {
                for (let i = 0; i < slots.length; i++) {
                    if (slots[i] && slots[i].type === item.type) {
                        const newCount = slots[i].count + 1;
                        if (newCount <= item.maxStack) {
                            slots[i] = { ...slots[i], count: newCount };
                            return { ...prev, inventorySlots: slots };
                        }
                    }
                }
            }

            // Find empty slot
            for (let i = 0; i < slots.length; i++) {
                if (!slots[i]) {
                    slots[i] = { ...item, count: item.stackable ? 1 : undefined };
                    return { ...prev, inventorySlots: slots };
                }
            }

            // Inventory full
            addNotification("[INVENTORY_FULL]: Item lost");
            return prev;
        });
    };

    // Use item from quick-slot
    const useQuickSlot = (slotIndex) => {
        setGameState(prev => {
            const slots = [...prev.inventorySlots];
            const item = slots[slotIndex];

            if (!item) return prev;

            // HANDLE SPECIAL TYPES FIRST
            if (item.type === 'MRAM_INJECTOR') {
                addNotification("[SYSTEM_RESTORE]: Integrity/M-RAM Replenished");
                return {
                    ...prev,
                    playerIntegrity: Math.min(100, (prev.playerIntegrity || 100) + 40),
                    playerMRAM: Math.min(100, (prev.playerMRAM || 100) + 40),
                    inventorySlots: slots.map((s, i) => {
                        if (i !== slotIndex) return s;
                        if (s.stackable && s.count > 1) return { ...s, count: s.count - 1 };
                        return null;
                    })
                };
            }

            // Execute item effect
            switch (item.abilityType) {
                case 'INVISIBILITY':
                    // TODO: Implement invisibility effect
                    addNotification("[GHOST_PROTOCOL]: Active for 10s");
                    break;
                case 'MAP_REVEAL':
                    // Reveal entire map
                    revealMap(0, 0, 9999);
                    addNotification("[SYSTEM_PING]: Map revealed");
                    break;
                case 'INSTANT_KILL':
                    // TODO: Mark next mob for instant kill
                    addNotification("[KERNEL_SPIKE]: Ready");
                    break;
                case 'SKIP_FLOOR':
                    advanceFloor();
                    break;
                case 'REROLL_STATS':
                    // TODO: Reroll resonance
                    addNotification("[CORE_SWAP]: Stats rerolled");
                    break;
                default:
                    break;
            }

            // Consume item
            if (item.stackable && item.count > 1) {
                slots[slotIndex] = { ...item, count: item.count - 1 };
            } else {
                slots[slotIndex] = null;
            }

            return { ...prev, inventorySlots: slots };
        });
    };


    return (
        <GameContext.Provider value={{
            gameState,
            enterBestiaryMode, // EXPOSED
            advanceFloor,
            updatePlayerPos,
            setGameState,
            checkPersistence,
            addNotification,
            markCacheLooted,
            updateScanningState,
            triggerScan,
            updateScannedTargets,
            updateBossStatus,
            setBossSubtitle,
            setVisualFilter, // EXPOSED
            getLevelFromXP,
            getNextLevelXP,
            saveSession, // EXPOSED
            loadSession, // EXPOSED
            playerRotationRef, // EXPOSED REF

            // MINI-MAP API
            discoveryRef,
            revealMap,
            toggleTacticalView,
            cycleNavMode,

            // INTERACTION & KERNEL LOGIC
            isKernelUnlocked: gameState.isKernelUnlocked,
            activeLoreLog: gameState.activeLoreLog,
            interactionPrompt: gameState.interactionPrompt,
            lastInteractTime: gameState.lastInteractTime,

            triggerInteract, // EXPOSED FUNCTION REF
            fastStateRef, // EXPOSED FOR O(N^2) SYSTEMS
            setInteractionPrompt: (prompt) => setGameState(prev => ({ ...prev, interactionPrompt: prompt })),
            setActiveLoreLog: (log) => setGameState(prev => ({ ...prev, activeLoreLog: log })), // Pause handled by App.jsx
            unlockKernel: () => {
                addNotification("KERNEL_UPDATED: PORTAL_UNLOCKED");
                setGameState(prev => ({ ...prev, isKernelUnlocked: true, isPortalLocked: false, activeLoreLog: null }));
            },

            // LOOT SYSTEM
            processLootDrop,
            useQuickSlot,

            // SYSTEM CONTROL
            triggerExitRun: () => setGameState(prev => ({ ...prev, manualExitSignal: true })),

            // COMBAT UI
            setChargingWeapon: (isCharging) => setGameState(prev => ({ ...prev, isChargingWeapon: isCharging }))
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
