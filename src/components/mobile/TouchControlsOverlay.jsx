import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

// ============================================================
// !! CRITICAL: DO NOT MOVE BUTTONS UNLESS USER EXPLICITLY ASKS.
// Layout approved by user. Positions are intentional.
// Last confirmed working: commit abbc4d4
// ============================================================

const triggerKey = (key, code, type) => {
    const event = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
};

const triggerMouse = (button, type) => {
    const event = new MouseEvent(type, { button, bubbles: true, cancelable: true, clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
};

export default function TouchControlsOverlay({ onLookMove }) {
    const swipeAreaRef = useRef(null);
    const { gameState, toggleRunLock } = useGame();

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

    return (
        <div className="absolute inset-0 z-[90] pointer-events-none">
            {/* Right side: Swipe to look */}
            <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto touch-none bg-transparent" ref={swipeAreaRef} />

            {/* DATA SPIKE (Left Click) - Left of MiniMap */}
            <button
                className="absolute bottom-32 right-[18rem] w-20 h-20 rounded-full bg-cyan/20 border-2 border-cyan text-cyan font-bold shadow-[0_0_15px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireEnd')); }}
            >
                SPIKE
            </button>

            {/* SHRED (Right Click) - Left of MiniMap, below Data Spike */}
            <button
                className="absolute bottom-8 right-[18rem] w-20 h-20 rounded-full bg-[#FF00FF]/20 border-2 border-[#FF00FF] text-[#FF00FF] font-bold shadow-[0_0_15px_#FF00FF] active:bg-[#FF00FF]/60 active:text-black pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredEnd')); }}
            >
                SHRED
            </button>

            {/* JUMP (Space) - Above MiniMap */}
            <button
                className="absolute bottom-[18rem] right-12 w-20 h-20 rounded-full bg-white/10 border-2 border-white/50 text-white font-bold active:bg-white active:text-black pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileJump')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey(' ', 'Space', 'keyup'); }}
            >
                JUMP
            </button>

            {/* INTERACT (F) - Above Joystick */}
            <button
                className="absolute bottom-64 left-24 w-16 h-16 rounded-full border-2 border-green-500 text-green-500 bg-green-500/20 active:bg-green-500 active:text-black font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#22C55E] pointer-events-auto"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keyup'); }}
            >
                INT
            </button>

            {/* CYBERDECK (Inventory) - Between Joystick and QuickSlots */}
            {/* Fires both 'i' keydown AND mobileToggleDeck custom event so App.jsx catches it */}
            <button
                className="absolute bottom-16 left-[30%] -translate-x-1/2 p-3 border border-cyan text-cyan bg-black/80 font-mono shadow-[0_0_10px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-xs"
                onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKey('i', 'KeyI', 'keydown');
                    window.dispatchEvent(new CustomEvent('mobileToggleDeck'));
                }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('i', 'KeyI', 'keyup'); }}
            >
                CYBERDECK
            </button>

            {/* OVERCLOCK (Run Toggle Slider) - Centered between JUMP and QuickSlots */}
            {/* Cyan = off, orange/magenta pulse = on. DO NOT MOVE THIS. */}
            <div
                className="absolute bottom-[9rem] right-[9rem] pointer-events-auto cursor-pointer touch-none"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}
                onClick={(e) => { e.preventDefault(); toggleRunLock(); }}
            >
                <div className={`flex items-center gap-2 p-2 border ${gameState.isRunLocked ? 'border-[#FF00FF] shadow-[0_0_15px_#FF00FF]' : 'border-cyan shadow-[0_0_10px_#00FFFF]'} bg-black/80 font-mono transition-colors`}>
                    <span className={gameState.isRunLocked ? 'text-orange-500 font-bold animate-pulse text-xs' : 'text-cyan text-xs'}>
                        OVERCLOCK
                    </span>
                    <div className={`w-12 h-6 border ${gameState.isRunLocked ? 'border-[#FF00FF] bg-[#FF00FF]/20' : 'border-cyan bg-cyan/20'} relative transition-colors`}>
                        <div className={`absolute top-0 w-6 h-full transition-all duration-200 ${gameState.isRunLocked ? 'right-0 bg-orange-500 shadow-[0_0_10px_#f97316]' : 'left-0 bg-cyan'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
