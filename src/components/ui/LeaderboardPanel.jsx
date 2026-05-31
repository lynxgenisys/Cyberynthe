import React, { useState, useEffect } from 'react';
import { getTopScores, getTopAccomplishments, getGlobalAverageGhostRunTime } from '../../utils/supabase';
import ProfileCard from './ProfileCard';
import './LeaderboardPanel.css';

const DESCRIPTIONS = {
    velocity: "Velocity Score: Measures Distance over Time with a heavily weighted curve.",
    depth: "Deepest Dive: Maximum floor reached before termination.",
    kills: "Most Kills: Maximum number of enemies purged during a single run.",
    stealth: "Stealth Partition (Ghost Score): Measures undetected progression speed across all cleared floors.",
    tot_kills: "Lifetime Kills: Total number of enemies purged across all runs.",
    tot_runs: "Total Runs: Total number of sessions initiated.",
    tot_deaths: "Total Deaths: Total number of times the session was terminated."
};

/**
 * LEADERBOARD PANEL: Top 100 scoreboard with category tabs
 */
export default function LeaderboardPanel() {
    // Top-Level Tabs: NORMAL, HARDCORE, GHOST, ACCOMPLISHMENTS
    const [activeMode, setActiveMode] = useState('normal'); 
    
    // Sub-tabs depending on Mode
    const [activeMetric, setActiveMetric] = useState('velocity'); 

    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUsername, setSelectedUsername] = useState(null);
    const [globalGhostAvg, setGlobalGhostAvg] = useState(null);

    const handleUserClick = (userId, username) => {
        if (!userId) return; // Ghost users might not have IDs
        setSelectedUserId(userId);
        setSelectedUsername(username);
    };

    // When mode changes, ensure metric is valid for that mode
    useEffect(() => {
        if (activeMode === 'accomplishments') {
            if (['tot_kills', 'tot_runs', 'tot_deaths'].indexOf(activeMetric) === -1) {
                setActiveMetric('tot_kills');
            }
        } else if (activeMode === 'ghost') {
            if (['velocity', 'depth', 'stealth'].indexOf(activeMetric) === -1) {
                setActiveMetric('velocity');
            }
        } else {
            if (['velocity', 'depth', 'kills'].indexOf(activeMetric) === -1) {
                setActiveMetric('velocity');
            }
        }
    }, [activeMode]);

    // FETCH FROM SUPABASE
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            if (activeMode === 'accomplishments') {
                let sortCol = 'total_kills';
                if (activeMetric === 'tot_runs') sortCol = 'total_runs';
                if (activeMetric === 'tot_deaths') sortCol = 'total_deaths';

                const result = await getTopAccomplishments(sortCol, 100);
                if (result.success) {
                    const mapped = result.data.map((entry, index) => {
                        let scoreDisplay = entry[sortCol] || 0;
                        return {
                            rank: index + 1,
                            username: entry.hacker_id || 'UNKNOWN_ID',
                            userId: entry.id,
                            score: scoreDisplay,
                            badge: (entry[sortCol] || 0) > 1000 ? '[ELITE]' : '[USER]'
                        };
                    });
                    setLeaderboard(mapped);
                } else {
                    setError(result.error);
                }
            } else {
                let sortColumn = 'score'; // Default (Velocity)
                if (activeMetric === 'depth') sortColumn = 'floor_reached';
                if (activeMetric === 'stealth') sortColumn = 'ghost_score'; 
                if (activeMetric === 'kills') sortColumn = 'session_kills'; 

                const result = await getTopScores(activeMode, 100, sortColumn);

                if (result.success) {
                    const mapped = result.data.map((entry, index) => ({
                        rank: index + 1,
                        username: entry.player_name,
                        userId: entry.user_id,
                        score: entry[sortColumn] || 0,
                        badge: entry.score > 50000 ? '[ELITE]' : '[USER]'
                    }));
                    setLeaderboard(mapped);
                } else {
                    setError(result.error);
                }
            }
            
            if (activeMode === 'ghost') {
                const avgResult = await getGlobalAverageGhostRunTime();
                if (avgResult.success) {
                    setGlobalGhostAvg(avgResult.averageMs);
                }
            } else {
                setGlobalGhostAvg(null);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [activeMode, activeMetric]);

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
                        <div 
                            className="top3-username cursor-pointer hover:text-cyan hover:underline transition-colors"
                            onClick={() => handleUserClick(entry.userId, entry.username)}
                        >
                            {entry.username}
                        </div>
                        <div className="top3-badge">{entry.badge}</div>
                        <div className="top3-score">{entry.score}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderList = (startIndex, endIndex, header = null) => {
        const list = leaderboard.slice(startIndex, endIndex);
        if (list.length === 0) return null;

        return (
            <div className={startIndex === 3 ? "leaderboard-top10" : "leaderboard-rest"}>
                {header && <div className="rest-header">{header}</div>}
                {list.map((entry) => (
                    <div key={entry.rank} className={startIndex === 3 ? "top10-row" : "rest-row"}>
                        <div className={startIndex === 3 ? "top10-rank" : "rest-rank"}>#{entry.rank}</div>
                        <div 
                            className={`${startIndex === 3 ? "top10-username" : "rest-username"} cursor-pointer hover:text-cyan hover:underline transition-colors`}
                            onClick={() => handleUserClick(entry.userId, entry.username)}
                        >
                            {entry.username}
                        </div>
                        {startIndex === 3 && <div className="top10-badge">{entry.badge}</div>}
                        <div className={startIndex === 3 ? "top10-score" : "rest-score"}>{entry.score}</div>
                    </div>
                ))}
            </div>
        );
    };

    if (selectedUserId) {
        return (
            <div className="leaderboard-panel relative h-full flex flex-col items-center justify-center">
                <button 
                    className="absolute top-4 left-4 z-50 border border-magenta text-magenta px-8 py-3 hover:bg-magenta hover:text-black font-mono text-base md:text-lg shadow-[0_0_15px_#EA00FF] transition-colors font-bold"
                    onClick={() => setSelectedUserId(null)}
                >
                    BACK_TO_LEDGER
                </button>
                <div className="w-full flex-1 overflow-y-auto mt-12 flex justify-center">
                    <ProfileCard targetUserId={selectedUserId} targetUsername={selectedUsername} />
                </div>
            </div>
        );
    }

    // Top Tabs
    const topTabs = [
        { id: 'normal', label: 'NORMAL' },
        { id: 'hardcore', label: 'HARDCORE' },
        { id: 'ghost', label: 'GHOST' },
        { id: 'accomplishments', label: 'ACCOMPLISHMENTS' }
    ];

    // Sub Tabs generator
    let subTabs = [];
    if (activeMode === 'accomplishments') {
        subTabs = [
            { id: 'tot_kills', label: 'TOTAL KILLS' },
            { id: 'tot_runs', label: 'TOTAL RUNS' },
            { id: 'tot_deaths', label: 'TOTAL DEATHS' }
        ];
    } else if (activeMode === 'ghost') {
        subTabs = [
            { id: 'velocity', label: 'VELOCITY SCORE' },
            { id: 'depth', label: 'DEEPEST DIVE' },
            { id: 'stealth', label: 'STEALTH PARTITION' }
        ];
    } else {
        subTabs = [
            { id: 'velocity', label: 'VELOCITY SCORE' },
            { id: 'depth', label: 'DEEPEST DIVE' },
            { id: 'kills', label: 'MOST KILLS' }
        ];
    }

    return (
        <div className="leaderboard-panel">
            {/* MODE FILTER (Now Top Level) */}
            <div className="mode-filter">
                {topTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`filter-btn ${activeMode === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveMode(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* BOARD TABS (Now Sub Level) */}
            <div className="leaderboard-tabs">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`board-tab ${activeMetric === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveMetric(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* DESCRIPTION LINE */}
            <div className="text-cyan text-xl md:text-2xl font-mono mb-6 text-center px-4 max-w-[400px] mx-auto min-h-[3rem] flex items-center justify-center animate-pulse leading-snug">
                {DESCRIPTIONS[activeMetric]}
            </div>

            {globalGhostAvg !== null && activeMode === 'ghost' && (
                <div className="text-yellow-500 text-xs font-mono mb-4 text-center px-4">
                    GLOBAL_GHOST_AVERAGE: {(globalGhostAvg / 1000).toFixed(1)}s
                </div>
            )}

            {isLoading ? (
                <div className="leaderboard-loading animate-pulse text-cyan">FETCHING_DATA_STREAM...</div>
            ) : error ? (
                <div className="leaderboard-error text-magenta">UPLINK_ERROR: {error}</div>
            ) : (
                <>
                    {/* TOP 3 */}
                    {renderTopThree()}
                    {/* TOP 4-10 */}
                    {renderList(3, 10)}
                    {/* TOP 11-100 */}
                    {renderList(10, 100, "TOP 11-100:")}
                </>
            )}

            {/* DATA NOTE */}
            <div className="leaderboard-note">
                ⚡ LIVE_DATA // CONNECTED_TO_SUPABASE_CORE
            </div>
        </div>
    );
}
