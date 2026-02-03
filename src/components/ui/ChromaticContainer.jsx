import React from 'react';
import { useGame } from '../../context/GameContext';

const ChromaticContainer = ({ children, className = '' }) => {
    const { gameState } = useGame();
    const ethicsScore = gameState.ethicsScore || 0.5;

    // Dynamic styles based on ethics score
    // Low score (Logic) -> Cyan glow
    // High score (Heart) -> Magenta glow
    // Ethics score is 0.0 to 1.0

    const cyanOpacity = (1 - ethicsScore).toFixed(2);
    const magentaOpacity = ethicsScore.toFixed(2);

    const containerStyle = {
        // Dynamic border/shadow using CSS variables or direct rgba
        boxShadow: `0 0 20px rgba(0, 255, 255, ${cyanOpacity * 0.5}), 0 0 20px rgba(255, 0, 255, ${magentaOpacity * 0.5})`,
        borderColor: ethicsScore < 0.5 ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 0, 255, 0.5)'
    };

    return (
        <div
            className={`relative border rounded-lg backdrop-blur-md transition-all duration-1000 ${className}`}
            style={containerStyle}
        >
            {/* Background tint overlay */}
            <div
                className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-1000"
                style={{
                    background: `linear-gradient(135deg, rgba(0,255,255,${cyanOpacity * 0.1}) 0%, rgba(255,0,255,${magentaOpacity * 0.1}) 100%)`
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ChromaticContainer;
