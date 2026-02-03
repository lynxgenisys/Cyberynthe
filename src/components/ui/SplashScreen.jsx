import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import ProfileCard from './ProfileCard';
import LeaderboardPanel from './LeaderboardPanel';
import './SplashScreen.css';

/**
 * SPLASH SCREEN: Main menu and mode selection
 * Displays before game initialization
 */
export default function SplashScreen({ onStart, hasSave, onResume }) {
    const { setGameState } = useGame();
    const [activeTab, setActiveTab] = useState('play'); // 'play' | 'profile' | 'ledger'
    const [selectedMode, setSelectedMode] = useState('normal'); // 'normal' | 'hardcore' | 'ghost'

    const handleStart = () => {
        setGameState(prev => ({
            ...prev,
            gameMode: selectedMode,
            isInMenu: false
        }));
        onStart?.(selectedMode);
    };

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
                    <button className="resume-btn" onClick={onResume}>
                        [ RESUME_SESSION ]
                    </button>
                )}

                <button className="initialize-btn" onClick={handleStart}>
                    [ INITIALIZE_NEW_RUN ]
                </button>
            </div>

            <div className="splash-version">v0.9.0-alpha | SECTOR_01_BUILD</div>
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
            </div>

            <div className="splash-content">
                {activeTab === 'play' && renderPlayTab()}
                {activeTab === 'profile' && <ProfileCard />}
                {activeTab === 'ledger' && <LeaderboardPanel />}
            </div>
        </div>
    );
}
