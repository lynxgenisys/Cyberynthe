import React, { useEffect, useState, useRef } from 'react';
import './ChargingReticle.css';

/**
 * DATA SPIKE v2 CHARGING RETICLE - POLISHED
 * - Spins ONLY when charging
 * - Expands 4x
 * - Flare on release
 * - Projectiles fire from outer edges to center
 * - Spins back to orientation (0 deg) on release
 */
export default function ChargingReticle({ isCharging, critTimestamp }) {
    const [rotation, setRotation] = useState(0);
    const [expansion, setExpansion] = useState(1);
    const [isCharged, setIsCharged] = useState(false);
    const [isFlaring, setIsFlaring] = useState(false);
    const [isFlaringCrit, setIsFlaringCrit] = useState(false);
    const [isFiring, setIsFiring] = useState(false);

    // Refs for animations
    const rotationReq = useRef();
    const lastTime = useRef(0);
    const chargeStartTime = useRef(0);

    // CRIT FLASH LOGIC
    useEffect(() => {
        if (critTimestamp) {
            setIsFlaringCrit(true);
            setTimeout(() => setIsFlaringCrit(false), 200);
        }
    }, [critTimestamp]);

    // CHARGING LOGIC
    useEffect(() => {
        if (isCharging) {
            // START CHARGING
            chargeStartTime.current = Date.now();
            lastTime.current = Date.now();

            const animateCharge = () => {
                const now = Date.now();
                const delta = now - lastTime.current;
                lastTime.current = now;

                // 1. Rotation (Spin)
                setRotation(prev => (prev + (delta * 0.3)) % 360); // ~100 deg/sec

                // 2. Expansion (1s to max)
                const elapsed = now - chargeStartTime.current;
                const progress = Math.min(elapsed / 1000, 1);

                if (progress >= 1 && !isCharged) setIsCharged(true);

                // Curve properties: easeOutQuad for snappy feel? or linear?
                // User said "expand... to 4x". 
                setExpansion(1 + (progress * 3)); // 1 -> 4

                if (isCharging) rotationReq.current = requestAnimationFrame(animateCharge);
            };
            rotationReq.current = requestAnimationFrame(animateCharge);

        } else {
            // STOP/RELEASE
            if (rotationReq.current) cancelAnimationFrame(rotationReq.current);

            // If fully charged, trigger release sequence
            if (isCharged) {
                triggerReleaseSequence();
            } else {
                // Just reset if not charged
                setExpansion(1);
                setRotation(0);
                setIsCharged(false);
            }
        }

        return () => {
            if (rotationReq.current) cancelAnimationFrame(rotationReq.current);
        };
    }, [isCharging]); // Depend only on isCharging changes

    const triggerReleaseSequence = () => {
        // 1. Flare (100ms)
        setIsFlaring(true);
        setTimeout(() => setIsFlaring(false), 100);

        // 2. Fire Animation (Beads shoot to center)
        setIsFiring(true);

        // 3. Reset Reticle (Close up & Spin back)
        // User: "then the reticl closes back up... also spin to orientate itself back"
        // firing takes ~200-300ms visually

        setTimeout(() => {
            setIsFiring(false);

            // Animate spin back to 0 (or 360)
            const currentRot = rotation;
            const targetRot = 360; // Always spin forward to upright
            const remaining = targetRot - currentRot;

            // Simple approach: just snap for now, or use css transition
            // Let's rely on CSS transition if we move rotation to style? 
            // Better: just reset hard for snappy feel -> "orientate itself back"
            setRotation(0);
            setExpansion(1);
            setIsCharged(false);
        }, 300);
    };

    return (
        <div className="charging-reticle">
            {/* Main Container handles Rotation */}
            <div
                className={`reticle-container ${isFiring ? 'firing' : ''}`}
                style={{
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                {[0, 120, 240].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const baseDist = 12; // Base offset
                    const dist = baseDist * expansion;

                    const x = Math.sin(rad) * dist;
                    const y = -Math.cos(rad) * dist;

                    return (
                        <React.Fragment key={i}>
                            {/* THE BEAD */}
                            <div
                                className={`reticle-bead ${isCharged ? 'charged' : ''}`}
                                style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                    opacity: isFiring ? 0 : 1, // Hide bead when firing projectile representation?
                                    borderColor: isFlaringCrit ? '#FF8800' : undefined,
                                    boxShadow: isFlaringCrit ? '0 0 15px #FF8800' : undefined,
                                    backgroundColor: isFlaringCrit ? '#FF8800' : undefined
                                }}
                            />

                            {/* THE PROJECTILE (Only visible on fire) */}
                            {isFiring && (
                                <div
                                    className="reticle-projectile"
                                    style={{
                                        '--startX': `${x}px`,
                                        '--startY': `${y}px`,
                                        transform: `rotate(${-rotation}deg)` // Counter-rotate to stay upright? No, projectiles follow bead angle
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Center Flare */}
            {isFlaring && <div className="reticle-flare" />}
            {isFlaringCrit && <div className="reticle-flare" style={{ backgroundColor: '#FF8800', width: '20px', height: '20px', boxShadow: '0 0 30px #FF8800' }} />}
        </div>
    );
}
