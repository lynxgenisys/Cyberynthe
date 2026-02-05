import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useGame } from '../../context/GameContext';
import TriBeadBadge from './TriBeadBadge'; // Assuming this exists or reusing placeholder logic

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Render Trinity HUD (Radial)
 */

const RadialGauge = ({ value, max, color, label }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const percentage = value / max;
    const offset = circumference - (percentage * circumference);

    return (
        <div className="relative flex flex-col items-center">
            <svg width="60" height="60" className="rotate-[-90deg]">
                {/* Background Circle */}
                <circle cx="30" cy="30" r={radius} fill="none" stroke="#111" strokeWidth="4" />
                {/* Progress Circle */}
                <circle
                    cx="30" cy="30" r={radius} fill="none"
                    stroke={color} strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-300"
                />
            </svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                {Math.floor(value)}
            </span>
            <span className="text-[9px] text-gray-400 mt-1">{label}</span>
        </div>
    );
};

export default function TrinityHUD() {
    const { state: playerState } = usePlayer();
    const { gameState } = useGame();

    // Hide in Ghost mode (no RPG stats)
    if (gameState.gameMode === 'ghost') {
        return null;
    }

    const isScrubbing = playerState.stats.mRamCurrent < playerState.stats.mRamMax;

    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">

            {/* TOP CENTER: VELOCITY BAR */}
            <div className="flex justify-center">
                <div className="bg-black/50 backdrop-blur border-b border-cyan/30 px-6 py-2 flex gap-4 items-center">
                    <span className="text-xs text-cyan tracking-widest">VELOCITY</span>
                    <div className="w-64 h-1 bg-gray-800 relative">
                        {/* Ghost Marker (Magenta) */}
                        <div className="absolute top-0 bottom-0 w-1 bg-magenta left-[60%] opacity-50"></div>
                        {/* Player Marker (Cyan) */}
                        <div className="absolute top-0 bottom-0 w-1 bg-cyan left-[40%] shadow-[0_0_5px_cyan]"></div>
                    </div>
                </div>
            </div>

            {/* TOP RIGHT: TRINITY GAUGES */}
            <div className="absolute top-6 right-6 flex gap-4 items-center bg-black/60 p-2 rounded border border-gray-800">
                <RadialGauge
                    value={playerState.stats.currentIntegrity}
                    max={playerState.stats.integrity}
                    color="#00FFFF"
                    label="INTEGRITY"
                />
                <RadialGauge
                    value={playerState.stats.mRamCurrent}
                    max={playerState.stats.mRamMax}
                    color={isScrubbing ? "#EA00FF" : "#3b82f6"}
                    label="M-RAM"
                />
                <div className="flex flex-col items-center">
                    <div className="text-xl font-bold text-white">{playerState.stats.clockSpeed}</div>
                    <span className="text-[9px] text-gray-400">Hz CLOCK</span>
                </div>
            </div>

            {/* BOTTOM RIGHT: MORAL RESONANCE */}
            <div className="absolute bottom-6 right-6">
                <div className="w-24 h-24 border border-gray-800 bg-black/80 relative clip-triangle">
                    <div className="absolute bottom-2 left-2 text-[8px] text-cyan">CYAN</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-magenta">MAGENTA</div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-white">VOID</div>

                    {/* The Dot */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                </div>
                <div className="text-right text-[9px] text-gray-500 mt-1">RESONANCE_MAP</div>
            </div>

        </div>
    );
}
