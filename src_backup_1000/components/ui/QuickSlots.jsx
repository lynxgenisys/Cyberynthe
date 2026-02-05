import React from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Quick-Slot Inventory Display
 * UI: Two item slots activated by Keys 1 & 2
 */

const QuickSlots = () => {
    const { gameState, useQuickSlot } = useGame();
    const { restoreRam, healKernel } = usePlayer();

    const slots = gameState.inventorySlots || [null, null];

    const handleSlotClick = (index) => {
        const item = slots[index];
        if (!item) return;

        // Bridge Logic: GameContext cannot access PlayerContext, so we trigger effects here
        if (item.type === 'MRAM_INJECTOR') {
            restoreRam(40);
            healKernel(40);
        }

        useQuickSlot(index);
    };

    const getSlotColor = (item) => {
        if (!item) return '#333333';
        return item.color || '#00FFFF';
    };

    const getSlotBorderColor = (item) => {
        if (!item) return '#555555';

        // Color based on rarity/type
        if (item.type === 'SECTOR_BREACH' || item.type === 'CORE_SWAP') return '#FF00FF'; // Anomaly
        if (item.type === 'GHOST_PROTOCOL' || item.type === 'SYSTEM_PING' || item.type === 'KERNEL_SPIKE') return '#8800FF'; // Rare
        return item.color || '#00FFFF';
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            fontFamily: 'monospace',
            zIndex: 100
        }}>
            {slots.map((item, index) => (
                <div
                    key={index}
                    style={{
                        width: '80px',
                        height: '80px',
                        border: `2px solid ${getSlotBorderColor(item)}`,
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        position: 'relative',
                        cursor: item ? 'pointer' : 'default',
                        boxShadow: item ? `0 0 15px ${getSlotBorderColor(item)}40` : 'none',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleSlotClick(index)}
                >
                    {/* Key binding label */}
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        fontSize: '10px',
                        color: '#888888',
                        fontWeight: 'bold'
                    }}>
                        {index + 1}
                    </div>

                    {/* Item content */}
                    {item ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px'
                        }}>
                            {/* Item icon (colored square for now) */}
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: getSlotColor(item),
                                borderRadius: '2px',
                                boxShadow: `0 0 10px ${getSlotColor(item)}80`,
                                marginBottom: '4px'
                            }} />

                            {/* Item name */}
                            <div style={{
                                fontSize: '9px',
                                color: '#FFFFFF',
                                textAlign: 'center',
                                lineHeight: '10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%'
                            }}>
                                {item.name || 'Unknown'}
                            </div>

                            {/* Stack count */}
                            {item.count && item.count > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    fontSize: '12px',
                                    color: '#00FFFF',
                                    fontWeight: 'bold',
                                    textShadow: '0 0 4px #00FFFF'
                                }}>
                                    x{item.count}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#333333',
                            fontSize: '24px'
                        }}>
                            ·
                        </div>
                    )}

                    {/* Hover tooltip */}
                    {item && (
                        <div style={{
                            position: 'absolute',
                            bottom: '90px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            border: `1px solid ${getSlotBorderColor(item)}`,
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            zIndex: 1000
                        }}
                            className="tooltip"
                        >
                            {item.description || 'No description'}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default QuickSlots;
