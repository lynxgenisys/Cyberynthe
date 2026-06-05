import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

const triggerKey = (key, code, type) => {
    const event = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
};

export default function TouchControlsOverlay({ onLookMove }) {
    const swipeAreaRef = useRef(null);
    const { gameState, toggleRunLock } = useGame();

    // Camera look - right half swipe area
    useEffect(() => {
        if (!swipeAreaRef.current) return;
        const area = swipeAreaRef.current;
        let lastX = 0;
        let lastY = 0;
        let isDragging = false;
        let touchId = null;

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
                if (e.changedTouches[i].identifier === touchId) {
                    touch = e.changedTouches[i];
                    break;
                }
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
                if (e.changedTouches[i].identifier === touchId) {
                    isDragging = false;
                    touchId = null;
                    break;
                }
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

    const isRunLocked = gameState.isRunLocked;

    return (
        <div className="absolute inset-0 z-[90] pointer-events-none">

            {/* Right side: swipe to look */}
            <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto touch-none bg-transparent" ref={swipeAreaRef} />

            {/* ══════════════════════════════════════════
                RIGHT SIDE COMBAT BUTTONS
                Layout (bottom-right corner, above minimap):
                  [SHRED]
                  [SPIKE]  [JUMP]
                Positions use bottom/right pixel offsets.
            ══════════════════════════════════════════ */}

            {/* JUMP - bottom right, directly above minimap */}
            <button
                className="absolute bottom-8 right-8 w-20 h-20 rounded-full bg-white/10 border-2 border-white/60 text-white font-bold active:bg-white/40 pointer-events-auto text-sm select-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileJump')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                JUMP
            </button>

            {/* DATA SPIKE - to the left of JUMP */}
            <button
                className="absolute bottom-8 right-32 w-20 h-20 rounded-full bg-cyan/20 border-2 border-cyan text-cyan font-bold shadow-[0_0_15px_#00FFFF] active:bg-cyan/50 pointer-events-auto text-xs select-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireEnd')); }}
            >
                SPIKE
            </button>

            {/* SHRED - above SPIKE */}
            <button
                className="absolute bottom-32 right-32 w-16 h-16 rounded-full bg-[#EA00FF]/20 border-2 border-[#EA00FF] text-[#EA00FF] font-bold active:bg-[#EA00FF]/50 shadow-[0_0_15px_#EA00FF] pointer-events-auto text-xs select-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredEnd')); }}
            >
                SHRED
            </button>

            {/* ══════════════════════════════════════════
                LEFT SIDE UTILITY BUTTONS
                Above the joystick area
            ══════════════════════════════════════════ */}

            {/* INTERACT (F) - above joystick, left side */}
            <button
                className="absolute bottom-44 left-8 w-16 h-16 rounded-full border-2 border-green-400 text-green-400 bg-green-400/10 active:bg-green-400/40 font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#4ade80] pointer-events-auto select-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keyup'); }}
            >
                ACT
            </button>

            {/* CYBERDECK (I key) - above ACT */}
            <button
                className="absolute bottom-64 left-8 w-16 h-16 rounded-full border-2 border-cyan text-cyan bg-cyan/10 active:bg-cyan/40 font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#00FFFF] pointer-events-auto select-none"
                onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKey('i', 'KeyI', 'keydown');
                    window.dispatchEvent(new CustomEvent('mobileToggleDeck'));
                }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('i', 'KeyI', 'keyup'); }}
            >
                DECK
            </button>

            {/* ══════════════════════════════════════════
                OVERCLOCK TOGGLE — sliding indicator
                Positioned top-left, out of the way
            ══════════════════════════════════════════ */}
            <button
                className={`absolute top-4 left-4 pointer-events-auto select-none flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all ${
                    isRunLocked
                        ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10 shadow-[0_0_12px_#facc15]'
                        : 'border-gray-600 text-gray-400 bg-black/60'
                }`}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}
                onClick={(e) => { e.preventDefault(); toggleRunLock(); }}
            >
                {/* Sliding track indicator */}
                <div className="w-10 h-4 bg-gray-800 rounded-full relative border border-gray-600 overflow-hidden">
                    <div
                        className={`absolute top-0.5 h-3 w-4 rounded-full transition-all duration-200 ${
                            isRunLocked ? 'left-[calc(100%-1.25rem)] bg-yellow-400 shadow-[0_0_6px_#facc15]' : 'left-0.5 bg-gray-500'
                        }`}
                    />
                </div>
                <span className="uppercase tracking-widest text-[9px] font-bold">OVERCLOCK</span>
            </button>

        </div>
    );
}
