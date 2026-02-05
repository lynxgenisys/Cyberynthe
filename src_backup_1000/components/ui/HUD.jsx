import React, { useEffect, useState, useMemo, memo } from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import { MiniMap } from './MiniMap';
import QuickSlots from './QuickSlots';
import LoreOverlay from './LoreOverlay';
import ChargingReticle from './ChargingReticle';

// --- MEMOIZED HUD SUB-COMPONENTS ---

const CompassStrip = memo(() => {
    const { playerRotationRef } = useGame();
    const stripRef = React.useRef();

    React.useEffect(() => {
        let frameId;
        const update = () => {
            if (playerRotationRef && stripRef.current) {
                const rot = playerRotationRef.current;
                let deg = (rot * 180) / Math.PI;
                const pxPerDeg = 2;
                const totalWidth = 720;
                const offset = ((deg * pxPerDeg) % totalWidth + totalWidth) % totalWidth;
                stripRef.current.style.transform = `translateX(${offset}px)`;
            }
            frameId = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, [playerRotationRef]);

    return (
        <div
            className="relative w-[750px] h-10 overflow-hidden border-x-2 border-cyan-500/50 bg-black/25 backdrop-blur mx-auto mt-2 rounded-lg flex items-center shadow-lg shadow-cyan-500/10"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
        >
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-magenta z-10 shadow-[0_0_10px_#EA00FF]"></div>
            <div ref={stripRef} className="absolute top-0 bottom-0 left-1/2 flex items-center justify-center will-change-transform">
                {[-2, -1, 0, 1, 2].map(offset => (
                    <div key={offset} className="absolute h-full w-[720px]" style={{ left: `${offset * -720}px` }}>
                        {['N', 'W', 'S', 'E'].map((dir, i) => {
                            let colorClass = 'text-green-500';
                            if (dir === 'N') colorClass = 'text-red-500';
                            if (dir === 'S') colorClass = 'text-blue-500';
                            return (
                                <div
                                    key={dir}
                                    className={`absolute top-1 w-12 -ml-6 text-center font-bold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${colorClass}`}
                                    style={{ left: `${i * 180}px` }}
                                >
                                    {dir}
                                </div>
                            );
                        })}
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className={`absolute bottom-0 w-0.5 bg-cyan-700 ${i % 3 === 0 ? 'h-3 bg-cyan-500' : 'h-1.5'}`} style={{ left: `${i * 30}px` }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
});

const BossDialogue = memo(({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [charIndex, setCharIndex] = useState(0);
    const audioCtxRef = React.useRef(null);

    const playChime = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    useEffect(() => { playChime(); }, [text]);

    useEffect(() => {
        if (text && charIndex === 0) setDisplayedText('');
        if (charIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[charIndex]);
                setCharIndex(prev => prev + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [charIndex, text]);

    useEffect(() => {
        setDisplayedText('');
        setCharIndex(0);
    }, [text]);

    return (
        <div className="absolute top-64 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl text-center pointer-events-none">
            <div className="inline-block bg-black/40 px-8 py-4 border-y-2 border-magenta/40 backdrop-blur-sm shadow-[0_0_20px_rgba(234,0,255,0.2)]">
                <div className="text-xs text-gray-400 font-mono tracking-widest mb-1 text-left border-b border-gray-700/30 pb-1">
                    [SENTINEL_COMM_LOG]
                </div>
                <div className="text-fuchsia-300 font-mono text-lg tracking-[0.1em] font-bold shadow-black drop-shadow-md min-h-[1.5em]">
                    {displayedText}<span className="animate-blink text-magenta">_</span>
                </div>
            </div>
        </div>
    );
});

const SessionTimer = memo(({ startTime, totalPausedTime, isPaused, pauseStartTime }) => {
    const [timeStr, setTimeStr] = useState("00:00:00");

    useEffect(() => {
        if (!startTime) return;

        const updateTimer = () => {
            const now = Date.now();
            // Net Time = Current - Start - TotalPaused - (CurrentRunningPause)
            const currentPauseDuration = (isPaused && pauseStartTime) ? (now - pauseStartTime) : 0;
            const elapsed = now - startTime - (totalPausedTime || 0) - currentPauseDuration;

            // Format HH:MM:SS
            const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
            const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
            // Milliseconds for "Doomsday" flicker
            const ms = Math.floor((elapsed % 1000) / 10).toString().padStart(2, '0');

            setTimeStr(`${h}:${m}:${s}:${ms}`);
        };

        const interval = setInterval(updateTimer, 50); // fast update for milliseconds
        updateTimer();
        return () => clearInterval(interval);
    }, [startTime, totalPausedTime, isPaused, pauseStartTime]);

    // Doomsday Style: Green Digital LED, Monospace, Glowing
    return (
        <div className="font-mono text-xl font-bold text-green-500 tracking-widest drop-shadow-[0_0_8px_#00FF00] bg-black/80 px-4 py-0.5 rounded-full border border-green-500/30 backdrop-blur-md flex items-center gap-2">
            <span className="text-[10px] text-green-800 animate-pulse">T-MINUS</span>
            <span>{timeStr}</span>
        </div>
    );
});

const TopBar = memo(({ sectorId, seed, floorLevel, runStartTime, totalPausedTime, isPaused, pauseStartTime }) => (
    <div className="absolute top-1 z-30 flex items-center gap-4 animate-fade-in-down">
        <div className="text-[10px] text-gray-400 font-mono tracking-widest bg-black/80 px-2 py-0.5 rounded border border-gray-800/50 backdrop-blur-sm">
            <span>SECTOR {sectorId}</span>
            <span className="text-magenta">//</span>
            <span>SEED: {seed}</span>
        </div>

        <div className="flex gap-2">
            <div className="text-base font-bold text-blue-400 tracking-widest drop-shadow-[0_0_5px_rgba(0,100,255,0.8)] bg-black/60 px-3 py-0.5 rounded-full border border-blue-500/20 backdrop-blur-md">
                FLOOR {floorLevel.toString().padStart(4, '0')}
            </div>

            {/* DOOMSDAY CLOCK SESSION TIMER */}
            <SessionTimer
                startTime={runStartTime}
                totalPausedTime={totalPausedTime}
                isPaused={isPaused}
                pauseStartTime={pauseStartTime}
            />
        </div>
    </div>
));

const BossHealthBar = memo(({ active, name, hp, maxHp }) => {
    if (!active) return null;
    return (
        <div className="absolute top-16 z-20 w-[500px] animate-fade-in-down flex flex-col items-center">
            <div className="flex justify-between w-full text-cyan font-bold text-xs mb-1 tracking-widest drop-shadow-[0_0_5px_#00FFFF]">
                <span>{name}</span>
                <span>{(hp / maxHp * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-black/80 border border-cyan/50 skew-x-[-10deg] p-[1px]">
                <div
                    className="h-full bg-cyan transition-all duration-200 ease-out shadow-[0_0_15px_#00FFFF]"
                    style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
                />
            </div>
        </div>
    );
});

const StatMeters = memo(({ hp, maxHp, ram, maxRam, ethicsScore }) => (
    <div className="flex flex-col justify-center gap-3 p-4 min-w-[300px]">
        <div className="w-full">
            <div className="flex justify-between items-end text-cyan font-mono text-[10px] tracking-widest mb-1">
                <span>INTEGRITY</span>
                <span className="font-bold">{Math.floor(hp)} / {maxHp}</span>
            </div>
            <div className="h-3 w-full bg-black/60 border border-cyan/30 skew-x-[-15deg] p-[2px]">
                <div
                    className={`h-full bg-cyan shadow-[0_0_10px_#00FFFF] transition-all duration-300 ease-out ${hp < 30 ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
                />
            </div>
        </div>
        <div className="w-full">
            <div className="flex justify-between items-end text-magenta font-mono text-[10px] tracking-widest mb-1">
                <span>M-RAM</span>
                <span className="font-bold">{Math.floor(ram)} / {maxRam}</span>
            </div>
            <div className="h-3 w-full bg-black/60 border border-magenta/30 skew-x-[-15deg] p-[2px]">
                <div
                    className="h-full bg-magenta shadow-[0_0_10px_#EA00FF] transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(0, (ram / maxRam) * 100)}%` }}
                />
            </div>
        </div>
        <div className="flex items-center gap-2 mt-1 opacity-80">
            <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                <div
                    className="w-full h-[1px] bg-white transition-transform duration-500"
                    style={{ transform: `rotate(${(ethicsScore || 0.5) * 180}deg)` }}
                />
            </div>
            <span className="text-[9px] text-gray-500 font-mono tracking-widest">LOGIC_ALIGNMENT</span>
        </div>
    </div>
));

const XPAndEbits = memo(({ currentLevel, xp, eBits, lastScanTriggered }) => (
    <div className="absolute right-0 top-0 h-full flex items-stretch z-10">
        <div className="relative flex flex-col justify-center min-h-[80px] w-64">
            <div className="absolute inset-0 bg-black/80 border border-blue-500/30 border-r-0 border-l-0 backdrop-blur-sm -z-10" style={{ maskImage: 'linear-gradient(to left, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)' }} />
            <div className="text-right pr-4">
                <div className="flex justify-end gap-3 text-[10px] text-blue-500/80">
                    <span>ACCESS_LEVEL</span>
                    <span className="text-blue-300 font-bold">Lvl: {currentLevel}</span>
                </div>
                <span className="text-xl text-blue-500 font-mono font-bold">{xp || 0} XP</span>
            </div>
        </div>
        {lastScanTriggered && (
            <div className="absolute top-20 right-10 text-green-500 font-bold bg-black px-2 border border-green-500 z-50">SCAN TRIGGERED!</div>
        )}
        <div className="bg-black/80 p-4 border border-yellow-500/30 border-l-0 backdrop-blur-sm rounded-r-2xl flex items-center gap-3 min-h-[80px]">
            <div className="text-right">
                <div className="text-[10px] text-yellow-500/80">AVAIALBLE_CREDITS</div>
                <span className="text-2xl text-yellow-500 font-mono font-bold">{eBits}</span>
            </div>
            <div className="w-1 h-8 bg-yellow-500/20"></div>
            <span className="text-xs text-yellow-500">eBITS</span>
        </div>
    </div>
));

const NotificationLog = memo(({ logs }) => {
    const renderMessage = (text) => {
        const parts = text.split(/(\+\d+\s*(?:XP|eBITS))/g);
        return parts.map((part, index) => {
            if (/XP/.test(part)) return <span key={index} className="text-blue-500 font-bold">{part}</span>;
            if (/eBITS/.test(part)) return <span key={index} className="text-yellow-500 font-bold">{part}</span>;
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="w-96 flex flex-col-reverse gap-1 items-start justify-end pointer-events-none mask-image-linear-gradient mb-28">
            {logs.map((log, i) => {
                let baseColor = "text-cyan-glow border-cyan";
                if (/THREAT|NEUTRALIZED|KILL|HOSTILE/.test(log.msg)) baseColor = "text-red-500 border-red-500";
                else if (/ITEM|STORED|INVENTORY|CACHE/.test(log.msg)) baseColor = "text-green-500 border-green-500";
                return (
                    <div key={`${log.id}-${i}`} className={`text-xs font-mono px-2 py-1 bg-black/60 border-l-2 ${baseColor} animate-fade-in-up`}>
                        <span className="text-gray-500 mr-2">[{new Date(log.time).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]</span>
                        {renderMessage(log.msg)}
                    </div>
                );
            })}

        </div>
    );
});

// ResonanceMap Removed (Superseded by MiniMap)

export default function HUD() {
    const { gameState, addNotification, unlockKernel, triggerInteract, getLevelFromXP } = useGame();
    const { state: playerState } = usePlayer();

    // Derived Stats (Memoized to prevent unnecessary re-calc)
    const stats = useMemo(() => ({
        hp: playerState.stats.currentIntegrity,
        maxHp: playerState.stats.integrity,
        ram: playerState.stats.mRamCurrent,
        maxRam: playerState.stats.mRamMax,
        currentLevel: getLevelFromXP(gameState.xp || 0)
    }), [playerState.stats, gameState.xp, getLevelFromXP]);

    const logs = useMemo(() => [...gameState.notifications].reverse(), [gameState.notifications]);

    // SCRAMBLE ANIMATION
    const [scramble, setScramble] = useState(0);
    const hasScrambledRef = React.useRef(false);
    useEffect(() => {
        if (gameState.floorLevel === 1 && !hasScrambledRef.current) {
            setScramble(1);
            hasScrambledRef.current = true;
        }
    }, [gameState.floorLevel]);
    useEffect(() => {
        if (scramble > 0) {
            const timer = setTimeout(() => setScramble(0), 2500);
            return () => clearTimeout(timer);
        }
    }, [scramble]);

    // KEY LISTENERS
    useEffect(() => {
        if (gameState.activeLoreLog) {
            const handleCloseKey = (e) => {
                if (e.code === 'KeyQ') {
                    e.preventDefault();
                    unlockKernel();
                }
            };
            window.addEventListener('keydown', handleCloseKey);
            return () => window.removeEventListener('keydown', handleCloseKey);
        }
    }, [gameState.activeLoreLog, unlockKernel]);

    useEffect(() => {
        const handleInteractKey = (e) => {
            if (e.code === 'KeyR' && !gameState.activeLoreLog && triggerInteract) triggerInteract();
        };
        window.addEventListener('keydown', handleInteractKey);
        return () => window.removeEventListener('keydown', handleInteractKey);
    }, [gameState.activeLoreLog, triggerInteract]);

    const hudStyle = scramble > 0 ? {
        filter: `blur(${scramble * 4}px) contrast(${1 + scramble}) hue-rotate(${scramble * 90}deg)`,
        transform: `scale(${1 + scramble * 0.1})`,
        opacity: 1 - (scramble * 0.5),
        transition: 'all 3s cubic-bezier(0.1, 0.7, 1.0, 0.1)'
    } : { transition: 'all 0.5s ease-out' };

    return (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between" style={hudStyle}>
            <div className="relative w-full h-24 flex justify-center pointer-events-auto">
                <TopBar
                    sectorId={gameState.sectorId}
                    seed={gameState.seed}
                    floorLevel={gameState.floorLevel}
                    runStartTime={gameState.runStartTime}
                    totalPausedTime={gameState.totalPausedTime}
                    isPaused={gameState.isPaused}
                    pauseStartTime={gameState.pauseStartTime}
                />
                <div className="absolute top-10 z-20"><CompassStrip /></div>
                <BossHealthBar {...gameState.bossEncounter} />

                {gameState.floorLevel === 4 && !gameState.isTransitioning && (
                    <>
                        <style>{`@keyframes scanVertical { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .scan-line { animation: scanVertical 4s linear infinite; }`}</style>
                        <div className="absolute w-full h-[2px] bg-red-500 shadow-[0_0_20px_#FF0000] scan-line z-[40] pointer-events-none" />
                        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-red-950/80 px-4 py-1 border border-red-500 text-red-100 text-xs font-mono tracking-widest animate-pulse z-[40] pointer-events-none shadow-[0_0_10px_#FF0000]">[AUDIT_IN_PROGRESS]</div>
                    </>
                )}

                {gameState.bossSubtitle && (Date.now() - gameState.bossSubtitle.timestamp < gameState.bossSubtitle.duration) && (
                    <BossDialogue text={gameState.bossSubtitle.text} />
                )}

                <div className="absolute left-0 top-0 h-full flex items-stretch z-10">
                    <div className="bg-black/80 p-4 border border-cyan/30 border-r-0 backdrop-blur-sm rounded-l-2xl flex flex-col justify-center min-h-[80px]">
                        <h1 className="text-xl font-bold text-cyan-glow tracking-widest animate-pulse leading-none mb-1">CYBERYNTHE</h1>
                        <span className="text-xs text-cyan font-mono tracking-wider">PROTOCOL_V4</span>
                    </div>
                    <StatMeters hp={stats.hp} maxHp={stats.maxHp} ram={stats.ram} maxRam={stats.maxRam} ethicsScore={gameState.ethicsScore} />
                </div>

                <XPAndEbits currentLevel={stats.currentLevel} xp={gameState.xp} eBits={gameState.eBits} lastScanTriggered={gameState.lastScanTime && (Date.now() - gameState.lastScanTime < 1000)} />
            </div>

            <div className="flex justify-between items-end w-full">
                <NotificationLog logs={logs} />
                <MiniMap />

                {gameState.scanningState?.active && (
                    <div className="absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none z-50">
                        <div className="text-sm font-bold text-yellow-500 font-mono tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_#FFD700]">SCANNING_DATA...</div>
                        <div className="w-64 h-2 bg-black/80 border border-yellow-500/50 backdrop-blur-sm relative overflow-hidden rounded-full">
                            <div className="h-full bg-yellow-500 relative transition-all duration-75 ease-linear shadow-[0_0_15px_#FFD700]" style={{ width: `${(gameState.scanningState.progress || 0) * 100}%` }} />
                        </div>
                        <div className="text-xs text-yellow-500/80 font-mono">{((gameState.scanningState.progress || 0) * 100).toFixed(0)}% DECRYPTED</div>
                    </div>
                )}
            </div>

            {gameState.interactionPrompt && !gameState.activeLoreLog && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-12 h-12 border-2 border-cyan rounded-full flex items-center justify-center mb-2 bg-black/50 backdrop-blur"><span className="text-xl font-bold text-cyan font-mono">R</span></div>
                        <div className="text-sm font-bold text-cyan font-mono tracking-widest bg-black/80 px-3 py-1 border border-cyan/50">{gameState.interactionPrompt.replace("[R] ", "")}</div>
                    </div>
                </div>
            )}

            {gameState.activeLoreLog && (
                <div className="absolute inset-0 bg-black/90 z-[100] flex items-center justify-center pointer-events-auto backdrop-blur-sm animate-fade-in">
                    <div className="max-w-3xl w-full p-8 border-y-2 border-cyan/50 bg-black relative">
                        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-mono tracking-widest">[SYSTEM_NOTICE]: ROOT_PERMISSION_ELEVATED</span>
                                <h1 className="text-2xl text-cyan-glow font-bold tracking-tighter mt-1">{gameState.activeLoreLog.title}</h1>
                            </div>
                            <div className="text-xs text-magenta font-mono animate-pulse">ENCRYPTION_BROKEN</div>
                        </div>
                        <div className="text-lg text-gray-300 font-mono leading-relaxed whitespace-pre-wrap min-h-[200px]">{gameState.activeLoreLog.text}</div>
                        <div className="mt-8 text-center">
                            <button className="text-sm text-cyan font-bold tracking-[0.2em] hover:text-white transition-colors animate-pulse" onClick={unlockKernel}>[PRESS [Q] TO CLOSE]</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick-Slot Inventory */}
            <QuickSlots />

            {/* Lore Fragment Overlay */}
            <LoreOverlay />

            {/* Data Spike v2 Charging Reticle */}
            <ChargingReticle
                isCharging={gameState.isChargingWeapon || false}
                critTimestamp={gameState.critSignal}
            />
        </div>
    );
}
