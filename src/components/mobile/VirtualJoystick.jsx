import React, { useState, useEffect, useRef } from 'react';

// Dispatches a KeyboardEvent manually to fake physical keypresses
const triggerKey = (key, code, type) => {
    document.dispatchEvent(new KeyboardEvent(type, {
        key: key,
        code: code,
        bubbles: true,
        cancelable: true
    }));
};

export default function VirtualJoystick() {
    const containerRef = useRef(null);
    const stickRef = useRef(null);

    const [active, setActive] = useState(false);
    const keysStateRef = useRef({ w: false, a: false, s: false, d: false });

    const touchIdRef = useRef(null);

    // Handle touch/mouse move
    const handleMove = (e) => {
        if (!active || !containerRef.current) return;

        let clientX, clientY;
        if (e.changedTouches) {
            let touch = null;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchIdRef.current) {
                    touch = e.changedTouches[i];
                    break;
                }
            }
            if (!touch) return; // Not our touch
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const maxRadius = rect.width / 2;
        
        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Clamp stick to boundary
        if (distance > maxRadius) {
            dx = (dx / distance) * maxRadius;
            dy = (dy / distance) * maxRadius;
        }

        if (stickRef.current) {
            stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        }

        // Determine digital outputs (WASD) based on angle/distance
        const threshold = maxRadius * 0.25; // Deadzone
        
        const newKeys = {
            w: dy < -threshold,
            s: dy > threshold,
            a: dx < -threshold,
            d: dx > threshold
        };

        const keysState = keysStateRef.current;

        // Dispatch keydown/keyup if changed
        if (newKeys.w !== keysState.w) triggerKey('w', 'KeyW', newKeys.w ? 'keydown' : 'keyup');
        if (newKeys.s !== keysState.s) triggerKey('s', 'KeyS', newKeys.s ? 'keydown' : 'keyup');
        if (newKeys.a !== keysState.a) triggerKey('a', 'KeyA', newKeys.a ? 'keydown' : 'keyup');
        if (newKeys.d !== keysState.d) triggerKey('d', 'KeyD', newKeys.d ? 'keydown' : 'keyup');

        keysStateRef.current = newKeys;
    };

    const handleStart = (e) => {
        setActive(true);
        if (e.changedTouches && e.changedTouches.length > 0) {
            touchIdRef.current = e.changedTouches[0].identifier;
        }
        handleMove(e); // Calculate initial pos immediately
    };

    const handleEnd = (e) => {
        if (e.changedTouches && touchIdRef.current !== null) {
            let found = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchIdRef.current) {
                    found = true;
                    break;
                }
            }
            if (!found) return; // Not our touch ending
        }

        setActive(false);
        touchIdRef.current = null;
        if (stickRef.current) {
            stickRef.current.style.transform = `translate(0px, 0px)`;
        }
        // Release all
        const keysState = keysStateRef.current;
        if (keysState.w) triggerKey('w', 'KeyW', 'keyup');
        if (keysState.s) triggerKey('s', 'KeyS', 'keyup');
        if (keysState.a) triggerKey('a', 'KeyA', 'keyup');
        if (keysState.d) triggerKey('d', 'KeyD', 'keyup');
        keysStateRef.current = { w: false, a: false, s: false, d: false };
    };

    useEffect(() => {
        if (!active) return;
        
        // Use a ref so handleEnd doesn't require re-binding listeners
        // but we still clear properly.
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        return () => {
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
        };
    }, [active]); // Removed keysState to prevent dropping touches during re-render

    return (
        <div 
            className="fixed bottom-12 left-12 w-32 h-32 rounded-full border-2 border-cyan/30 bg-cyan/10 backdrop-blur-md z-[100] touch-none select-none flex items-center justify-center"
            ref={containerRef}
            onTouchStart={handleStart}
            onMouseDown={handleStart}
        >
            <div 
                className="w-12 h-12 rounded-full bg-cyan/50 border border-cyan shadow-[0_0_15px_#00FFFF] pointer-events-none"
                ref={stickRef}
                style={{ transition: active ? 'none' : 'transform 0.2s ease-out' }}
            />
        </div>
    );
}
