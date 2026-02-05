import React from 'react';
import { useGame } from '../../context/GameState';
import ChromaticContainer from './ChromaticContainer';
import TriBeadBadge from './TriBeadBadge';

const ScalesOfAmbiguity = () => {
    const { ethicsScore, factions } = useGame();

    // Determine final title based on score
    const getTitle = () => {
        if (ethicsScore < 0.3) return "THE ARCHITECT OF ORDER";
        if (ethicsScore > 0.7) return "THE HEART OF CHAOS";
        return "THE BALANCED PROXY";
    };

    const getDescription = () => {
        if (ethicsScore < 0.3) return "You sacrificed humanity for stability. The city runs on time, but no one smiles.";
        if (ethicsScore > 0.7) return "You burned the systems to warm the people. Freedom reigns, but so does entropy.";
        return "You walked the razor's edge. History will not remember you, and that is a victory.";
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent mb-8 animate-pulse text-center">
                SIMULATION CONCLUDED
            </h1>

            <ChromaticContainer className="max-w-3xl w-full p-8 bg-white/5 flex flex-col items-center gap-8">
                <div className="text-center">
                    <h2 className="text-2xl text-white font-bold tracking-widest border-b border-white/20 pb-4 mb-4">
                        {getTitle()}
                    </h2>
                    <p className="text-gray-300 font-mono italic">
                        "{getDescription()}"
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Ethics Scale */}
                    <div className="bg-black/40 p-4 rounded border border-white/10">
                        <h3 className="text-cyan text-xs font-bold mb-4 uppercase text-center">Ethics Calibration</h3>
                        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan to-magenta transition-all duration-1000"
                                style={{ width: `${ethicsScore * 100}%` }}
                            />
                            {/* Marker for "Global Average" */}
                            <div className="absolute top-0 bottom-0 w-1 bg-white left-1/2 opacity-50" />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                            <span>PURE LOGIC</span>
                            <span>GLOBAL AVG</span>
                            <span>PURE EMOTION</span>
                        </div>
                    </div>

                    {/* Faction Standing */}
                    <div className="bg-black/40 p-4 rounded border border-white/10 flex flex-col items-center justify-center">
                        <h3 className="text-magenta text-xs font-bold mb-4 uppercase text-center">Faction Standing</h3>
                        <TriBeadBadge />
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-8 py-3 border border-white/30 text-white hover:bg-white/10 hover:border-white transition-all tracking-widest text-sm"
                >
                    [ REBOOT KERNEL ]
                </button>

            </ChromaticContainer>
        </div>
    );
};

export default ScalesOfAmbiguity;
