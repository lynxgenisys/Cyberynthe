import React from 'react';
import { useGame } from '../../context/GameState';
import ChromaticContainer from './ChromaticContainer';

const DilemmaInterface = () => {
    const { activeDilemma, resolveDilemma } = useGame();

    if (!activeDilemma) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ChromaticContainer className="max-w-2xl w-full p-8 bg-black/90">
                <h2 className="text-3xl font-bold mb-2 text-white border-b border-white/20 pb-4">
                    &gt; {activeDilemma.title}
                </h2>

                <p className="text-lg text-gray-300 font-mono mb-8 leading-relaxed">
                    {activeDilemma.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeDilemma.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => resolveDilemma(option)}
                            className={`
                relative group p-6 border transition-all duration-300
                ${option.type === 'cyan'
                                    ? 'border-cyan text-cyan hover:bg-cyan/10'
                                    : 'border-magenta text-magenta hover:bg-magenta/10'
                                }
              `}
                        >
                            <div className="text-xl font-bold mb-2 tracking-wider">
                                [{option.label}]
                            </div>
                            <div className="text-xs text-white/50 group-hover:text-white/80">
                                &gt;&gt; CAUTION: {option.consequence}
                            </div>
                        </button>
                    ))}
                </div>
            </ChromaticContainer>
        </div>
    );
};

export default DilemmaInterface;
