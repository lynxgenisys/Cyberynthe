import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { getLevelFromXP } from '../../utils/scoring';
import './ProfileCard.css';

/**
 * PROFILE CARD: The "Hacker ID" - Player stats and badges
 * Shows lifetime achievements, resonance, and earned titles
 */
export default function ProfileCard() {
    const { gameState } = useGame();

    // Load lifetime stats from history
    const runHistory = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('CyberSynthe_RunHistory') || '[]');
        } catch {
            return [];
        }
    }, []);

    // Aggregate lifetime stats
    const lifetimeStats = useMemo(() => {
        return runHistory.reduce((acc, run) => ({
            totalEBits: acc.totalEBits + (run.score || 0), // Use score as eBits proxy for history
            maxFloor: Math.max(acc.maxFloor, run.maxFloor || 0),
            totalRuns: acc.totalRuns + 1,
            sentinelKills: acc.sentinelKills + (run.maxFloor >= 10 ? 1 : 0)
        }), { totalEBits: 0, maxFloor: 0, totalRuns: 0, sentinelKills: 0 });
    }, [runHistory]);

    const profile = {
        username: gameState.playerName || 'GHOST_USER',
        created_at: runHistory.length > 0 ? new Date(runHistory[0].timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
        total_ebits: Math.max(gameState.eBits || 0, lifetimeStats.totalEBits),
        current_level: getLevelFromXP(gameState.xp || 0),
        fragments_found: gameState.collectedFragments?.length || 0,
        resonance_lifetime: gameState.ethicsScore || 0,
        best_floor_normal: Math.max(gameState.highestFloor || 0, lifetimeStats.maxFloor),
        sentinel_kills: lifetimeStats.sentinelKills,
        badges: ['[USER]']
    };

    // Calculate dynamic badges
    if (profile.best_floor_normal >= 10) profile.badges.push('[EXPLORER]');
    if (profile.best_floor_normal >= 25) profile.badges.push('[DEEP_DIVER]');
    if (profile.best_floor_normal >= 50) profile.badges.push('[VOID_WALKER]');
    if (profile.current_level >= 5) profile.badges.push('[OVERCLOCKED]');

    const getBadgeColor = (badge) => {
        if (badge.includes('VOID_WALKER')) return '#FFD700'; // Gold
        if (badge.includes('DEEP_DIVER')) return '#EA00FF'; // Magenta
        if (badge.includes('EXPLORER')) return '#00FFFF'; // Cyan
        if (badge.includes('OVERCLOCKED')) return '#FFA500'; // Orange
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
                    LEVEL: {profile.current_level} // FIRST_INTRUSION: {profile.created_at}
                </div>
            </div>

            {/* VITALS */}
            <div className="profile-vitals">
                <div className="vital-stat">
                    <div className="vital-label">TOTAL_ASSETS_EXTRACTED:</div>
                    <div className="vital-value">{profile.total_ebits.toLocaleString()} eBits</div>
                </div>
                <div className="vital-stat">
                    <div className="vital-label">DEEPEST_DIVE (NORMAL):</div>
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
                <div className="section-title">RESONANCE_SIGNATURE:</div>
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
                ⚡ LIVE_DATA // ASYNC_BRIDGE_ACTIVE
            </div>
        </div>
    );
}
