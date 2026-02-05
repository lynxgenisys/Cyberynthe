import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Lore Fragment Decryption Overlay
 * UI: Fullscreen overlay with typewriter effect & hex background
 */

const LoreOverlay = () => {
    const { gameState, setGameState } = useGame();
    const [displayedText, setDisplayedText] = useState('');
    const [decryptProgress, setDecryptProgress] = useState(0);
    const [hexScroll, setHexScroll] = useState(0);

    const isVisible = gameState.showLoreOverlay && gameState.currentFragment;
    const fragment = gameState.currentFragment;

    // Typewriter effect
    useEffect(() => {
        if (!isVisible || !fragment) {
            setDisplayedText('');
            setDecryptProgress(0);
            return;
        }

        const fullText = fragment.fragmentText || fragment.text || '';
        let currentIndex = 0;

        // Decryption progress animation
        const progressInterval = setInterval(() => {
            setDecryptProgress(prev => Math.min(prev + 2, 100));
        }, 20);

        // Typewriter animation (starts after decrypt progress hits 100%)
        const typewriterTimeout = setTimeout(() => {
            const typewriterInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    setDisplayedText(fullText.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(typewriterInterval);
                }
            }, 36); // 36ms per character (20% slower)

            return () => clearInterval(typewriterInterval);
        }, 1000); // Wait 1s for decrypt animation

        return () => {
            clearInterval(progressInterval);
            clearTimeout(typewriterTimeout);
        };
    }, [isVisible, fragment]);

    // Hex background scroll
    useEffect(() => {
        if (!isVisible) return;

        const scrollInterval = setInterval(() => {
            setHexScroll(prev => (prev + 1) % 100);
        }, 50);

        return () => clearInterval(scrollInterval);
    }, [isVisible]);

    const handleClose = () => {
        setGameState(prev => ({
            ...prev,
            showLoreOverlay: false,
            currentFragment: null,
            isPaused: false
        }));
    };

    // Global keyboard listener for E key
    useEffect(() => {
        if (!isVisible) return;

        const handleKeyPress = (e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isVisible]);

    if (!isVisible) return null;

    // Generate hex background
    const generateHexLines = () => {
        const lines = [];
        for (let i = 0; i < 60; i++) { // Doubled for full coverage
            const hex = Math.random().toString(16).substring(2, 18).toUpperCase();
            lines.push(hex);
        }
        return lines;
    };

    const hexLines = generateHexLines();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            overflow: 'hidden'
        }}>
            {/* Hex background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '200%', // Extended for continuous scroll
                opacity: 0.15, // More visible
                color: '#00FFFF',
                fontSize: '12px',
                lineHeight: '20px',
                whiteSpace: 'pre',
                transform: `translateY(-${hexScroll}px)`,
                pointerEvents: 'none',
                overflow: 'hidden'
            }}>
                {hexLines.map((line, i) => (
                    <div key={i}>{line} {line} {line} {line} {line} {line} {line} {line}</div>
                ))}
            </div>

            {/* Main content container */}
            <div style={{
                width: '90%',
                maxWidth: '800px',
                padding: '40px',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, #00FFFF, #FF00FF) 1',
                borderRadius: '8px',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
                position: 'relative'
            }}>
                {/* Decryption progress bar */}
                <div style={{
                    marginBottom: '30px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#00FFFF',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        [DECRYPTING_FRAGMENT]
                    </div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'rgba(0, 255, 255, 0.2)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${decryptProgress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00FFFF, #FF00FF)',
                            transition: 'width 0.1s linear',
                            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                        }} />
                    </div>
                </div>

                {/* Fragment title */}
                {fragment.title && (
                    <div style={{
                        fontSize: '24px',
                        color: '#FF00FF',
                        marginBottom: '20px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
                    }}>
                        {fragment.title}
                    </div>
                )}

                {/* Fragment text with typewriter effect */}
                <div style={{
                    fontSize: '16px',
                    color: '#FFFFFF',
                    lineHeight: '1.8',
                    minHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '30px'
                }}>
                    {displayedText}
                    {displayedText.length < (fragment.fragmentText || fragment.text || '').length && (
                        <span style={{
                            animation: 'blink 1s infinite',
                            color: '#00FFFF'
                        }}>▊</span>
                    )}
                </div>

                {/* Bonus notification */}
                {fragment.bonusEBits && (
                    <div style={{
                        fontSize: '14px',
                        color: '#FFD700',
                        marginBottom: '20px',
                        textAlign: 'center',
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    }}>
                        [ARCHIVE_BONUS]: +{fragment.bonusEBits} eBITS
                    </div>
                )}

                {/* Close instruction */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#888888',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '20px'
                }}>
                    Press [E] to close
                </div>

                {/* Keyboard listener */}
                <div
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
                            handleClose();
                        }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', outline: 'none' }}
                    autoFocus
                />
            </div>

            {/* Blink animation for cursor */}
            <style>{`
                @keyframes blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default LoreOverlay;
