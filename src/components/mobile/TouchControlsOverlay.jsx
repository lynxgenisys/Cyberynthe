import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

// ============================================================
// !! CRITICAL: DO NOT MOVE BUTTONS UNLESS USER EXPLICITLY ASKS.
// Layout: JUMP/SPIKE/SHRED arranged in a quarter-circle around
// the minimap (bottom-right). OVERCLOCK centered between JUMP
// and QuickSlots. CYBERDECK/INT on left side above joystick.
// Last confirmed by user: 2026-06-04
// ============================================================

const triggerKey = (key, code, type) => {
    const event = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
};

export default function TouchControlsOverlay({ onLookMove }) {
    const swipeAreaRef = useRef(null);
    const { gameState, toggleRunLock } = useGame();

    useEffect(() => {
        if (!swipeAreaRef.current) return;
        const area = swipeAreaRef.current;
        let lastX = 0, lastY = 0, isDragging = false, touchId = null;

        const handleStart = (e) => {
            e.stopPropagation();
            if (isDragging) return;
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            isDragging = true;
            lastX = touch.clientX;
            lastY = touch.clientY;
        };
        const handleMove = (e) => {
            if (!isDragging) return;
            e.stopPropagation();
            let touch = null;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) { touch = e.changedTouches[i]; break; }
            }
            if (!touch) return;
            const deltaX = touch.clientX - lastX;
            const deltaY = touch.clientY - lastY;
            const lookSense = gameState.lookSensitivity || 1.15;
            window.dispatchEvent(new CustomEvent('mobileCameraMove', { detail: { x: deltaX * lookSense, y: deltaY * lookSense } }));
            lastX = touch.clientX;
            lastY = touch.clientY;
        };
        const handleEnd = (e) => {
            if (!isDragging) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) { isDragging = false; touchId = null; break; }
            }
        };

        area.addEventListener('touchstart', handleStart, { passive: false });
        area.addEventListener('touchmove', handleMove, { passive: false });
        area.addEventListener('touchend', handleEnd);
        return () => {
            area.removeEventListener('touchstart', handleStart);
            area.removeEventListener('touchmove', handleMove);
            area.removeEventListener('touchend', handleEnd);
        };
    }, [onLookMove]);

    // ──────────────────────────────────────────────────────────
    // QUARTER-CIRCLE LAYOUT around minimap (bottom-right corner)
    // Minimap: ~240px wide, sits at right-4 bottom-4 (16px)
    // Buttons: w-20 h-20 (80px). Radius ~180px from map corner.
    //
    //  [JUMP]          ← 12 o'clock position: directly above map
    //                     right-[16px + 80px] = right-24 (96px from edge, centre of btn)
    //                     bottom = minimap height + gap = 240+16+16 = ~[17rem]
    //
    //  [SPIKE]         ← ~10 o'clock: above-left of map
    //                     right-[17rem], bottom-[12rem]
    //
    //  [SHRED]         ← 9 o'clock: directly left of map
    //                     right-[17rem], bottom-[3rem] (same height as map bottom)
    //
    //  [OVERCLOCK]     ← centred between JUMP and quickslots
    //                     bottom-[17rem] centred horizontally by left-[50%]... 
    //                     actually place it bottom-[17rem] right-[22rem]
    // ──────────────────────────────────────────────────────────

    const btnClass = "absolute w-20 h-20 rounded-full font-bold pointer-events-auto text-sm flex items-center justify-center select-none";

    return (
        <div className="absolute inset-0 z-[90] pointer-events-none">
            {/* Right side: Swipe to look */}
            <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto touch-none bg-transparent" ref={swipeAreaRef} />

            {/* ── QUARTER-CIRCLE COMBAT BUTTONS (around minimap) ── */}

            {/* JUMP — swapped to SHRED's old moved position (bottom row, far right) */}
            <button
                className={`${btnClass} bottom-[4rem] right-[21rem] bg-white/10 border-2 border-white/60 text-white active:bg-white/40`}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileJump')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey(' ', 'Space', 'keyup'); }}
            >
                JUMP
            </button>

            {/* SPIKE — moved up by own height (5rem) and left by own width (5rem) */}
            <button
                className={`${btnClass} bottom-[17rem] right-[13rem] bg-cyan/20 border-2 border-cyan text-cyan shadow-[0_0_15px_#00FFFF] active:bg-cyan/50`}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireEnd')); }}
            >
                SPIKE
            </button>

            {/* SHRED — moved left by own width, then swapped with JUMP → now at JUMP's old spot */}
            <button
                className={`${btnClass} bottom-[17rem] right-6 bg-[#FF00FF]/20 border-2 border-[#FF00FF] text-[#FF00FF] shadow-[0_0_15px_#FF00FF] active:bg-[#FF00FF]/50`}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredEnd')); }}
            >
                SHRED
            </button>

            {/* OVERCLOCK SLIDER — bottom row, between QuickSlot 1 and JUMP button */}
            <div
                className="absolute bottom-4 right-[11rem] pointer-events-auto cursor-pointer touch-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}
                onClick={(e) => { e.preventDefault(); toggleRunLock(); }}
            >
                <div className={`flex items-center gap-2 px-3 py-2 border font-mono transition-all ${gameState.isRunLocked ? 'border-[#FF00FF] shadow-[0_0_15px_#FF00FF]' : 'border-cyan shadow-[0_0_10px_#00FFFF]'} bg-black/80`}>
                    <span className={`text-xs ${gameState.isRunLocked ? 'text-orange-500 font-bold animate-pulse' : 'text-cyan'}`}>
                        OVERCLOCK
                    </span>
                    <div className={`w-12 h-6 border ${gameState.isRunLocked ? 'border-[#FF00FF] bg-[#FF00FF]/20' : 'border-cyan bg-cyan/20'} relative transition-colors`}>
                        <div className={`absolute top-0 w-6 h-full transition-all duration-200 ${gameState.isRunLocked ? 'right-0 bg-orange-500 shadow-[0_0_10px_#f97316]' : 'left-0 bg-cyan'}`} />
                    </div>
                </div>
            </div>

            {/* ── LEFT SIDE BUTTONS ── */}

            {/* INTERACT (F) — above joystick */}
            <button
                className="absolute bottom-64 left-24 w-16 h-16 rounded-full border-2 border-green-500 text-green-500 bg-green-500/20 active:bg-green-500 active:text-black font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#22C55E] pointer-events-auto select-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keyup'); }}
            >
                INT
            </button>

            {/* CYBERDECK — same size as quickslots (96px octagon), between joystick and QuickSlots */}
            <button
                className="absolute bottom-4 left-[30%] -translate-x-1/2 pointer-events-auto select-none"
                onTouchStart={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    triggerKey('i', 'KeyI', 'keydown');
                    window.dispatchEvent(new CustomEvent('mobileToggleDeck'));
                }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('i', 'KeyI', 'keyup'); }}
                style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    width: '96px',
                    height: '96px',
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: 'none',
                    outline: '2px solid #00FFFF',
                    outlineOffset: '-4px',
                    color: '#00FFFF',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 12px #00FFFF80',
                    letterSpacing: '0.05em',
                }}
            >
                DECK
            </button>
        </div>
    );
}
