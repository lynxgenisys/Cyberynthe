import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';

// Load all MP3 files dynamically
const menuTracksRaw = import.meta.glob('../../assets/OST/Menus/*.mp3', { eager: true, query: '?url', import: 'default' });
const levelTracksRaw = import.meta.glob('../../assets/OST/Levels/*.mp3', { eager: true, query: '?url', import: 'default' });
const bossTracksRaw = import.meta.glob('../../assets/OST/BOSS/*.mp3', { eager: true, query: '?url', import: 'default' });

// Extract file name for display
const formatTrackName = (path) => {
    const parts = path.split('/');
    const file = parts[parts.length - 1];
    return file.replace('.mp3', '').replace(/_/g, ' ');
};

const tracks = {
    MENUS: Object.values(menuTracksRaw).map(url => ({ url, name: formatTrackName(url) })),
    LEVELS: Object.values(levelTracksRaw).map(url => ({ url, name: formatTrackName(url) })),
    BOSS: Object.values(bossTracksRaw).map(url => ({ url, name: formatTrackName(url) }))
};

export default function MusicManager() {
    const { gameState, setCurrentTrackName } = useGame();
    const audioRef = useRef(new Audio());
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    
    // Internal state to track current playlist
    const [currentZone, setCurrentZone] = useState('MENUS');
    const [trackIndex, setTrackIndex] = useState(0);

    // Audio Unlocker: Wait for first interaction to unblock autoplay
    useEffect(() => {
        const unlock = () => {
            setAudioUnlocked(true);
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, []);

    // 1. Determine current zone
    useEffect(() => {
        let newZone = 'LEVELS';
        if (gameState.isInMenu) {
            newZone = 'MENUS';
        } else if (gameState.floorLevel % 10 === 0 && gameState.gameMode !== 'ghost') {
            newZone = 'BOSS';
        }
        
        if (newZone !== currentZone) {
            setCurrentZone(newZone);
            // Reset index or pick random if shuffle
            const playlist = tracks[newZone];
            const nextIndex = gameState.isMusicShuffle 
                ? Math.floor(Math.random() * playlist.length)
                : 0;
            setTrackIndex(nextIndex);
        }
    }, [gameState.isInMenu, gameState.floorLevel, gameState.gameMode, currentZone, gameState.isMusicShuffle]);

    // 2. Play Audio based on zone & index
    useEffect(() => {
        if (!audioUnlocked) return; // Wait for user interaction first

        const audio = audioRef.current;
        const playlist = tracks[currentZone];
        if (!playlist || playlist.length === 0) return;

        // Failsafe bounds check
        const safeIndex = trackIndex % playlist.length;
        const track = playlist[safeIndex];

        audio.src = track.url;
        audio.load();
        
        // Respect volume setting right away
        audio.volume = gameState.musicVolume;
        
        if (gameState.musicVolume > 0) {
            audio.play().catch(e => console.warn("Audio playback failed:", e));
            setCurrentTrackName(track.name);
        } else {
            setCurrentTrackName("MUSIC OFF");
        }

        // On End: Advance Track
        const handleEnded = () => {
            let nextIndex;
            if (gameState.isMusicShuffle) {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } else {
                nextIndex = (safeIndex + 1) % playlist.length;
            }
            setTrackIndex(nextIndex);
        };

        const handleTimeUpdate = () => {
            if (audio.duration && audio.currentTime > audio.duration - 2.0) {
                const fadeProgress = (audio.currentTime - (audio.duration - 2.0)) / 2.0;
                audio.volume = Math.max(0, gameState.musicVolume * (1.0 - fadeProgress));
            } else {
                audio.volume = gameState.musicVolume;
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.pause(); // Cleanup pause
        };
    }, [currentZone, trackIndex, audioUnlocked]); // Removed musicVolume/isMusicShuffle to prevent track restart

    // 3. React to Volume Changes dynamically without restarting track
    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = gameState.musicVolume;
        
        if (gameState.musicVolume > 0) {
            if (audio.paused) {
                audio.play().catch(e => console.warn("Audio autoplay blocked."));
            }
            // Restore track name if it was muted
            const playlist = tracks[currentZone];
            if (playlist && playlist.length > 0) {
                setCurrentTrackName(playlist[trackIndex % playlist.length].name);
            }
        } else {
            audio.pause();
            setCurrentTrackName("MUSIC OFF");
        }
    }, [gameState.musicVolume, currentZone, trackIndex, setCurrentTrackName]);

    return null; // Invisible component
}
