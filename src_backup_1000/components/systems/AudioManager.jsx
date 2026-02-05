import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Audio Synthesis System (No external assets required)
 * SECTOR_02: Industrial Hum + Relay Clicks
 */

export default function AudioManager() {
    const { gameState } = useGame();
    const audioCtxRef = useRef(null);
    const humOscRef = useRef(null);
    const humGainRef = useRef(null);
    const intervalRef = useRef(null);

    // INITIALIZE AUDIO CONTEXT (On Interaction usually, but we assume AutoPlay logic or user triggered)
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new AudioContext();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        };

        // Init on first click if needed, or immediately
        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });

        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    // AMBIENT TRACK LOGIC
    useEffect(() => {
        if (!audioCtxRef.current) return;

        const isSector2 = gameState.floorLevel >= 11 && gameState.floorLevel <= 25;
        const ctx = audioCtxRef.current;

        // INDUSTRIAL HUM (Sector 2)
        if (isSector2) {
            if (!humOscRef.current) {

                // 1. Rumble Oscillator
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = 40; // Low Rumble

                // 2. Lowpass Filter (Muffle it)
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 120;

                // 3. Gain (Volume)
                const gain = ctx.createGain();
                gain.gain.value = 0.05; // Quiet background

                // Graph: Osc -> Filter -> Gain -> Out
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc.start();

                humOscRef.current = osc;
                humGainRef.current = gain;
            } else {
                // Fade In if previously ducked?
                humGainRef.current.gain.setTargetAtTime(0.05, ctx.currentTime, 1);
            }
        } else {
            // STOP HUM (Fade Out)
            if (humOscRef.current) {
                humGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
                setTimeout(() => {
                    if (humOscRef.current) {
                        humOscRef.current.stop();
                        humOscRef.current.disconnect();
                        humOscRef.current = null;
                    }
                }, 600);
            }
        }
    }, [gameState.floorLevel]);

    // RELAY CLICK LOGIC (Sector 2 Random FX)
    useEffect(() => {
        const isSector2 = gameState.floorLevel >= 11 && gameState.floorLevel <= 25;

        if (isSector2) {
            const scheduleClick = () => {
                const delay = 15000 + Math.random() * 15000; // 15-30s
                intervalRef.current = setTimeout(() => {
                    playRelayClick();
                    scheduleClick(); // Loop
                }, delay);
            };
            scheduleClick();
        } else {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [gameState.floorLevel]);

    const playRelayClick = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;

        // Simple High Click
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    return null; // Invisible System Component
}
