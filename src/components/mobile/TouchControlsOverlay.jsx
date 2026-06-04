import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

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
            e.stopPropagation(); // Prevent global mousedown (accidental shoot)
            if (isDragging) return;
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            isDragging = true;
            lastX = touch.clientX;
            lastY = touch.clientY;
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            e.stopPropagation(); // Prevent global mousemove
            
            let touch = null;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touch = e.changedTouches[i];
                    break;
                }
            }
            if (!touch) return;

            const currentX = touch.clientX;
            const currentY = touch.clientY;
            
            const deltaX = currentX - lastX;
            const deltaY = currentY - lastY;
            
            const lookSense = gameState.lookSensitivity || 1.15;
            window.dispatchEvent(new CustomEvent('mobileCameraMove', { detail: { x: deltaX * lookSense, y: deltaY * lookSense } }));

            lastX = currentX;
            lastY = currentY;
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
        <div className="absolute inset-0 z-[90] pointer-events-none flex">
            {/* Left side: Empty (for joystick) */}
            <div className="w-1/2 h-full pointer-events-none bg-transparent" />
            
            {/* Right side: Swipe to look + Action Buttons */}
            <div className="w-1/2 h-full pointer-events-auto touch-none bg-transparent relative" ref={swipeAreaRef}>
                
                {/* FIRE (Left Click) */}
                <button 
                    className="absolute bottom-[12.66rem] right-[14.66rem] w-24 h-24 rounded-full bg-cyan/20 border-2 border-cyan text-cyan font-bold tracking-widest shadow-[0_0_15px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-sm"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerMouse(0, 'mousedown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerMouse(0, 'mouseup'); }}
                >
                    FIRE
                </button>

                {/* SHRED (Right Click) */}
                <button 
                    className="absolute bottom-[17.33rem] right-[1.33rem] w-20 h-20 rounded-full bg-magenta/20 border-2 border-magenta text-magenta font-bold shadow-[0_0_15px_#FF00FF] active:bg-magenta active:text-black pointer-events-auto text-xs"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerMouse(2, 'mousedown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerMouse(2, 'mouseup'); }}
                >
                    SHRED
                </button>

                {/* PING (E) */}
                <button 
                    className="absolute bottom-[22rem] right-[14.66rem] w-20 h-20 rounded-full bg-cyan/10 border-2 border-cyan/50 text-cyan font-bold active:bg-cyan active:text-black pointer-events-auto text-xs"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('e', 'KeyE', 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('e', 'KeyE', 'keyup'); }}
                >
                    PING
                </button>

                {/* JUMP (Space) */}
                <button 
                    className="absolute bottom-12 right-[24rem] w-24 h-24 rounded-full bg-white/10 border-2 border-white/50 text-white font-bold active:bg-white active:text-black pointer-events-auto text-sm"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey(' ', 'Space', 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey(' ', 'Space', 'keyup'); }}
                >
                    JUMP
                </button>

            </div>

            {/* Interact (Above Joystick) */}
            <div className="absolute bottom-16 left-64 flex gap-8 pointer-events-auto">
                {/* INTERACT (F) */}
                <button 
                    className="w-14 h-14 rounded-full border-2 border-green-500 text-green-500 bg-green-500/20 active:bg-green-500 active:text-black font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#22C55E]"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keyup'); }}
                >
                    INT
                </button>
            </div>
            
            {/* Inventory */}
            <div className="absolute bottom-24 right-1/2 mr-24 pointer-events-auto">
                <button 
                    className="p-3 border border-cyan text-cyan bg-black/80 font-mono shadow-[0_0_10px_#00FFFF] active:bg-cyan active:text-black"
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('i', 'KeyI', 'keydown'); }}
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('i', 'KeyI', 'keyup'); }}
                >
                    CYBERDECK
                </button>
            </div>

            {/* Overclock (Run) Slider - To the right of quick items */}
            <div className="absolute bottom-24 left-1/2 ml-24 pointer-events-auto cursor-pointer touch-none"
                 onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}>
                <div className={`flex items-center gap-2 p-2 border ${gameState.isRunLocked ? 'border-magenta shadow-[0_0_15px_#FF00FF]' : 'border-cyan shadow-[0_0_10px_#00FFFF]'} bg-black/80 font-mono transition-colors`}>
                    <span className={gameState.isRunLocked ? 'text-orange-500 font-bold animate-pulse' : 'text-cyan'}>
                        OVERCLOCK
                    </span>
                    <div className={`w-12 h-6 border ${gameState.isRunLocked ? 'border-magenta bg-magenta/20' : 'border-cyan bg-cyan/20'} relative transition-colors`}>
                        <div className={`absolute top-0 w-6 h-full transition-all duration-200 ${gameState.isRunLocked ? 'right-0 bg-orange-500' : 'left-0 bg-cyan'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
