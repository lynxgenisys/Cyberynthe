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
        <div className="absolute inset-0 z-[90] pointer-events-none">
            {/* Right side: Swipe to look */}
            <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto touch-none bg-transparent" ref={swipeAreaRef} />
                
            {/* ACTION BUTTONS */}
            
            {/* DATA SPIKE (Left Click) - Left of MiniMap */}
            <button 
                className="absolute bottom-32 right-[18rem] w-20 h-20 rounded-full bg-cyan/20 border-2 border-cyan text-cyan font-bold shadow-[0_0_15px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileFireEnd')); }}
            >
                SPIKE
            </button>

            {/* SHRED (Right Click) - Above SPIKE */}
            <button 
                className="absolute bottom-[16rem] right-[8rem] w-16 h-16 rounded-full bg-magenta/20 border-2 border-magenta text-magenta font-bold active:bg-magenta active:text-black shadow-[0_0_15px_#EA00FF] pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredStart')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileShredEnd')); }}
            >
                SHRED
            </button>

            {/* PING (Scan) - Above SHRED */}
            <button 
                className="absolute bottom-[22rem] right-[4rem] w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 font-bold active:bg-yellow-500 active:text-black shadow-[0_0_15px_#EAB308] pointer-events-auto text-xs"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobilePing')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('e', 'KeyE', 'keyup'); }}
            >
                PING
            </button>

            {/* JUMP (Space) - Between Joystick and Jump */}
            <button 
                className="absolute bottom-[6rem] right-[18rem] w-16 h-16 rounded-full bg-white/10 border-2 border-white/50 text-white font-bold active:bg-white active:text-black pointer-events-auto text-[10px]"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileJump')); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey(' ', 'Space', 'keyup'); }}
            >
                JUMP
            </button>

            {/* INTERACT (F) - Above Joystick */}
            <button 
                className="absolute bottom-64 left-16 w-16 h-16 rounded-full border-2 border-green-500 text-green-500 bg-green-500/20 active:bg-green-500 active:text-black font-mono text-xs font-bold flex items-center justify-center shadow-[0_0_10px_#22C55E] pointer-events-auto"
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keydown'); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); triggerKey('f', 'KeyF', 'keyup'); }}
            >
                INT
            </button>
            
            {/* CYBERDECK (Inventory) - Top Center Right */}
            <button 
                className="absolute top-8 right-[25%] p-3 border border-cyan text-cyan bg-black/80 font-mono shadow-[0_0_10px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-xs"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileToggleDeck')); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('mobileToggleDeck')); }}
            >
                CYBERDECK
            </button>

            {/* Overclock (Run) Slider - Top center left */}
            <button className="absolute top-8 left-[25%] p-3 border border-yellow-500 text-yellow-500 bg-black/80 font-mono shadow-[0_0_10px_#EAB308] active:bg-yellow-500 active:text-black pointer-events-auto text-xs cursor-pointer"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}
                 onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); toggleRunLock(); }}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">OVERCLOCK</span>
                    <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${gameState.runLock ? 'bg-yellow-500 w-full' : 'w-0'}`}></div>
                    </div>
                </div>
            </button>
        </div>
    );
}
