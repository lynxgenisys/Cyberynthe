import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { getLevelFromXP } from '../../utils/scoring';
import { getPlayerStats } from '../../utils/supabase';
import { LORE_FRAGMENTS } from '../../engine/LoreManager';
import './ProfileCard.css';

/**
 * PROFILE CARD: The "Hacker ID" - Player stats, badges, and Lore Archive
 */
export default function ProfileCard({ targetUserId = null, targetUsername = null, onClose = null }) {
    const { gameState } = useGame();
    const [profileData, setProfileData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'lore'
    const [selectedLore, setSelectedLore] = useState(null);

    // Fetch REAL lifetime stats from Supabase
    React.useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const result = await getPlayerStats(targetUserId); 
            if (result.success) {
                setProfileData(result.data);
            } else {
                setProfileData({
                    total_runs: 0,
                    total_ebits: 0,
                    max_floor: 0,
                    avg_resonance: 0.5,
                    deepest_dives: { normal: 0, hardcore: 0, ghost: 0 },
                    lifetime_kills: {},
                    unlocked_fragments: [],
                    save_data: null
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [targetUserId]); 

    if (loading) return <div className="profile-card loading"><div className="animate-pulse">DECRYPTING_DOSSIE...</div></div>;

    const stats = profileData || {};
    const dives = stats.deepest_dives || { normal: 0, hardcore: 0, ghost: 0 };
    const kills = stats.lifetime_kills || {};
    const unlockedFragments = stats.unlocked_fragments || [];
    const saveState = stats.save_data || null;

    const profile = {
        username: targetUsername || gameState.playerName || 'GHOST_ID',
        
        // Active Cache (Save State) fallback to live local session if playing
        cache_mode: saveState?.gameState ? (saveState.gameState.gameMode || 'normal') : (gameState.gameMode || 'NONE'),
        cache_level: saveState?.gameState ? getLevelFromXP(saveState.gameState.xp || 0) : getLevelFromXP(gameState.xp || 0),
        cache_xp: saveState?.gameState ? (saveState.gameState.xp || 0) : (gameState.xp || 0),
        cache_floor: saveState?.gameState ? (saveState.gameState.floorLevel || 1) : (gameState.floorLevel || 0),
        cache_ebits: saveState?.gameState ? (saveState.gameState.eBits || 0) : (gameState.eBits || 0),
        cache_sessions: saveState?.gameState ? (saveState.gameState.runSessions || 1) : (gameState.runSessions || 1),
        cache_time: saveState ? Math.floor(((saveState.totalPausedTime || 0)) / 1000) : 0, 
        
        // REAL DB STATS
        total_runs: stats.total_runs || 0,
        total_ebits: (stats.total_ebits || 0).toLocaleString(),
        // Fallback to max_floor for legacy records prior to deepest_dives addition
        best_normal: Math.max(dives.normal || 0, stats.max_floor || 0),
        best_hardcore: dives.hardcore || 0,
        best_ghost: dives.ghost || 0,
        resonance_lifetime: stats.avg_resonance !== undefined ? stats.avg_resonance : 0.5,

        badges: ['[USER]']
    };

    // Calculate dynamic badges based on REAL Stats
    if (profile.best_normal >= 10 || profile.best_hardcore >= 5) profile.badges.push('[EXPLORER]');
    if (profile.best_normal >= 25 || profile.best_hardcore >= 15) profile.badges.push('[DEEP_DIVER]');
    if (profile.best_normal >= 50 || profile.best_hardcore >= 30) profile.badges.push('[VOID_WALKER]');
    if (profile.best_normal >= 100 || profile.best_hardcore >= 100 || profile.best_ghost >= 100) profile.badges.push('[SYSTEM_ARCHITECT]');
    
    if (profile.cache_level >= 5) profile.badges.push('[OVERCLOCKED]');
    if (profile.cache_level >= 15) profile.badges.push('[SINGULARITY]');
    
    if ((kills['IO_SENTINEL'] || 0) + (kills['STATELESS_SENTRY'] || 0) >= 5) profile.badges.push('[SLAYER]');
    if ((kills['BIT_MITE'] || 0) >= 500) profile.badges.push('[MITE_SQUASHER]');
    if ((kills['HUNTER'] || 0) >= 50) profile.badges.push('[HUNTER_KILLER]');
    if ((kills['NULL_WISP'] || 0) >= 100) profile.badges.push('[WISP_BANE]');
    
    if (profile.best_ghost >= 10) profile.badges.push('[GLITCH_IN_THE_SYSTEM]');
    if (profile.best_ghost >= 25) profile.badges.push('[SPECTER]');
    if (profile.best_ghost >= 50) profile.badges.push('[PHANTOM]');
    
    if (profile.best_hardcore >= 50) profile.badges.push('[IRON_WILL]');
    
    if (stats.total_ebits >= 10000) profile.badges.push('[DATA_BROKER]');
    if (stats.total_ebits >= 100000) profile.badges.push('[CORP_RAIDER]');
    
    if (unlockedFragments.length >= 25) profile.badges.push('[LOREMASTER]');
    if (unlockedFragments.length >= 50) profile.badges.push('[ARCHIVIST]');

    if (profile.resonance_lifetime > 0.95) profile.badges.push('[CHAOS_THEORIST]');
    if (profile.resonance_lifetime < 0.05) profile.badges.push('[LAW_BRINGER]');

    const getBadgeColor = (badge) => {
        if (badge.includes('VOID_WALKER') || badge.includes('SYSTEM_ARCHITECT')) return '#FFD700'; // Gold
        if (badge.includes('DEEP_DIVER') || badge.includes('PHANTOM') || badge.includes('ARCHIVIST')) return '#EA00FF'; // Magenta
        if (badge.includes('EXPLORER') || badge.includes('SPECTER') || badge.includes('LOREMASTER')) return '#00FFFF'; // Cyan
        if (badge.includes('OVERCLOCKED') || badge.includes('SINGULARITY')) return '#FFA500'; // Orange
        if (badge.includes('SLAYER') || badge.includes('IRON_WILL')) return '#FF0000'; // Red
        if (badge.includes('CHAOS_THEORIST')) return '#EA00FF'; 
        if (badge.includes('LAW_BRINGER')) return '#00FFFF';
        return '#00AAAA'; // Dim Cyan
    };

    const renderResonanceBar = () => {
        const resonance = profile.resonance_lifetime;
        const position = resonance * 100;

        return (
            <div className="resonance-bar-container">
                <div className="resonance-label-left">ORDER</div>
                <div className="resonance-bar">
                    <div className="resonance-gradient" />
                    <div className="resonance-indicator" style={{ left: `${position}%` }} />
                </div>
                <div className="resonance-label-right">CHAOS</div>
            </div>
        );
    };

    const renderDossier = () => (
        <>
            {/* HEADER */}
            <div className="profile-header">
                <div className="profile-ghost-id">[GHOST_ID]: {profile.username}</div>
                <div className="profile-badge-primary" style={{ color: getBadgeColor(profile.badges[profile.badges.length - 1]) }}>
                    STATUS: {profile.badges[profile.badges.length - 1]}
                </div>
                <div className="profile-created text-xs">
                    TOTAL_RUNS_LOGGED: {profile.total_runs}
                </div>
            </div>

            {/* LCACHE INFO (Active Run Save) */}
            <div className="profile-header bg-black/50 border border-cyan/30 p-2 mb-4 text-xs font-mono">
                <div className="text-cyan mb-1 font-bold">» ACTIVE_LCACHE_DATA</div>
                {saveState ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-300">
                        <span>MODE: <span className="text-white">{profile.cache_mode.toUpperCase()}</span></span>
                        <span>LVL: <span className="text-white">{profile.cache_level}</span></span>
                        <span>XP: <span className="text-white">{profile.cache_xp}</span></span>
                        <span>FLOOR: <span className="text-white">{profile.cache_floor}</span></span>
                        <span>eBITS: <span className="text-white">{profile.cache_ebits}</span></span>
                        <span>SESSIONS: <span className="text-white">{profile.cache_sessions}</span></span>
                    </div>
                ) : (
                    <div className="text-gray-500 italic">NO_ACTIVE_SESSION_FOUND</div>
                )}
            </div>

            {/* DEEPEST DIVES */}
            <div className="profile-section">
                <div className="section-title">DEEPEST_DIVES (RECORDS):</div>
                <div className="flex gap-4 text-sm font-mono mt-2">
                    <div className="border border-cyan/30 p-2 flex-1 text-center bg-black/40">
                        <div className="text-cyan mb-1">NORMAL</div>
                        <div>Floor {profile.best_normal}</div>
                    </div>
                    <div className="border border-red-500/30 p-2 flex-1 text-center bg-black/40">
                        <div className="text-red-500 mb-1">HARDCORE</div>
                        <div>Floor {profile.best_hardcore}</div>
                    </div>
                    <div className="border border-purple-500/30 p-2 flex-1 text-center bg-black/40">
                        <div className="text-purple-400 mb-1">GHOST</div>
                        <div>Floor {profile.best_ghost}</div>
                    </div>
                </div>
            </div>

            {/* LIFETIME KILLS */}
            <div className="profile-section">
                <div className="section-title">LIFETIME_KILLS:</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2 bg-black/40 p-2 border border-cyan/20">
                    <div className="flex justify-between"><span>BIT_MITE:</span> <span className="text-cyan">{kills['BIT_MITE'] || 0}</span></div>
                    <div className="flex justify-between"><span>NULL_WISP:</span> <span className="text-cyan">{kills['NULL_WISP'] || 0}</span></div>
                    <div className="flex justify-between"><span>LOGIC_HUNTER:</span> <span className="text-cyan">{kills['HUNTER'] || 0}</span></div>
                    <div className="flex justify-between"><span>STATELESS_SENTRY:</span> <span className="text-cyan">{kills['STATELESS_SENTRY'] || 0}</span></div>
                    <div className="flex justify-between"><span>IO_SENTINEL:</span> <span className="text-red-500">{kills['IO_SENTINEL'] || 0}</span></div>
                </div>
            </div>

            {/* RESONANCE SIGNATURE */}
            <div className="profile-section">
                <div className="section-title">LIFETIME_RESONANCE_MEAN:</div>
                {renderResonanceBar()}
            </div>

            {/* BADGE RACK */}
            <div className="profile-section">
                <div className="section-title">LEGACY_TITLES:</div>
                <div className="badge-rack">
                    {profile.badges.map((badge, i) => (
                        <div
                            key={i}
                            className="badge-item earned"
                            style={{ color: getBadgeColor(badge) }}
                        >
                            {badge}
                        </div>
                    ))}
                    {!profile.badges.includes('[EXPLORER]') && <div className="badge-item locked">[EXPLORER]</div>}
                    {!profile.badges.includes('[DEEP_DIVER]') && <div className="badge-item locked">[DEEP_DIVER]</div>}
                    {!profile.badges.includes('[VOID_WALKER]') && <div className="badge-item locked">[VOID_WALKER]</div>}
                    {!profile.badges.includes('[OVERCLOCKED]') && <div className="badge-item locked">[OVERCLOCKED]</div>}
                </div>
            </div>
        </>
    );

    const renderLoreArchive = () => (
        <div className="lore-archive space-y-4">
            <div className="text-xs text-gray-400 mb-4 border-b border-cyan/30 pb-2">
                UNLOCKED FRAGMENTS: {unlockedFragments.length} / {LORE_FRAGMENTS.length}
            </div>
            
            {selectedLore ? (
                <div className="lore-reader bg-black/80 border border-cyan p-6 relative">
                    <button 
                        className="absolute top-2 right-4 text-cyan hover:text-white"
                        onClick={() => setSelectedLore(null)}
                    >
                        CLOSE
                    </button>
                    <h3 className="text-xl text-cyan mb-4">{selectedLore.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedLore.text}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {LORE_FRAGMENTS.map(frag => {
                        const isUnlocked = unlockedFragments.includes(frag.id);
                        return (
                            <button
                                key={frag.id}
                                disabled={!isUnlocked}
                                onClick={() => setSelectedLore(frag)}
                                className={`text-left p-3 border font-mono text-sm transition-colors ${
                                    isUnlocked 
                                        ? 'border-cyan/50 text-cyan bg-cyan/5 hover:bg-cyan/20 cursor-pointer' 
                                        : 'border-gray-800 text-gray-600 bg-black/40 cursor-not-allowed'
                                }`}
                            >
                                {isUnlocked ? `>> [DECRYPTED] ${frag.title}` : `>> [ENCRYPTED_DATA_NODE_0${frag.id}]`}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="profile-card relative pb-10">
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-4 text-cyan hover:text-white z-10"
                >
                    X
                </button>
            )}

            {/* TAB NAV */}
            <div className="flex gap-2 mb-4 border-b border-cyan/30 pb-2">
                <button 
                    className={`px-3 py-1 text-xs font-bold border transition-colors ${activeTab === 'dossier' ? 'border-cyan bg-cyan text-black' : 'border-cyan/30 text-cyan hover:bg-cyan/20'}`}
                    onClick={() => setActiveTab('dossier')}
                >
                    DOSSIER
                </button>
                {!targetUserId && (
                    <button 
                        className={`px-3 py-1 text-xs font-bold border transition-colors ${activeTab === 'lore' ? 'border-magenta bg-magenta text-black' : 'border-magenta/30 text-magenta hover:bg-magenta/20'}`}
                        onClick={() => setActiveTab('lore')}
                    >
                        SYSTEM_ARCHIVE
                    </button>
                )}
            </div>

            {activeTab === 'dossier' ? renderDossier() : renderLoreArchive()}

            {/* NOTE */}
            <div className="profile-note mt-6">
                ⚡ SECURE_UPLINK // DATA_SOURCE: OFFICIAL_LEDGER
            </div>
        </div>
    );
}
