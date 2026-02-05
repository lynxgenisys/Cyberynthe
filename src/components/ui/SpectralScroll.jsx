import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * MECHANIC: The Spectral Scroll (Loot Decryption)
 * LOGIC: 4 Rollers with increasing speeds. Stop them on Target numbers.
 * RATIO: R1=1x, R2=1.5x, R3=2.0x, R4=3.0x (Glitch)
 */

export default function SpectralScroll() {
    const { gameState, completeDecryption } = useGame();
    const { damageKernel } = usePlayer();

    useEffect(() => {
        console.log("[SpectralScroll] MOUNTED");
        return () => console.log("[SpectralScroll] UNMOUNTED");
    }, []);

    // Config: Speed Ratio based on Sector (Floor 1-25 scaling)
    const baseSpeed = 50; // ms per frame (lower is faster)
    // Actually, setInterval duration.
    // 50ms = 20fps.
    // We want visually distinct speeds.

    // Target Code (Random 4 digits)
    const [targets] = useState(() => [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ]);

    const [rollerState, setRollerState] = useState([
        { current: 0, isLocked: false, speedMult: 1.0 },
        { current: 0, isLocked: false, speedMult: 1.5 },
        { current: 0, isLocked: false, speedMult: 2.0 },
        { current: 0, isLocked: false, speedMult: 3.0 } // Glitch Roller
    ]);

    const [msg, setMsg] = useState("DECRYPTING...");
    const [msgColor, setMsgColor] = useState("text-cyan");

    const activeRollerRef = useRef(0); // Which roller controls input focus? (Assume simultaneous or sequential? Spec says "Click each... or press 1,2,3,4")
    // Let's allow ANY order, pressing 1,2,3,4 locks relevant roller.

    // Sounds (Placeholder for now)
    const playTick = () => { /* TODO: Audio */ };
    const playLock = () => { /* TODO: Audio */ };

    // Ref to track intervals to ensure cleanup works even if re-renders happen quickly
    const intervalRefs = useRef([]);

    // --- ROLLER ANIMATION LOOP ---
    useEffect(() => {
        // Clear any existing
        intervalRefs.current.forEach(i => clearInterval(i));
        intervalRefs.current = [];

        const newIntervals = rollerState.map((r, i) => {
            if (r.isLocked) return null;

            // Speed: 2x Faster than previous slow setting.
            // Previous: 800 - (mult*100) -> [500ms..700ms]
            // New: 400 - (mult*50) -> [250ms..350ms]
            const speed = Math.max(100, 400 - (r.speedMult * 50));

            return setInterval(() => {
                setRollerState(prev => {
                    const next = [...prev];
                    if (!next[i].isLocked) {
                        next[i].current = (next[i].current + 1) % 10;
                    }
                    return next;
                });
            }, speed);
        });

        intervalRefs.current = newIntervals;

        return () => {
            intervalRefs.current.forEach(i => i && clearInterval(i));
        };
    }, [rollerState.map(r => r.isLocked).join(',')]); // Depend ONLY on lock state changing

    const [isFinished, setIsFinished] = useState(false);
    const [finalOutcome, setFinalOutcome] = useState(null);

    // --- INPUT HANDLER ---
    useEffect(() => {
        const handleKey = (e) => {
            // "Action Button" (Q) or "Confirm" (Space/Enter)
            if (['KeyQ', 'Space', 'Enter'].includes(e.code) || ['q', ' '].includes(e.key)) {
                e.preventDefault();

                // 1. If FINISHED (Result shown), Close.
                if (isFinished) {
                    if (finalOutcome) completeDecryption(finalOutcome);
                    return;
                }

                // 2. Scan for next unlock
                const nextIdx = rollerState.findIndex(r => !r.isLocked);

                if (nextIdx !== -1) {
                    // Lock the next roller
                    lockRoller(nextIdx);

                    // If this was the LAST roller (index 3), schedule Auto-Eval
                    if (nextIdx === 3) {
                        console.log("[SpectralScroll] Last Roller Locked. scheduling auto-eval...");

                        // ABSOLUTE SAFETY: Construct the future state NOW and pass it.
                        // This avoids closure staleness issues.
                        const predictedState = rollerState.map((r, i) =>
                            i === nextIdx ? { ...r, isLocked: true } : r
                        );

                        setTimeout(() => {
                            evaluateResult(predictedState);
                        }, 500);
                    }
                } else {
                    // 3. All Locked (Manual 5th press)
                    console.log("[SpectralScroll] Manual 5th Press Eval");
                    evaluateResult(rollerState);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [rollerState, isFinished, finalOutcome]);

    const lockRoller = (idx) => {
        setRollerState(prev => {
            if (prev[idx].isLocked) return prev; // Already locked
            const next = [...prev];
            next[idx].isLocked = true;
            return next;
        });
        playLock();
    };

    // --- COMPLETION CHECK REMOVED (Handled in lockRoller) ---

    const evaluateResult = (finalState) => {
        if (isFinished) return; // Prevent double-submit
        setIsFinished(true);

        try {
            let exactMatches = 0;
            let slightMisses = 0;
            let totalMisses = 0;
            let outcome = "";
            let currentMsg = "PROCESSING..."; // Declare currentMsg here

            finalState.forEach((r, i) => {
                const diff = Math.abs(r.current - targets[i]);
                const dist = Math.min(diff, 10 - diff); // Wrap around distance (0 vs 9 is 1)

                if (dist === 0) exactMatches++;
                else if (dist === 1) slightMisses++;
                else totalMisses++;
            });

            if (totalMisses === 4) {
                // FATAL_ERROR
                currentMsg = "FATAL_ERROR // CACHE_PURGED";
                setMsg(currentMsg);
                setMsgColor("text-red-600");
                outcome = "FATAL_ERROR";
                damageKernel(30);
            } else if (totalMisses > 0) {
                // LOGIC_BREACH
                currentMsg = "LOGIC_BREACH // SECURITY_ALERT";
                setMsg(currentMsg);
                setMsgColor("text-magenta");
                outcome = "LOGIC_BREACH";
                damageKernel(15);
            } else if (exactMatches === 4) {
                // CRITICAL_SYNC
                currentMsg = "CRITICAL_SYNC // BUFFER_OVERCLOCK";
                setMsg(currentMsg);
                setMsgColor("text-cyan-400 drop-shadow-[0_0_10px_cyan]");
                outcome = "CRITICAL_SYNC";
            } else {
                // STABLE_HANDSHAKE
                currentMsg = "STABLE_HANDSHAKE // DECRYPTION_VALID";
                setMsg(currentMsg);
                setMsgColor("text-green-400");
                outcome = "STABLE_HANDSHAKE";
            }
            setFinalOutcome(outcome);

            // AUTO-CLOSE SEQUENCE
            setTimeout(() => {
                completeDecryption(outcome);
            }, 1200);

        } catch (err) {
            console.error("[SpectralScroll] Evaluation Crash:", err);
            setMsg("SYSTEM_ERROR // FORCED_DISCONNECT");
            setMsgColor("text-red-500");
            setIsFinished(true); // Ensure isFinished is true even on error
            setFinalOutcome("STABLE_HANDSHAKE"); // Fallback to allow exit
            setTimeout(() => completeDecryption("STABLE_HANDSHAKE"), 1000);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-auto">
            <div className="flex flex-col items-center w-[600px] border-y-2 border-cyan/50 bg-gray-900/80 p-8 shadow-[0_0_50px_rgba(0,255,255,0.2)]">

                {/* HEADER / LCD */}
                <div className="w-full bg-black border border-gray-700 p-4 mb-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-10 pointer-events-none"></div>
                    <h2 className={`font-mono text-2xl tracking-widest ${msgColor} animate-pulse`}>
                        [{msg}]
                    </h2>
                </div>

                {/* ROLLERS CONTAINER */}
                <div className="relative flex justify-center gap-6 p-4 pt-12">

                    {/* SYNC LINE */}
                    <div className="absolute top-[60%] left-0 w-full h-[2px] bg-red-900/50 shadow-[0_0_10px_red] z-20 pointer-events-none"></div>

                    {rollerState.map((r, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">

                            {/* TARGET NUMBER (Cyan, Big) */}
                            <div className="text-4xl font-bold text-cyan drop-shadow-[0_0_10px_cyan] font-mono mb-2">
                                {targets[i]}
                            </div>

                            {/* ROLLER (Red LED Flip Clock Style) */}
                            <div
                                onClick={() => !isFinished && lockRoller(i)}
                                className={`
                                    relative w-24 h-36 bg-black
                                    border-4 ${r.isLocked ? (Math.min(Math.abs(r.current - targets[i]), 10 - Math.abs(r.current - targets[i])) === 0 ? 'border-cyan shadow-[0_0_20px_cyan]' : 'border-red-900') : 'border-gray-800'}
                                    rounded-lg
                                    flex flex-col items-center justify-center overflow-hidden cursor-pointer
                                    hover:border-gray-600 transition-colors
                                    box-border shadow-[inset_0_0_20px_rgba(0,0,0,1)]
                                `}
                            >
                                {/* Glass/Plastic Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 pointer-events-none z-20"></div>

                                {/* Number (Red LED) */}
                                <span className={`
                                    font-mono text-7xl font-bold z-10 tracking-tighter
                                    text-red-600 drop-shadow-[0_0_15px_red]
                                    ${!r.isLocked && 'blur-[1px]'}
                                `}>
                                    {r.current}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

                {/* EMERGENCY CLOSE BUTTON (Mouse Override) */}
                <button
                    onClick={() => completeDecryption(finalOutcome || "FORCE_QUIT")}
                    className="absolute top-2 right-2 text-red-500 hover:text-white font-mono text-xs border border-red-500 px-2 py-1 z-[100] hover:bg-red-900 transition-colors"
                >
                    [X] FORCE_CLOSE
                </button>

                {/* INSTRUCTIONS */}
                <div className="mt-8 text-xs font-mono text-gray-400 text-center">
                    {!isFinished ? (
                        <>
                            <p>MATCH THE TARGETS</p>
                            <p className="mt-1 text-cyan-dim">PRESS [Q] to STOP</p>
                        </>
                    ) : (
                        <p className="mt-1 text-cyan font-bold animate-pulse">DISPENSING REWARD...</p>
                    )}
                </div>

            </div>
        </div>
    );
}
