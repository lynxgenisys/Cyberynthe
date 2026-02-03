import React from 'react';
import { useGame } from '../../context/GameState';

const TriBeadBadge = () => {
    const { factions } = useGame();

    const getBeadColor = (value) => {
        if (value > 20) return 'bg-cyan shadow-[0_0_10px_cyan]';
        if (value < -20) return 'bg-red-500 shadow-[0_0_10px_red]';
        return 'bg-gray-500';
    };

    return (
        <div className="flex gap-4 p-4 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${getBeadColor(factions.privacy)}`} />
                <span className="text-[10px] text-gray-400 mt-1">PRIVACY</span>
            </div>
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${getBeadColor(factions.progress)}`} />
                <span className="text-[10px] text-gray-400 mt-1">PROGRESS</span>
            </div>
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${getBeadColor(factions.power)}`} />
                <span className="text-[10px] text-gray-400 mt-1">POWER</span>
            </div>
        </div>
    );
};

export default TriBeadBadge;
