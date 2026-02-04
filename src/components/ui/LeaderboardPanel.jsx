import React, { useState, useEffect } from 'react';
import { getTopScores } from '../../utils/supabase';
import './LeaderboardPanel.css';

/**
 * LEADERBOARD PANEL: Top 100 scoreboard with category tabs
 * Emphasizes Top 3, Top 10, and displays up to Top 100
 */
export default function LeaderboardPanel() {
    const [activeBoard, setActiveBoard] = useState('depth'); // depth | velocity | stealth | etc
    const [modeFilter, setModeFilter] = useState(null); // null (ALL) | normal | hardcore | ghost
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // FETCH FROM SUPABASE
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            // MAP UI TABS TO DATABASE COLUMNS
            let sortColumn = 'score'; // Default (Velocity)
            if (activeBoard === 'depth') sortColumn = 'floor_reached';
            if (activeBoard === 'stealth') sortColumn = 'undetected_floors'; // Using streak (V2 column)
            if (activeBoard === 'stability') sortColumn = 'stability_score'; // (V2 column)
            if (activeBoard === 'ghost') sortColumn = 'ghost_score';         // (V2 column)

            const result = await getTopScores(modeFilter, 100, sortColumn);

            if (result.success) {
                // Map DB schema to UI schema
                const mapped = result.data.map((entry, index) => ({
                    rank: index + 1,
                    username: entry.player_name,
                    score: entry.score,
                    floor: entry.floor_reached,
                    time: entry.run_time,
                    mode: entry.game_mode,
                    // Badges derived from stats
                    badge: entry.score > 50000 ? '[ELITE]' : '[USER]'
                }));
                setLeaderboard(mapped);
            } else {
                setError(result.error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [modeFilter, activeBoard]);

    const boards = [
        { id: 'velocity', label: 'VELOCITY_SCORE', metric: 'Score' },
        { id: 'depth', label: 'DEEPEST_DIVE', metric: 'Floor' },
        { id: 'stealth', label: 'STEALTH_PARTITION', metric: 'Streak' },
        { id: 'stability', label: 'SYSTEM_STABILITY', metric: 'Rating' },
    ];

    const renderTopThree = () => {
        const top3 = leaderboard.slice(0, 3);
        if (top3.length === 0 && !isLoading) return <div className="no-data">NO_RECORDS_FOUND</div>;

        return (
            <div className="leaderboard-top3">
                {top3.map((entry, i) => (
                    <div key={i} className={`top3-card rank-${entry.rank}`}>
                        <div className="top3-rank-icon">
                            {entry.rank === 1 ? '👑' : entry.rank === 2 ? '⬡' : '◇'}
                        </div>
                        <div className="top3-rank">#{entry.rank}</div>
                        <div className="top3-username">{entry.username}</div>
                        <div className="top3-badge">{entry.badge}</div>
                        <div className="top3-score">SCORE: {entry.score}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTopTen = () => {
        const top10 = leaderboard.slice(3, 10);
        if (top10.length === 0) return null;

        return (
            <div className="leaderboard-top10">
                {top10.map((entry) => (
                    <div key={entry.rank} className="top10-row">
                        <div className="top10-rank">#{entry.rank}</div>
                        <div className="top10-username">{entry.username}</div>
                        <div className="top10-badge">{entry.badge}</div>
                        <div className="top10-score">{entry.score}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderRestOfList = () => {
        const rest = leaderboard.slice(10);
        if (rest.length === 0) return null;

        return (
            <div className="leaderboard-rest">
                <div className="rest-header">TOP 11-100:</div>
                {rest.map((entry) => (
                    <div key={entry.rank} className="rest-row">
                        <span className="rest-rank">#{entry.rank}</span>
                        <span className="rest-username">{entry.username}</span>
                        <span className="rest-score">{entry.score}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="leaderboard-panel">
            {/* BOARD TABS */}
            <div className="leaderboard-tabs">
                {boards.map(board => (
                    <button
                        key={board.id}
                        className={`board-tab ${activeBoard === board.id ? 'active' : ''}`}
                        onClick={() => setActiveBoard(board.id)}
                    >
                        {board.label}
                    </button>
                ))}
            </div>

            {/* MODE FILTER */}
            <div className="mode-filter">
                <button
                    className={`filter-btn ${modeFilter === null ? 'active' : ''}`}
                    onClick={() => setModeFilter(null)}
                >
                    ALL
                </button>
                <button
                    className={`filter-btn ${modeFilter === 'normal' ? 'active' : ''}`}
                    onClick={() => setModeFilter('normal')}
                >
                    NORMAL
                </button>
                <button
                    className={`filter-btn ${modeFilter === 'hardcore' ? 'active' : ''}`}
                    onClick={() => setModeFilter('hardcore')}
                >
                    HARDCORE
                </button>
                <button
                    className={`filter-btn ${modeFilter === 'ghost' ? 'active' : ''}`}
                    onClick={() => setModeFilter('ghost')}
                >
                    GHOST
                </button>
            </div>

            {isLoading ? (
                <div className="leaderboard-loading animate-pulse text-cyan">FETCHING_DATA_STREAM...</div>
            ) : error ? (
                <div className="leaderboard-error text-magenta">UPLINK_ERROR: {error}</div>
            ) : (
                <>
                    {/* TOP 3 */}
                    {renderTopThree()}

                    {/* TOP 4-10 */}
                    {renderTopTen()}

                    {/* TOP 11-100 */}
                    {renderRestOfList()}
                </>
            )}

            {/* DATA NOTE */}
            <div className="leaderboard-note">
                ⚡ LIVE_DATA // CONNECTED_TO_SUPABASE_CORE
            </div>
        </div>
    );
}
