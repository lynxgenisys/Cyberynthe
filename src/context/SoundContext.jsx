import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const audioCtxRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new AudioContext();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            setIsInitialized(true);
        };

        // Initialize on first interaction
        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });

        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    // Helper: Create White Noise Buffer
    const getNoiseBuffer = (ctx) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const menuMusicTimeoutRef = useRef(null);

    const playMenuMusic = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        if (menuMusicTimeoutRef.current) return; // Already playing

        const ctx = audioCtxRef.current;
        const notes = [110, 130.81, 164.81, 220, 164.81, 130.81]; // A2, C3, E3, A3, E3, C3 (Dark Am Arpeggio)
        let noteIndex = 0;

        const scheduleNote = () => {
            if (!audioCtxRef.current) return;
            if (ctx.state === 'suspended') {
                menuMusicTimeoutRef.current = setTimeout(scheduleNote, 100);
                return;
            }

            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = notes[noteIndex];
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.25);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.25);

            noteIndex = (noteIndex + 1) % notes.length;
            menuMusicTimeoutRef.current = setTimeout(scheduleNote, 250); // 250ms per note
        };

        scheduleNote();
    };

    const stopMenuMusic = () => {
        if (menuMusicTimeoutRef.current) {
            clearTimeout(menuMusicTimeoutRef.current);
            menuMusicTimeoutRef.current = null;
        }
    };

    const playSFX = (type, volumeScale = 1.0) => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        const ctx = audioCtxRef.current;
        const t = ctx.currentTime;

        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        // Base volume to prevent blowing out speakers
        masterGain.gain.value = 0.3 * volumeScale; 

        if (type === 'shoot') {
            // Rapid descending sweep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
            
            gain.gain.setValueAtTime(1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            osc.stop(t + 0.1);

        } else if (type === 'hit') {
            // Short filtered noise crunch
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            noise.start(t);
            noise.stop(t + 0.1);

        } else if (type === 'miss') {
            // High pitched short ping
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.linearRampToValueAtTime(800, t + 0.05);
            
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            osc.stop(t + 0.05);

        } else if (type === 'mob_attack') {
            // Aggressive low buzz
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.linearRampToValueAtTime(50, t + 0.2);
            
            gain.gain.setValueAtTime(0.8, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            osc.stop(t + 0.2);

        } else if (type === 'mob_death') {
            // Dissonant descending chord / disintegration
            [300, 350, 400].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                
                osc.frequency.setValueAtTime(freq, t);
                osc.frequency.exponentialRampToValueAtTime(50, t + 0.3 + (i * 0.05));
                
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                
                osc.connect(gain);
                gain.connect(masterGain);
                
                osc.start(t);
                osc.stop(t + 0.4);
            });

        } else if (type === 'footstep') {
            // Low thud
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
            
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            osc.stop(t + 0.05);

        } else if (type === 'player_hurt') {
            // Loud squelch / static burst
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.2);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(1.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            noise.start(t);
            noise.stop(t + 0.3);
        }
    };

    return (
        <SoundContext.Provider value={{ playSFX, playMenuMusic, stopMenuMusic, isInitialized }}>
            {children}
        </SoundContext.Provider>
    );
};
