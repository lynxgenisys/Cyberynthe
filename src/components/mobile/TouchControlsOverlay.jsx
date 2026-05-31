import React, { useEffect, useRef, useState } from 'react';

const triggerKey = (key, code, type) => {
    document.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true }));
};

const triggerMouse = (button, type) => {
    window.dispatchEvent(new MouseEvent(type, { button, bubbles: true, cancelable: true }));
};

export default function TouchControlsOverlay({ onLookMove }) {
    const swipeAreaRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!swipeAreaRef.current) return;
        const area = swipeAreaRef.current;
        let lastX = 0;
        let lastY = 0;
        let isDragging = false;

        const handleStart = (e) => {
            isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const deltaX = currentX - lastX;
            const deltaY = currentY - lastY;
            
            window.dispatchEvent(new CustomEvent('mobileCameraMove', { detail: { x: deltaX, y: deltaY } }));

            lastX = currentX;
            lastY = currentY;
        };

        const handleEnd = () => {
            isDragging = false;
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
            <div className="w-1/2 h-full pointer-events-auto touch-none bg-transparent" />
            
            {/* Right side: Swipe to look + Action Buttons */}
            <div className="w-1/2 h-full pointer-events-auto touch-none bg-transparent relative" ref={swipeAreaRef}>
                
                {/* FIRE (Left Click) */}
                <button 
                    className="absolute top-28 right-4 w-20 h-20 rounded-full bg-cyan/20 border-2 border-cyan text-cyan font-bold tracking-widest shadow-[0_0_15px_#00FFFF] active:bg-cyan active:text-black pointer-events-auto text-sm"
                    onPointerDown={(e) => { e.stopPropagation(); triggerMouse(0, 'mousedown'); }}
                    onPointerUp={(e) => { e.stopPropagation(); triggerMouse(0, 'mouseup'); }}
                >
                    FIRE
                </button>

                {/* SHRED (Right Click) */}
                <button 
                    className="absolute top-28 right-28 w-16 h-16 rounded-full bg-magenta/20 border-2 border-magenta text-magenta font-bold shadow-[0_0_15px_#FF00FF] active:bg-magenta active:text-black pointer-events-auto text-xs"
                    onPointerDown={(e) => { e.stopPropagation(); triggerMouse(2, 'mousedown'); }}
                    onPointerUp={(e) => { e.stopPropagation(); triggerMouse(2, 'mouseup'); }}
                >
                    SHRED
                </button>

                {/* JUMP (Space) */}
                <button 
                    className="absolute top-52 right-4 w-16 h-16 rounded-full bg-white/10 border-2 border-white/50 text-white font-bold active:bg-white active:text-black pointer-events-auto text-xs"
                    onPointerDown={(e) => { e.stopPropagation(); triggerKey(' ', 'Space', 'keydown'); }}
                    onPointerUp={(e) => { e.stopPropagation(); triggerKey(' ', 'Space', 'keyup'); }}
                >
                    JUMP
                </button>

            </div>

            {/* Utility Toggles (Center/Top) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                {/* SCAN (E) */}
                <button 
                    className="px-6 py-3 border border-yellow-500 text-yellow-500 bg-yellow-500/20 rounded active:bg-yellow-500 active:text-black font-mono text-sm"
                    onPointerDown={(e) => triggerKey('e', 'KeyE', 'keydown')}
                    onPointerUp={(e) => triggerKey('e', 'KeyE', 'keyup')}
                >
                    [E] SCAN
                </button>
                {/* INTERACT (F) */}
                <button 
                    className="px-6 py-3 border border-green-500 text-green-500 bg-green-500/20 rounded active:bg-green-500 active:text-black font-mono text-sm"
                    onPointerDown={(e) => triggerKey('f', 'KeyF', 'keydown')}
                    onPointerUp={(e) => triggerKey('f', 'KeyF', 'keyup')}
                >
                    [F] INTERACT
                </button>
            </div>

            {/* Run Lock */}
            <div className="absolute top-1/2 left-4 pointer-events-auto">
                <button 
                    className={`w-12 h-12 rounded-full border border-purple-500 font-bold text-xs ${isRunning ? 'bg-purple-500 text-black shadow-[0_0_10px_#A855F7]' : 'text-purple-500 bg-purple-500/20'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isRunning) {
                            triggerKey('r', 'KeyR', 'keyup');
                            setIsRunning(false);
                        } else {
                            triggerKey('r', 'KeyR', 'keydown');
                            setIsRunning(true);
                        }
                    }}
                >
                    RUN
                </button>
            </div>
            
            {/* Inventory */}
            <div className="absolute top-4 right-4 pointer-events-auto">
                <button 
                    className="p-3 border border-cyan text-cyan bg-black/80 font-mono shadow-[0_0_10px_#00FFFF]"
                    onPointerDown={(e) => triggerKey('i', 'KeyI', 'keydown')}
                    onPointerUp={(e) => triggerKey('i', 'KeyI', 'keyup')}
                >
                    [ CYBERDECK ]
                </button>
            </div>
        </div>
    );
}
