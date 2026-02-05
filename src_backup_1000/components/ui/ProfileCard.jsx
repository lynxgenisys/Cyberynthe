import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { getLevelFromXP } from '../../utils/scoring';
import { getPlayerStats } from '../../utils/supabase';
import './ProfileCard.css';

/**
 * PROFILE CARD: The "Hacker ID" - Player stats and badges
 * Shows lifetime achievements, resonance, and earned titles
 */
export default function ProfileCard() {
    const { gameState } = useGame();
    const [profileData, setProfileData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Fetch REAL lifetime stats from Supabase
    React.useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const result = await getPlayerStats(); // Defaults to current users ID

            if (result.success) {
                setProfileData(result.data);
            } else {
                // Fallback for new/offline users
                setProfileData({
                    total_runs: 0,
                    total_ebits: 0,
                    max_floor: 0,
                    sentinel_kills: 0,
                    avg_resonance: 0.5
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, []); // Run once on mount

    // Fallback while loading
    if (loading) return <div className="profile-card loading"><div className="animate-pulse">DECRYPTING_DOSSIE...</div></div>;

    const stats = profileData || {};

    const profile = {
        username: gameState.playerName || 'GHOST_ID',
        // created_at: Use current date or fetch from auth metadata if needed (simplified for now)
        current_level: getLevelFromXP(gameState.xp || 0), // Current session Level

        // REAL DB STATS
        total_runs: stats.total_runs || 0,
        total_ebits: (stats.total_ebits || 0).toLocaleString(),
        best_floor_normal: stats.max_floor || 0,
        sentinel_kills: stats.sentinel_kills || 0,
        resonance_lifetime: stats.avg_resonance !== undefined ? stats.avg_resonance : 0.5,

        fragments_found: gameState.collectedFragments?.length || 0, // Still local for now
        badges: ['[USER]']
    };

    // Calculate dynamic badges based on REAL Stats
    if (profile.best_floor_normal >= 10) profile.badges.push('[EXPLORER]');
    if (profile.best_floor_normal >= 25) profile.badges.push('[DEEP_DIVER]');
    if (profile.best_floor_normal >= 50) profile.badges.push('[VOID_WALKER]');
    if (profile.current_level >= 5) profile.badges.push('[OVERCLOCKED]');
    if (profile.sentinel_kills >= 5) profile.badges.push('[SLAYER]');

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
        // ethicsScore is 0..1, where 0.5 is neutral
        const position = resonance * 100;

        return (
            <div className="resonance-bar-container">
                <div className="resonance-label-left">ORDER</div>
                <div className="resonance-bar">
                    <div className="resonance-gradient" />
                    <div
                        className="resonance-indicator"
                        style={{ left: `${position}%` }}
                    />
                </div>
                <div className="resonance-label-right">CHAOS</div>
            </div>
        );
    };

    return (
        <div className="profile-card">
            {/* HEADER */}
            <div className="profile-header">
                <div className="profile-ghost-id">[GHOST_ID]: {profile.username}</div>
                <div className="profile-badge-primary" style={{ color: getBadgeColor(profile.badges[profile.badges.length - 1]) }}>
                    STATUS: {profile.badges[profile.badges.length - 1]}
                </div>
                <div className="profile-created">
                    LEVEL: {profile.current_level} // RUNS_LOGGED: {profile.total_runs}
                </div>
            </div>

            {/* VITALS */}
            <div className="profile-vitals">
                <div className="vital-stat">
                    <div className="vital-label">TOTAL_ASSETS_EXTRACTED:</div>
                    <div className="vital-value">{profile.total_ebits} eBits</div>
                </div>
                <div className="vital-stat">
                    <div className="vital-label">DEEPEST_DIVE (RECORD):</div>
                    <div className="vital-value">Floor {profile.best_floor_normal}</div>
                </div>
                <div className="vital-stat">
                    <div className="vital-label">FRAGMENTS_DECRYPTED:</div>
                    <div className="vital-value">{profile.fragments_found} / 50</div>
                </div>
                <div className="vital-stat">
                    <div className="vital-label">SENTINEL_ELIMINATIONS:</div>
                    <div className="vital-value">{profile.sentinel_kills}</div>
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
                    {/* Locked badges */}
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
