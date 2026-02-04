import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import { calculateVelocityScore, calculateStabilityScore, calculateGhostScore } from '../../utils/scoring';
import { submitScore } from '../../utils/supabase';

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

    // Initialize prevHp on first render
    useEffect(() => {
        if (prevHpRef.current === null) {
            prevHpRef.current = playerState.stats.currentIntegrity;
        }
    }, []);

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
                ? calculateGhostScore(gameState.floorLevel, Date.now() - gameState.runStartTime)
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
            score: calculatedScore,
            floor_reached: gameState.floorLevel,
            run_time: Math.floor((Date.now() - gameState.runStartTime) / 1000), // Seconds
            game_mode: gameState.gameMode,

            // NEW METRICS (Leaderboard 2.0)
            damage_taken: gameState.totalDamageTaken || 0,
            mram_used: gameState.mramUsedCount || 0,
            undetected_floors: finalScores.undetectedStreak || 0,
            resonance: finalScores.resonanceFinal || 0.5,
            ghost_score: finalScores.ghostScore || 0,
            stability_score: finalScores.stabilityScore || 0,

            // Legacy JSON (Keep for debug/safety)
            platform_data: {
                velocity: finalScores.velocityScore,
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

        // Store in localStorage for now (will be Supabase later)
        const runHistory = JSON.parse(localStorage.getItem('CyberSynthe_RunHistory') || '[]');
        runHistory.push({
            ...finalScores,
            ...submission,
            timestamp: Date.now()
        });
        localStorage.setItem('CyberSynthe_RunHistory', JSON.stringify(runHistory.slice(-20))); // Keep last 20

        // For hardcore mode, clear save
        if (gameState.gameMode === 'hardcore') {
            localStorage.removeItem('CyberSynthe_Save');
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
