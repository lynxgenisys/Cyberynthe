import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext'; // Import Player Context
import ChromaticContainer from './ChromaticContainer';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Render the Cyberdeck Interface
 */

// StatRow definition moved to bottom


export default function CyberdeckUI({ onClose }) {
    const { state, equipItem, unequipItem } = useInventory();
    const { gameState, getLevelFromXP, getNextLevelXP, cycleNavMode, triggerExitRun } = useGame();
    const { state: playerState, upgradeStat } = usePlayer();

    // UI Local State
    const [selectedItem, setSelectedItem] = useState(null);

    // FORCE UNLOCK POINTER ON OPEN
    React.useEffect(() => {
        document.exitPointerLock();
    }, []);

    // LEVELING MATH
    const level = getLevelFromXP(gameState.xp || 0);
    const totalPoints = (level - 1) * 2;
    // Defensive check for allocations
    const spentPoints = Object.values(playerState.allocations || { integrity: 0, mRam: 0, clock: 0, regen: 0 }).reduce((a, b) => a + b, 0);
    const availablePoints = totalPoints - spentPoints;

    // ATTACK STATS CALCULATION
    const baseSpikeDmg = 2 + (level * 1.5);
    const burstDmg = baseSpikeDmg * 1.5; // Rough estimate for burst multiplier if applicable, or just per bullet
    const canBurst = level >= 5;

    // HANDLERS
    const handleBackpackClick = (item) => {
        if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null); // Deselect
        } else {
            setSelectedItem(item);
        }
    };

    const handleSlotClick = (index) => {
        const slotItem = gameState.inventorySlots[index];

        if (selectedItem) {
            // Equip selected item to this slot
            equipItem(selectedItem, 'active', index);
            setSelectedItem(null);
        } else if (slotItem) {
            // Unequip item from this slot
            unequipItem(index);
        }
    };

    // TOOLTIP STATE
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (hoveredItem) {
                setMousePos({ x: e.clientX, y: e.clientY });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [hoveredItem]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-sm">
            {/* TOOLTIP OVERLAY */}
            {hoveredItem && (
                <div
                    className="fixed z-[100] pointer-events-none border border-cyan/50 bg-black/90 p-3 shadow-[0_0_15px_rgba(0,255,255,0.3)] max-w-[250px]"
                    style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
                >
                    <div className="text-cyan font-bold text-xs mb-1 tracking-widest">{hoveredItem.name}</div>
                    <div className="text-[10px] text-white font-mono leading-tight">{hoveredItem.description}</div>
                    {hoveredItem.rarity && <div className="text-[9px] text-magenta mt-2 uppercase tracking-wider">[{hoveredItem.rarity}]</div>}
                </div>
            )}
            {/* WIDENED CONTAINER: max-w-[90vw] for ultra-wide feel */}
            <ChromaticContainer className="w-full max-w-[90vw] h-[90vh] flex flex-col pointer-events-auto p-8">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b border-cyan/30 pb-4 mb-6">
                    <h2 className="text-2xl text-cyan-glow font-bold tracking-widest">CYBERDECK_V1.0 // {gameState.playerName}</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (window.confirm("TERMINATE_SESSION? Progress on current floor will be archived.")) {
                                    triggerExitRun(); // Trigger manual exit signal
                                }
                            }}
                            className="text-red-500 hover:text-white font-mono text-lg border border-red-900/50 px-3 hover:bg-red-600/20 transition-all"
                        >
                            [EXIT_RUN]
                        </button>
                        <button onClick={onClose} className="text-magenta hover:text-white font-mono text-lg">[CLOSE_DECK]</button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex flex-1 gap-8 overflow-hidden mb-6">

                    {/* LEFT: KERNEL ARCHITECTURE (Stats) */}
                    <div className="w-1/4 flex flex-col gap-6 border-r border-gray-800 pr-8">
                        <div>
                            <h3 className="text-sm text-cyan font-bold tracking-widest mb-1">KERNEL_ARCH</h3>
                            <div className="text-xs text-gray-500 font-mono mb-2">LEVEL {level} // {gameState.xp} XP</div>

                            {/* XP PROGRESS BAR */}
                            <div className="w-full h-2 bg-gray-900 relative border border-gray-700">
                                <div
                                    className="h-full bg-cyan-500 shadow-[0_0_8px_#00FFFF]"
                                    style={{ width: `${Math.min(100, Math.max(0, ((gameState.xp - getNextLevelXP(level - 1)) / (getNextLevelXP(level) - getNextLevelXP(level - 1))) * 100))}%` }}
                                />
                            </div>
                        </div>

                        {/* NAV MODE TOGGLE */}
                        <div className="border border-cyan/50 bg-black/40 p-3 flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-cyan font-bold">NAV_SYSTEM</div>
                                <div className="text-sm text-white font-mono">{gameState.navSettings.mode}</div>
                            </div>
                            <button
                                onClick={cycleNavMode}
                                className="bg-cyan/10 text-cyan text-xs px-3 py-1 hover:bg-cyan hover:text-black font-bold border border-cyan transition-colors"
                            >
                                [CYCLE]
                            </button>
                        </div>

                        {/* POINTS DISPLAY */}
                        <div className={`text-sm font-mono border border-gray-700 p-3 text-center ${availablePoints > 0 ? 'text-yellow-500 border-yellow-500 animate-pulse bg-yellow-900/10' : 'text-gray-600'}`}>
                            UNALLOCATED_POINTS: {availablePoints}
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto">
                            {/* INTEGRITY */}
                            <StatRow
                                label="INTEGRITY"
                                value={playerState.stats.integrity}
                                alloc={(playerState.allocations?.integrity || 0) + (playerState.bonuses?.integrity || 0)}
                                canUpgrade={availablePoints > 0}
                                onUpgrade={() => upgradeStat('integrity')}
                                color="cyan"
                            />
                            {/* M-RAM */}
                            <StatRow
                                label="M-RAM_CAP"
                                value={playerState.stats.mRamMax}
                                alloc={(playerState.allocations?.mRam || 0) + (playerState.bonuses?.mRam || 0)}
                                canUpgrade={availablePoints > 0}
                                onUpgrade={() => upgradeStat('mRam')}
                                color="magenta"
                            />
                            {/* CLOCK SPEED */}
                            <StatRow
                                label="CLOCK_SPD"
                                value={playerState.stats.clockSpeed + '%'}
                                alloc={(playerState.allocations?.clock || 0) + (playerState.bonuses?.clock || 0)}
                                canUpgrade={availablePoints > 0}
                                onUpgrade={() => upgradeStat('clock')}
                                color="green-500"
                            />
                            {/* REGEN */}
                            <StatRow
                                label="SCRUB_RATE"
                                value={playerState.stats.mRamRegenBase.toFixed(1) + '/s'}
                                alloc={(playerState.allocations?.regen || 0) + (playerState.bonuses?.regen || 0)}
                                canUpgrade={availablePoints > 0}
                                onUpgrade={() => upgradeStat('regen')}
                                color="blue-500"
                            />
                        </div>
                    </div>

                    {/* CENTER: ACTIVE MEMORY */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-12">
                        {/* ACTIVE THREADS (HOTKEYS) */}
                        <div>
                            <h3 className="text-sm text-center text-magenta font-mono mb-4 tracking-[0.2em]">[ACTIVE_THREADS // HOTKEYS]</h3>
                            <div className="flex gap-8">
                                {gameState.inventorySlots.map((slot, i) => (
                                    <div
                                        key={`active-${i}`}
                                        onClick={() => handleSlotClick(i)}
                                        onMouseEnter={(e) => {
                                            if (slot) {
                                                setHoveredItem(slot);
                                                setMousePos({ x: e.clientX, y: e.clientY }); // Immediate Sync
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`w-32 h-32 border-2 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 relative
                                            ${selectedItem ? 'border-yellow-500 animate-pulse bg-yellow-900/10' : 'border-magenta/50 hover:bg-magenta/10 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]'}
                                            ${slot ? 'bg-magenta/5' : ''}
                                        `}
                                    >
                                        <span className="absolute top-2 left-2 text-[10px] text-magenta font-bold">KEY_{i + 1}</span>
                                        {slot ? (
                                            <>
                                                <div className="w-12 h-12 bg-magenta mb-2 rounded-sm shadow-[0_0_15px_#EA00FF]"></div>
                                                <span className="text-sm font-mono font-bold text-white">{slot.name}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600 font-mono">EMPTY_SLOT</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 text-center mt-4 font-mono tracking-wide">
                                {selectedItem ? ">> SELECT SLOT TO EQUIP <<" : "CLICK SLOT TO UNEQUIP"}
                            </div>
                        </div>

                        {/* PASSIVE DAEMONS */}
                        <div className="flex gap-6 opacity-60 pointer-events-none grayscale">
                            {state.slots.passive.map((slot, i) => (
                                <div key={`passive-${i}`} className="w-24 h-24 border border-blue-500/30 flex flex-col items-center justify-center p-2 text-center bg-black/50">
                                    <span className="text-[10px] text-blue-400 mb-1">DAEMON_{i}</span>
                                    {slot ? <span className="text-xs">{slot.name}</span> : <span className="text-[10px] text-gray-700">NULL</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: BACKPACK (GRID) */}
                    <div className="w-1/3 flex flex-col gap-4 pl-8 border-l border-gray-800">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm text-gray-400 font-bold tracking-widest">STORAGE_PARTITION</h3>
                            <span className={`text-xs font-mono ${state.overhead > 10 ? 'text-magenta animate-pulse' : 'text-gray-500'}`}>
                                SYS_OVERHEAD: {state.overhead}%
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            {state.backpack.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleBackpackClick(item)}
                                    onMouseEnter={(e) => {
                                        setHoveredItem(item);
                                        setMousePos({ x: e.clientX, y: e.clientY }); // Immediate Sync
                                    }}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`aspect-square border p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 relative group
                                        ${selectedItem && selectedItem.id === item.id
                                            ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_10px_#FFD700]'
                                            : 'border-gray-800 bg-gray-900/80 hover:border-cyan hover:bg-gray-800 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]'}
                                    `}
                                >
                                    <div className="w-6 h-6 bg-gray-600 mb-2 rounded-sm group-hover:bg-cyan-500 transition-colors"></div>
                                    <span className="text-[10px] break-words leading-tight text-gray-300 group-hover:text-white">{item.name}</span>
                                </div>
                            ))}
                            {/* Empty Slots Filler */}
                            {Array(24 - state.backpack.length).fill(0).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square border border-gray-800/20 bg-black/20"></div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* BOTTOM: COMBAT ANALYTICS PANEL */}
                <div className="h-32 border-t border-gray-800 pt-3 flex gap-3">
                    <div className="text-cyan font-bold tracking-widest text-[10px] text-center opacity-50 flex items-center w-4 writing-mode-vertical rotate-180">
                        {/* Vertical text takes less horizontal space */}
                        ANALYTICS
                    </div>

                    <div className="flex-1 grid grid-cols-5 gap-2">
                        {/* ATTACK 1: DATA SPIKE */}
                        <div className="border border-green-500/30 bg-green-900/10 p-3 flex flex-col justify-between">
                            <div>
                                <h4 className="text-green-400 font-bold text-xs mb-1">DATA_SPIKE [LMB]</h4>
                                <div className="text-[9px] text-gray-400">Standard Projectile</div>
                            </div>
                            <div className="flex justify-between items-end text-xs font-mono mt-1">
                                <div className="text-green-300">DMG: {baseSpikeDmg.toFixed(1)}</div>
                                <div className="text-blue-400">COST: 10</div>
                            </div>
                        </div>

                        {/* ATTACK 2: BIT FLIP (RMB) */}
                        <div className={`border p-3 flex flex-col justify-between transition-all duration-500 ${level >= 5 ? 'border-magenta/60 bg-magenta/20 shadow-[0_0_10px_#FF00FF]' : 'border-magenta/30 bg-magenta/5 type-v1'}`}>
                            <div>
                                <h4 className="text-magenta font-bold text-xs mb-1">{level >= 5 ? "BIT_FLIP_V2 [RMB]" : "BIT_FLIP_V1 [RMB]"}</h4>
                                <div className="text-[9px] text-gray-400">{level >= 5 ? "Viral DOT / Shred" : "Standard Driver"}</div>
                            </div>
                            <div className="flex justify-between items-end text-xs font-mono mt-1">
                                <div className="text-magenta">DMG: {level >= 5 ? "DOT" : "BASE"}</div>
                                <div className="text-blue-400">COST: 5</div>
                            </div>
                        </div>

                        {/* ATTACK 3: BURST THREAD */}
                        <div className={`border p-3 flex flex-col justify-between ${canBurst ? 'border-orange-500/30 bg-orange-900/10' : 'border-gray-800 bg-black/50 opacity-50 grayscale'}`}>
                            <div>
                                <h4 className="text-orange-400 font-bold text-xs mb-1">BURST_THREAD [HOLD]</h4>
                                <div className="text-[9px] text-gray-400">{canBurst ? "High-Velocity Burst" : "LOCKED (REQ: LVL 5)"}</div>
                            </div>
                            <div className="flex flex-col gap-0.5 text-[10px] font-mono mt-1">
                                <div className="flex justify-between"><span className="text-orange-300">DMG:</span> <span>{canBurst ? burstDmg.toFixed(1) : "-"}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">CHARGE:</span> <span className="text-green-400">{(1.0 / ((100 + (playerState.stats.clockSpeed * 3)) / 100)).toFixed(2)}s</span></div>
                            </div>
                        </div>

                        {/* ATTACK 4: SCAN PULSE */}
                        <div className="border border-cyan/30 bg-cyan-900/10 p-3 flex flex-col justify-between">
                            <div>
                                <h4 className="text-cyan font-bold text-xs mb-1">SCAN_PULSE [E]</h4>
                                <div className="text-[9px] text-gray-400">Area Reveal / Map Sync</div>
                            </div>
                            <div className="flex justify-between items-end text-xs font-mono mt-1">
                                <div className="text-cyan-300">RNG: {gameState.scannerLevel * 15}m</div>
                                <div className="text-blue-400">COST: 10</div>
                            </div>
                        </div>

                        {/* SESSION METRICS */}
                        <div className="border border-gray-700 bg-gray-900/30 p-3 flex flex-col justify-between">
                            <div>
                                <h4 className="text-white font-bold text-xs mb-1">SESSION_METRIC</h4>
                                <div className="text-[9px] text-gray-400">Leaderboard Target</div>
                            </div>
                            <div className="flex flex-col gap-0.5 text-[10px] font-mono mt-1">
                                <div className="flex justify-between"><span className="text-gray-500">TIME:</span> <span className="text-white">{gameState.runStartTime ? new Date(Date.now() - gameState.runStartTime).toISOString().substr(11, 8) : "00:00:00"}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">DMG:</span> <span className="text-red-400">-{gameState.totalDamageTaken || 0}</span></div>
                            </div>
                        </div>

                    </div>
                </div>

            </ChromaticContainer>
        </div>
    );
}

const StatRow = ({ label, value, alloc, canUpgrade, onUpgrade, color }) => (
    <div className={`border border-${color}/30 bg-black/40 p-2 flex justify-between items-center transition-colors hover:bg-${color}/5`}>
        <div>
            <div className={`text-[10px] text-${color} font-bold opacity-80`}>{label}</div>
            <div className="text-base text-white font-mono font-bold tracking-wider">{value}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-gray-500 font-mono">+{alloc} LVL</div>
            {canUpgrade && (
                <button
                    onClick={onUpgrade}
                    className="bg-yellow-500 text-black text-[10px] px-3 py-1 hover:bg-yellow-400 font-bold shadow-[0_0_5px_#FFD700]"
                >
                    UPGRADE
                </button>
            )}
        </div>
    </div>
);
