import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import ProfileCard from './ProfileCard';
import LeaderboardPanel from './LeaderboardPanel';
import { supabase, getProfile, signOut } from '../../utils/supabase';
import { useSound } from '../../context/SoundContext';
import AboutPage from './AboutPage';
import AuthOverlay from './AuthOverlay';
import './SplashScreen.css';

/**
 * SPLASH SCREEN: Main menu and mode selection
 * Displays before game initialization
 */
export default function SplashScreen({ onStart, hasSave, onResume }) {
    const { setGameState } = useGame();
    const { playMenuMusic, stopMenuMusic, isMuted, toggleMute, cycleTrack } = useSound();
    const [activeTab, setActiveTab] = useState('play'); // 'play' | 'profile' | 'ledger' | 'about'
    const [selectedMode, setSelectedMode] = useState('normal'); // 'normal' | 'hardcore' | 'ghost'
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [welcomeDismissed, setWelcomeDismissed] = useState(false);

    // AUTH CHECK
    useEffect(() => {
        const checkAuth = async () => {
            if (!supabase) {
                // If Supabase is disabled (offline mode), skip auth
                setIsAuthenticated(true);
                setCheckingAuth(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch profile to get Hacker ID
                const profile = await getProfile(session.user.id);
                if (profile.success && profile.data) {
                    // Profile exists = Full Access
                    setGameState(prev => ({ ...prev, playerName: profile.data.hacker_id }));
                    setIsAuthenticated(true);
                } else {
                    // Session exists BUT no profile = Incomplete Setup
                    // Do NOT set isAuthenticated(true).
                    // This will keep rendering AuthOverlay, which we will update to handle this state.
                    console.log("User logged in but no profile found. Enforcing Golden Ticket flow.");
                }
            }
            setCheckingAuth(false);
        };
        checkAuth();
    }, [setGameState]);

    const handleAuthComplete = (hackerId) => {
        setGameState(prev => ({ ...prev, playerName: hackerId }));
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await signOut();
        setIsAuthenticated(false);
        setGameState(prev => ({ ...prev, playerName: 'GHOST_USER' }));
    };

    const handleStart = async () => {
        // Attempt Fullscreen & Landscape Lock for Mobile
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                await window.screen.orientation.lock('landscape');
            }
        } catch (err) {
            console.warn("Fullscreen/Orientation lock failed or unsupported:", err);
        }

        setGameState(prev => ({
            ...prev,
            gameMode: selectedMode,
            isInMenu: false
        }));
        onStart?.(selectedMode);
    };

    // F KEY TO DISMISS WELCOME AND AUDIO TRIGGERS
    useEffect(() => {
        if (welcomeDismissed) {
            playMenuMusic();
        }

        const handleKey = (e) => {
            if (e.key && e.key.toLowerCase() === 'f') {
                setWelcomeDismissed(true);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [welcomeDismissed, playMenuMusic]);

    // STOP MUSIC ON UNMOUNT
    useEffect(() => {
        return () => stopMenuMusic();
    }, [stopMenuMusic]);

    if (checkingAuth) return <div className="splash-screen"><div className="splash-content">INITIALIZING_SECURE_CONNECTION...</div></div>;
    
    if (!welcomeDismissed) {
        return (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-start text-center p-8 cursor-pointer bg-black"
                 style={{ 
                     backgroundImage: "url('/Cyberynthe_SPLASH_Cover.png')",
                     backgroundSize: window.innerWidth > 800 ? "25%" : "contain",
                     backgroundPosition: "center 50%",
                     backgroundRepeat: "no-repeat"
                 }}
                 onClick={() => setWelcomeDismissed(true)}>
                
                <div className="mt-[65vh] flex flex-col items-center">
                    <button 
                        className="flex flex-col items-center justify-center border-2 border-magenta text-magenta px-10 py-5 hover:bg-magenta hover:text-black transition-all font-mono bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(234,0,255,0.4)]"
                        onClick={(e) => { e.stopPropagation(); setWelcomeDismissed(true); }}
                    >
                        <span className="text-2xl font-bold mb-2">[ ENTER THE LABYRINTH! ]</span>
                        <span className="text-sm animate-pulse-color-cycle">(Click, Or press F key to continue)</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <AuthOverlay onLoginSuccess={handleAuthComplete} />;

    const renderPlayTab = () => (
        <div className="splash-play-tab">
            <div className="splash-title">
                <span className="cyan-glow">CYBER</span>
                <span className="magenta-glow">YNTHE</span>
            </div>
            <div className="splash-subtitle">THE GRADIENT LABYRINTH</div>

            <div className="mode-select-container">
                <div className="mode-select-label">MODE_SELECTION:</div>

                <div className="mode-options">
                    <button
                        className={`mode-btn ${selectedMode === 'normal' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('normal')}
                    >
                        <div className="mode-icon">◇</div>
                        <div className="mode-name">NORMAL</div>
                        <div className="mode-desc">Full experience. Respawn enabled.</div>
                    </button>

                    <button
                        className={`mode-btn ${selectedMode === 'hardcore' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('hardcore')}
                    >
                        <div className="mode-icon">◆</div>
                        <div className="mode-name">HARDCORE</div>
                        <div className="mode-desc">One life. Permadeath.</div>
                    </button>

                    <button
                        className={`mode-btn ${selectedMode === 'ghost' ? 'active' : ''}`}
                        onClick={() => setSelectedMode('ghost')}
                    >
                        <div className="mode-icon">▽</div>
                        <div className="mode-name">TRUE GHOST</div>
                        <div className="mode-desc">Pure speedrun. No combat.</div>
                    </button>
                </div>
            </div>

            <div className="action-buttons">
                {hasSave && (
                    <button className="resume-btn" onClick={async () => {
                        try {
                            if (document.documentElement.requestFullscreen) {
                                await document.documentElement.requestFullscreen();
                            }
                            if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                                await window.screen.orientation.lock('landscape');
                            }
                        } catch (err) {
                            console.warn("Fullscreen/Orientation lock failed or unsupported:", err);
                        }
                        onResume();
                    }}>
                        [ RESUME_SESSION ]
                    </button>
                )}

                <button className="initialize-btn" onClick={handleStart}>
                    [ INITIALIZE_NEW_RUN ]
                </button>
            </div>

            <div className="splash-version">v0.14.2 | SWARM_PROTOCOL</div>
        </div>
    );

    return (
        <div className="splash-screen">
            <div className="splash-nav-tabs">
                <button
                    className={`nav-tab ${activeTab === 'play' ? 'active' : ''}`}
                    onClick={() => setActiveTab('play')}
                >
                    PLAY
                </button>
                <button
                    className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    PROFILE
                </button>
                <button
                    className={`nav-tab ${activeTab === 'ledger' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ledger')}
                >
                    LEDGER
                </button>
                <button
                    className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
                    onClick={() => setActiveTab('about')}
                >
                    ABOUT
                </button>
                <a
                    href="https://buymeacoffee.com/LynxGen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-tab text-yellow-500 hover:text-yellow-400 border-yellow-900/30 flex items-center gap-2"
                >
                    ☕ SUPPORT_DEV
                </a>
                <div className="flex-1"></div> {/* Spacer */}
                <button
                    className="nav-tab text-cyan-500 hover:text-cyan-400 border-cyan-900/30"
                    onClick={cycleTrack}
                >
                    [ NEXT_TRACK ]
                </button>
                <button
                    className={`nav-tab border-cyan-900/30 ${isMuted ? 'text-gray-500' : 'text-cyan-500'}`}
                    onClick={toggleMute}
                >
                    [ {isMuted ? 'UNMUTE' : 'MUTE'} ]
                </button>
                <button
                    className="nav-tab text-red-500 hover:text-red-400 border-red-900/30"
                    onClick={handleLogout}
                >
                    [ LOGOUT ]
                </button>
            </div>

            <div className="splash-content">
                {activeTab === 'play' && renderPlayTab()}
                {activeTab === 'profile' && <ProfileCard />}
                {activeTab === 'ledger' && <LeaderboardPanel />}
                {activeTab === 'about' && <AboutPage />}
            </div>
        </div>
    );
}

