import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { getLevelFromXP } from '../../utils/scoring';
import { getPlayerStats } from '../../utils/supabase';
import './ProfileCard.css';

/**
 * PROFILE CARD: The "Hacker ID" - Player stats and badges
 */
export default function ProfileCard({ targetUserId = null, targetUsername = null, onClose = null }) {
    const { gameState } = useGame();
    const [profileData, setProfileData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

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
    const saveState = stats.save_data || null;

    const profile = {
        username: targetUsername || gameState.playerName || 'GHOST_ID',
        
        // Active Cache (Save State)
        cache_mode: saveState ? (saveState.gameMode || 'normal') : 'NONE',
        cache_level: saveState ? getLevelFromXP(saveState.xp || 0) : 0,
        cache_xp: saveState ? (saveState.xp || 0) : 0,
        cache_floor: saveState ? (saveState.floorLevel || 1) : 0,
        cache_ebits: saveState ? (saveState.eBits || 0) : 0,
        cache_time: saveState ? Math.floor(((saveState.totalPausedTime || 0)) / 1000) : 0, // Fallback placeholder if timestamp missing, but realistically saveState tracks playtime differently. Let's just say we don't have accurate run time in saveState easily without logic. We will skip exact run time if not tracked.
        
        // REAL DB STATS
        total_runs: stats.total_runs || 0,
        total_ebits: (stats.total_ebits || 0).toLocaleString(),
        best_normal: dives.normal || 0,
        best_hardcore: dives.hardcore || 0,
        best_ghost: dives.ghost || 0,
        resonance_lifetime: stats.avg_resonance !== undefined ? stats.avg_resonance : 0.5,

        badges: ['[USER]']
    };

    // Calculate dynamic badges based on REAL Stats
    if (profile.best_normal >= 10 || profile.best_hardcore >= 5) profile.badges.push('[EXPLORER]');
    if (profile.best_normal >= 25 || profile.best_hardcore >= 15) profile.badges.push('[DEEP_DIVER]');
    if (profile.best_normal >= 50 || profile.best_hardcore >= 30) profile.badges.push('[VOID_WALKER]');
    if (profile.cache_level >= 5) profile.badges.push('[OVERCLOCKED]');
    if ((kills['IO_SENTINEL'] || 0) + (kills['STATELESS_SENTRY'] || 0) >= 5) profile.badges.push('[SLAYER]');

    const getBadgeColor = (badge) => {
        if (badge.includes('VOID_WALKER')) return '#FFD700'; // Gold
        if (badge.includes('DEEP_DIVER')) return '#EA00FF'; // Magenta
        if (badge.includes('EXPLORER')) return '#00FFFF'; // Cyan
        if (badge.includes('OVERCLOCKED')) return '#FFA500'; // Orange
        if (badge.includes('SLAYER')) return '#FF0000'; // Red
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

    return (
        <div className="profile-card">
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
                    </div>
                ) : (
                    <div className="text-gray-500 italic">NO_ACTIVE_SESSION_FOUND</div>
                )}
            </div>

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

            {/* NOTE */}
            <div className="profile-note">
                ⚡ SECURE_UPLINK // DATA_SOURCE: OFFICIAL_LEDGER
            </div>
        </div>
    );
}
