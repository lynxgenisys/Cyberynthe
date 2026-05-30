import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import menuTrack1 from '../assets/OST/Menus/Cold_Pavement_Patterns.mp3';
import menuTrack2 from '../assets/OST/Menus/Sleeping_Among_Moons.mp3';
import menuTrack3 from '../assets/OST/Menus/Tears_in_Glass.mp3';

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
    const [isMuted, setIsMuted] = useState(false);
    const [trackIndex, setTrackIndex] = useState(0);
    const tracks = [menuTrack1, menuTrack2, menuTrack3];

    // Handle track index changes while playing
    useEffect(() => {
        if (menuMusicTimeoutRef.current && !menuMusicTimeoutRef.current.paused) {
            menuMusicTimeoutRef.current.pause();
            menuMusicTimeoutRef.current.src = tracks[trackIndex];
            menuMusicTimeoutRef.current.load();
            if (!isMuted) {
                menuMusicTimeoutRef.current.play().catch(e => console.log("Autoplay blocked", e));
            }
        } else if (menuMusicTimeoutRef.current) {
            menuMusicTimeoutRef.current.src = tracks[trackIndex];
            menuMusicTimeoutRef.current.load();
        }
    }, [trackIndex]);

    // Handle mute state
    useEffect(() => {
        if (menuMusicTimeoutRef.current) {
            menuMusicTimeoutRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const playMenuMusic = () => {
        if (!menuMusicTimeoutRef.current) {
            menuMusicTimeoutRef.current = new Audio(tracks[trackIndex]);
            menuMusicTimeoutRef.current.loop = true;
            menuMusicTimeoutRef.current.volume = 0.3;
            menuMusicTimeoutRef.current.muted = isMuted;
        }
        
        // Browsers require interaction before playing
        menuMusicTimeoutRef.current.play().catch(e => {
            console.log("Audio autoplay blocked until interaction:", e);
        });
    };

    const stopMenuMusic = () => {
        if (menuMusicTimeoutRef.current) {
            menuMusicTimeoutRef.current.pause();
            menuMusicTimeoutRef.current.currentTime = 0;
        }
    };

    const cycleTrack = () => {
        setTrackIndex(prev => (prev + 1) % tracks.length);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
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
        } else if (type === 'data_spike_charge') {
            // High pitched whining/charging sound that sustains
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 1.0); // 1s charge up
            
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 1.0); // 1s fade in
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            // Don't stop it immediately, let it run until they release. 
            // We'll need a way to stop it. 
            // Actually, we can return the oscillator so the caller can stop it!
            return { osc, gain };
        } else if (type === 'data_spike_attack') {
            // Loud sharp synth strike
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            
            osc.frequency.setValueAtTime(1500, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
            
            gain.gain.setValueAtTime(0.8, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.start(t);
            osc.stop(t + 0.2);
        }
    };

    return (
        <SoundContext.Provider value={{ playSFX, playMenuMusic, stopMenuMusic, isInitialized, isMuted, toggleMute, cycleTrack, trackIndex }}>
            {children}
        </SoundContext.Provider>
    );
};
