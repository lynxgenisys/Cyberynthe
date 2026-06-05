import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import { calculateVelocityScore, calculateStabilityScore, calculateGhostScore } from '../../utils/scoring';
import { submitScore, supabase, getGlobalAverageGhostRunTime } from '../../utils/supabase';

/**
 * RUN TRACKER
 * Tracks floor events, damage, and calculates final scores
 * Handles submission payload on death/exit
 */
export default function RunTracker() {
    const { gameState, setGameState, addNotification } = useGame();
    const { state: playerState } = usePlayer();
    const currentFloorStartRef = useRef(null);
    const prevHpRef = useRef(null);
    const globalGhostAvgRef = useRef(120000);

    // Initialize prevHp on first render
    useEffect(() => {
        if (prevHpRef.current === null) {
            prevHpRef.current = playerState.stats.currentIntegrity;
        }
        
        if (gameState.gameMode === 'ghost') {
            getGlobalAverageGhostRunTime().then(res => {
                if (res.success) globalGhostAvgRef.current = res.averageMs;
            });
        }
    }, [gameState.gameMode]);

    // Start floor time tracking when floor changes
    useEffect(() => {
        if (gameState.isInMenu || gameState.floorLevel === 999) return; // Skip menu and bestiary

        // Record floor start time
        currentFloorStartRef.current = Date.now();

        // Reset detection flag for new floor
        setGameState(prev => ({ ...prev, wasDetectedThisFloor: false }));
    }, [gameState.floorLevel, gameState.isInMenu, setGameState]);

    // Track damage taken
    useEffect(() => {
        const currentHp = playerState.stats.currentIntegrity;
        const prevHp = prevHpRef.current;

        if (prevHp !== null && currentHp < prevHp) {
            const damage = prevHp - currentHp;
            setGameState(prev => ({
                ...prev,
                totalDamageTaken: prev.totalDamageTaken + damage
            }));
        }

        prevHpRef.current = currentHp;
    }, [playerState.stats.currentIntegrity, setGameState]);

    // Handle floor completion (when advancing to next floor)
    const handleFloorComplete = () => {
        if (!currentFloorStartRef.current) return;

        const endTime = Date.now();
        const startTime = currentFloorStartRef.current;

        // Record floor time
        setGameState(prev => ({
            ...prev,
            floorTimes: [
                ...prev.floorTimes,
                {
                    floor: prev.floorLevel,
                    startTime,
                    endTime
                }
            ],
            // Update undetected streak
            undetectedFloorCount: prev.wasDetectedThisFloor
                ? 0
                : prev.undetectedFloorCount + 1,

            // Update highest floor
            highestFloor: Math.max(prev.highestFloor, prev.floorLevel)
        }));
    };

    // Listen for floor advances
    useEffect(() => {
        if (gameState.floorLevel > 1 && !gameState.isInMenu) {
            handleFloorComplete();
        }

        // Always ensure highestFloor is at least the current floor
        if (!gameState.isInMenu && gameState.floorLevel !== 999) {
            setGameState(prev => ({
                ...prev,
                highestFloor: Math.max(prev.highestFloor || 0, prev.floorLevel)
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.floorLevel]);

    // Handle player death
    useEffect(() => {
        if (playerState.stats.currentIntegrity <= 0 && !gameState.isInMenu && gameState.gameMode !== 'ghost') {
            handleRunEnd('death');
        }
    }, [playerState.stats.currentIntegrity, gameState.isInMenu, gameState.gameMode]);

    // Handle manual exit
    useEffect(() => {
        // We allow manual exit even if isInMenu is true (inventory is open)
        if (gameState.manualExitSignal) {
            handleRunEnd('manual_exit');
            // Reset signal
            setGameState(prev => ({ ...prev, manualExitSignal: false }));
        }
    }, [gameState.manualExitSignal, setGameState]);

    const getSaveKeyLocal = async () => {
        if (!supabase) return 'CyberSynthe_Save_guest';
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return `CyberSynthe_Save_${user ? user.id : 'guest'}`;
        } catch (e) {
            return 'CyberSynthe_Save_guest';
        }
    };

    const handleRunEnd = async (reason) => {
        // Calculate Total Score: (Floor * 1000) + eBits
        // This is a simple formula, we can make it more complex later
        const calculatedScore = (gameState.floorLevel * 1000) + (gameState.eBits || 0);

        const finalScores = {
            maxFloor: gameState.floorLevel,
            velocityScore: calculateVelocityScore(gameState.floorTimes),
            stabilityScore: calculateStabilityScore(
                gameState.floorLevel,
                gameState.totalDamageTaken,
                gameState.mramUsedCount
            ),
            ghostScore: gameState.gameMode === 'ghost'
                ? calculateGhostScore(gameState.floorLevel, Date.now() - gameState.runStartTime
                    - (gameState.totalPausedTime || 0)
                    - (gameState.isPaused && gameState.pauseStartTime ? (Date.now() - gameState.pauseStartTime) : 0), globalGhostAvgRef.current)
                : 0,
            undetectedStreak: gameState.undetectedFloorCount,
            resonanceFinal: gameState.ethicsScore,
            gameMode: gameState.gameMode,
            reason
        };

        // SUBMIT TO SUPABASE
        addNotification("TRANSMITTING_RESULTS... [UPLINK_INIT]");

        const submission = {
            player_name: gameState.playerName || 'GHOST_USER',
            score: Math.round(calculatedScore), 
            floor_reached: Math.round(gameState.floorLevel),
            run_time: Math.round((Date.now() - gameState.runStartTime
                - (gameState.totalPausedTime || 0)
                - (gameState.isPaused && gameState.pauseStartTime ? (Date.now() - gameState.pauseStartTime) : 0)
            ) / 1000),
            game_mode: gameState.gameMode,
            damage_taken: Math.round(gameState.totalDamageTaken || 0),
            mram_used: Math.round(gameState.mramUsedCount || 0),
            undetected_floors: Math.round(finalScores.undetectedStreak || 0),
            resonance: Number((finalScores.resonanceFinal || 0.5).toFixed(2)), // Usually float in DB, but just in case
            ghost_score: Math.round(finalScores.ghostScore || 0),
            stability_score: Math.round(finalScores.stabilityScore || 0),
            session_kills: Math.round(gameState.sessionKills || 0),

            // Legacy JSON (Keep for debug/safety)
            platform_data: {
                velocity: Math.round(finalScores.velocityScore || 0),
                reason: finalScores.reason
            }
        };

        const result = await submitScore(submission);
        if (result.success) {
            addNotification("TRANSMISSION_SUCCESS: SCORE_ARCHIVED");
        } else {
            addNotification("TRANSMISSION_FAILED: LOCAL_CACHE_ONLY");
        }

        // Log final scores (will be sent to Supabase later)
        console.log('[RUN_TRACKER] Run ended:', finalScores);

        // Update Lifetime Profile Stats in Supabase
        if (result.success && supabase) {
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                // Fetch current profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    const currentDives = profile.deepest_dives || { normal: 0, hardcore: 0, ghost: 0 };
                    const currentLifetimeKills = profile.lifetime_kills || {};
                    
                    // Update deepest dive for this mode
                    if (submission.floor_reached > (currentDives[submission.game_mode] || 0)) {
                        currentDives[submission.game_mode] = submission.floor_reached;
                    }
                    
                    // Add session mob kills to lifetime
                    const sessionMobs = gameState.sessionMobKills || {};
                    for (const [mobId, count] of Object.entries(sessionMobs)) {
                        currentLifetimeKills[mobId] = (currentLifetimeKills[mobId] || 0) + count;
                    }

                    // Merge unlocked fragments
                    const currentFragments = profile.unlocked_fragments || [];
                    const sessionFragments = gameState.collectedFragments || [];
                    const mergedFragments = Array.from(new Set([...currentFragments, ...sessionFragments]));

                    // Push update
                    await supabase.from('profiles').update({
                        total_runs: (profile.total_runs || 0) + 1,
                        total_deaths: (profile.total_deaths || 0) + 1, // Assumes every run ends in death/completion
                        total_kills: (profile.total_kills || 0) + submission.session_kills,
                        max_xp: Math.max(profile.max_xp || 0, gameState.xp || 0),
                        deepest_dives: currentDives,
                        lifetime_kills: currentLifetimeKills,
                        unlocked_fragments: mergedFragments
                    }).eq('id', user.id);
                }
            })();
        }

        // Store in localStorage for now (will be Supabase later)
        const runHistory = JSON.parse(localStorage.getItem('CyberSynthe_RunHistory') || '[]');
        runHistory.push({
            ...finalScores,
            ...submission,
            timestamp: Date.now()
        });
        localStorage.setItem('CyberSynthe_RunHistory', JSON.stringify(runHistory.slice(-20))); // Keep last 20

        // For hardcore mode, clear save dynamically
        if (gameState.gameMode === 'hardcore') {
            const saveKey = await getSaveKeyLocal();
            localStorage.removeItem(saveKey);
            try {
                if (supabase) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('saves').delete().eq('id', user.id);
                    }
                }
            } catch (e) {
                console.error("Cloud save clear failed:", e);
            }
        }

        // Return to menu (in the future, show post-death summary)
        setTimeout(() => {
            setGameState(prev => ({
                ...prev,
                isInMenu: true,
                // Reset scoring fields
                runStartTime: null,
                floorTimes: [],
                totalDamageTaken: 0,
                mramUsedCount: 0,
                undetectedFloorCount: 0,
                wasDetectedThisFloor: false
            }));
        }, 2000); // 2 second delay to see death
    };

    // No render
    return null;
}
