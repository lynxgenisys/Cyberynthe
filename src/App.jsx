import React, { useState, useEffect } from 'react';
import './index.css';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { GameProvider, useGame } from './context/GameContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { CombatProvider } from './context/CombatContext';
import { DirectiveEngine } from './engine/DirectiveEngine';
import DebugMazeView from './components/Debug/DebugMazeView';
import CyberdeckUI from './components/ui/CyberdeckUI';
import TrinityHUD from './components/ui/TrinityHUD';
import HUD from './components/ui/HUD';
import Scene3D from './components/3d/Scene';
import AudioManager from './components/systems/AudioManager';
import SplashScreen from './components/ui/SplashScreen';
import RunTracker from './components/systems/RunTracker';

// MEMOIZED COMPONENTS to prevent Context-Thrash Re-renders
const MemoScene = React.memo(() => <Scene3D />);
const MemoHUD = React.memo(() => <HUD />);
const MemoAudio = React.memo(() => <AudioManager />);

const PointerUnlocker = ({ active }) => {
  useEffect(() => {
    if (active) document.exitPointerLock();
  }, [active]);
  return null;
};

function CoreInterface() {
  const { state: playerState, lockResource, healKernel, upgradeStat, applyBonus } = usePlayer();
  const { gameState, advanceFloor, setGameState, loadSession, useQuickSlot, triggerScan } = useGame(); // Added triggerScan
  const { state: invState, addItem } = useInventory();

  // --- GAME STATE ---
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [currentDirective, setCurrentDirective] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // --- MENU STATE ---
  const [isInMenu, setIsInMenu] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [isEnteringName, setIsEnteringName] = useState(false);
  const [nameInput, setNameInput] = useState('GHOST_USER');

  // --- MENU LOGIC ---
  useEffect(() => {
    const saved = localStorage.getItem('CyberSynthe_Save');
    if (saved) setHasSave(true);
  }, []);

  const handleNewGameClick = () => {
    setIsEnteringName(true);
  };

  const confirmNewGame = () => {
    localStorage.removeItem('CyberSynthe_Save'); // Clear old save
    setIsInMenu(false);

    // Set Player Name
    setGameState(prev => ({
      ...prev,
      playerName: nameInput || 'GHOST_USER',
      floorLevel: 1, // Ensure reset
      seed: btoa(Date.now().toString()).substring(0, 16), // Fresh Seed
      runStartTime: Date.now(), // Start Session Timer
      totalPausedTime: 0, // Track cumulative pause duration
      pauseStartTime: null, // Track specific pause instance
      totalDamageTaken: 0, // Reset Stats
      undetectedFloorCount: 0,
      lootedCaches: []
    }));
  };

  const handleResume = () => {
    const saved = localStorage.getItem('CyberSynthe_Save');
    if (saved) {
      loadSession(JSON.parse(saved));
      setIsInMenu(false);
    }
  };

  // --- GAME EFFECTS ---
  // Sync Pause State Effect & Track Pause Duration
  useEffect(() => {
    // CENTRALIZED PAUSE TRIGGERS: Deck, Directives, Lore Logs, or Decryption
    const shouldPause = isDeckOpen || !!activeOffer || !!gameState.activeLoreLog || gameState.isDecrypting;

    setGameState(prev => {
      // EDGE CASE: If already paused state matches, do nothing to prevent timer glitches
      if (prev.isPaused === shouldPause) return prev;

      // PAUSE STARTING
      if (shouldPause) {
        return {
          ...prev,
          isPaused: true,
          pauseStartTime: Date.now()
        };
      }
      // PAUSE ENDING (RESUME)
      else {
        const durationOfPause = prev.pauseStartTime ? (Date.now() - prev.pauseStartTime) : 0;
        return {
          ...prev,
          isPaused: false,
          pauseStartTime: null,
          totalPausedTime: (prev.totalPausedTime || 0) + durationOfPause
        };
      }
    });

  }, [isDeckOpen, activeOffer, gameState.activeLoreLog, gameState.isDecrypting]);

  // HANDLERS
  const handleScan = () => {
    if (lockResource(15)) {
      triggerScan();
    }
  };
  const handleNav = () => advanceFloor();
  const acceptOffer = () => {
    if (activeOffer.id === 'PHYSICAL_MEMORY') {
      // ACCEPT (CYAN PATH)
      // healKernel(20); 
      applyBonus('integrity', 2); // +2 Bonus Levels (Free)
      setGameState(prev => ({ ...prev, ethicsScore: Math.max(0, prev.ethicsScore - 0.2), visualFilter: 'CYAN_TINT' }));
      setActiveOffer(null);
      return;
    }

    if (activeOffer.id === 'BIT_MITE_CHOICE') {
      // ACCEPT (CYAN) - RESET (MERCY)
      applyBonus('clock', 1); // +1 Bonus Speed (Free)
      setGameState(prev => ({ ...prev, ethicsScore: Math.max(0, prev.ethicsScore - 0.2), visualFilter: 'CYAN_TINT' }));
      setActiveOffer(null);
      return;
    }

    setCurrentDirective(activeOffer);
    setActiveOffer(null);
  };

  const declineOffer = () => {
    if (activeOffer && activeOffer.id === 'PHYSICAL_MEMORY') {
      // DECLINE (MAGENTA PATH)
      setGameState(prev => ({ ...prev, ethicsScore: Math.min(1, prev.ethicsScore + 0.2), eBits: prev.eBits + 10, visualFilter: 'MAGENTA_JITTER' }));
      setActiveOffer(null);
      return;
    }

    if (activeOffer && activeOffer.id === 'BIT_MITE_CHOICE') {
      // DECLINE (MAGENTA) - HARVEST (GREED)
      setGameState(prev => ({ ...prev, ethicsScore: Math.min(1, prev.ethicsScore + 0.2), eBits: prev.eBits + 15, visualFilter: 'MAGENTA_JITTER' }));
      setActiveOffer(null);
      return;
    }

    setActiveOffer(null);
  };

  // Keyboard Shortcuts (Deck & Map & Actions)
  useEffect(() => {
    if (gameState.isInMenu) return; // Use gameState instead of local state

    const handleKey = (e) => {
      const k = e.key.toLowerCase();
      // UI TOGGLES
      if (k === 'i') setIsDeckOpen(prev => !prev);
      if (k === 'm' && e.shiftKey) setShowDebug(prev => !prev);

      // ACTIONS
      if (k === 'e') handleScan();
      if (k === '0') handleNav(); // DEBUG: Advance Floor

      // QUICK-SLOT INVENTORY
      if (k === '1') useQuickSlot?.(0);
      if (k === '2') useQuickSlot?.(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState.isInMenu]); // Updated dependency

  // QUEST INPUT (Y/N)
  useEffect(() => {
    if (!activeOffer || isInMenu) return;

    const handleQuestInput = (e) => {
      if (e.key.toLowerCase() === 'y') acceptOffer();
      if (e.key.toLowerCase() === 'n') declineOffer();
    };
    window.addEventListener('keydown', handleQuestInput);
    return () => window.removeEventListener('keydown', handleQuestInput);
  }, [activeOffer, isInMenu]);

  // REACTIVE QUEST TRIGGER
  useEffect(() => {
    if (!isInMenu && gameState.floorLevel > 1) { // Skip spawn on run start

      // FLOOR 2 SPECIAL: PHYSICAL MEMORY
      if (gameState.floorLevel === 2) {
        setActiveOffer({
          id: 'PHYSICAL_MEMORY',
          description: "SYNCHRONIZE PHYSICAL MEMORY?",
          reward: "INTEGRITY++ / eBITS++",
          type: 'BINARY_CHOICE'
        });
        return;
      }

      // FLOOR 7 SPECIAL: FRAGMENTED CITY (BIT MITE CHOICE)
      if (gameState.floorLevel === 7) {
        setActiveOffer({
          id: 'BIT_MITE_CHOICE',
          description: "DYING BIT_MITE DETECTED. ACTION REQUIRED.",
          reward: "SPEED++ / eBITS++",
          type: 'BINARY_CHOICE'
        });
        return;
      }

      // DISABLE RANDOM QUESTS FOR NOW
      // const offer = DirectiveEngine.rollDirective(gameState.floorLevel, gameState.isElite);
      // if (offer) setActiveOffer(offer);
    }
  }, [gameState.floorLevel, isInMenu]);

  const handleSplashStart = (mode) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      isInMenu: false,
      runStartTime: Date.now(),
      floorLevel: 1,
      seed: btoa(Date.now().toString()).substring(0, 16) // Fresh Seed
    }));
  };

  if (gameState.isInMenu) {
    return <SplashScreen onStart={handleSplashStart} hasSave={hasSave} onResume={handleResume} />;
  }

  // GAME RENDER
  return (
    <div className="relative w-full h-screen flex flex-col justify-between z-10 overflow-hidden">

      {/* 3D SCENE BACKGROUND */}
      <MemoScene />
      <MemoAudio /> {/* AUDIO SYSTEM */}
      <RunTracker /> {/* RUN TRACKING & SCORING */}

      {/* GLOBAL HUD LAYER (Pass-through clicks) */}
      <div className="absolute inset-0 pointer-events-none">

        {/* POINTER UNLOCK for Lore Logs */}
        <PointerUnlocker active={!!gameState.activeLoreLog} />

        {/* HUD - Hide when Inventory/Deck is open to prevent clutter */}
        {!isDeckOpen && <MemoHUD />}

        {/* VISUAL FILTERS */}
        {gameState.visualFilter === 'CYAN_TINT' && (
          <div className="absolute inset-0 bg-cyan/5 mix-blend-screen pointer-events-none animate-pulse"></div>
        )}
        {gameState.visualFilter === 'MAGENTA_JITTER' && (
          <div className="absolute inset-0 bg-magenta/1 mix-blend-overlay pointer-events-none animate-[ping_0.2s_infinite]"></div>
        )}
        {gameState.visualFilter === 'QUARANTINE_LUT' && (
          /* Floor 9: Bruised Purple Look */
          <div className="absolute inset-0 bg-fuchsia-900/40 mix-blend-multiply pointer-events-none animate-pulse z-40"></div>
        )}
        {gameState.visualFilter === 'TEXTURE_BLEED' && (
          /* Floor 7: Flickering Noise Overlay */
          <div className="absolute inset-0 bg-white/5 mix-blend-difference pointer-events-none animate-pulse z-40"></div>
        )}

      </div>

      {/* DIRECTIVE OFFER MODAL */}
      {activeOffer && (
        <>
          <PointerUnlocker active={true} />
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
            {activeOffer.id === 'PHYSICAL_MEMORY' ? (
              // PHYSICAL MEMORY (GRADIENT) STYLE
              <div className="bg-gradient-to-br from-cyan/90 to-magenta/90 p-[2px] w-[500px] shadow-[0_0_50px_rgba(0,255,255,0.4)] rounded-lg">
                <div className="bg-black/95 p-8 text-center rounded-md relative overflow-hidden">
                  {/* Background Glitch Effect */}
                  <div className="absolute inset-0 bg-[url('/grid_bg.png')] opacity-20 mix-blend-overlay"></div>

                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta mb-6 tracking-tighter drop-shadow-md">
                    [SYNCHRONIZE_MEMORY]
                  </h2>

                  <div className="text-left text-sm space-y-4 mb-8 font-mono text-gray-200 relative z-10">
                    <p className="italic text-center text-cyan-200">"I remember... proper gravity. I remember having mass."</p>
                    <hr className="border-gray-800" />
                    <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                      <span className="text-cyan font-bold">ACCEPT (Y)</span>
                      <span className="text-xs text-gray-400">+2 Integrity Levels (+20 Max HP)</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                      <span className="text-magenta font-bold">DECLINE (N)</span>
                      <span className="text-xs text-gray-400">+10 eBITS (Reject Weakness)</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 relative z-10 w-full px-8">
                    <button onClick={acceptOffer} className="flex-1 bg-cyan/20 border border-cyan text-cyan py-3 hover:bg-cyan hover:text-black transition-all font-bold tracking-widest shadow-[0_0_15px_#00FFFF] flex flex-col items-center leading-tight">
                      <span className="text-lg">ACCEPT</span>
                      <span className="text-[10px] opacity-70">(Y)</span>
                    </button>
                    <button onClick={declineOffer} className="flex-1 bg-magenta/20 border border-magenta text-magenta py-3 hover:bg-magenta hover:text-black transition-all font-bold tracking-widest shadow-[0_0_15px_#EA00FF] flex flex-col items-center leading-tight">
                      <span className="text-lg">DECLINE</span>
                      <span className="text-[10px] opacity-70">(N)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeOffer.id === 'BIT_MITE_CHOICE' ? (
              // FLOOR 7: FRAGMENTED CITY STYLE (Glitchy)
              <div className="bg-black border-2 border-dashed border-yellow-500/50 p-1 w-[450px] rotate-1 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                <div className="bg-black p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-pulse"></div>
                  <h2 className="text-2xl font-mono font-black text-yellow-500 tracking-tighter mb-4 glitch-text-lg">
                    [ERROR: BIT_MITE_LOOP]
                  </h2>
                  <div className="text-left text-xs font-mono text-gray-300 space-y-4 mb-6 relative z-10">
                    <p>The entity is caught in a logic cycle. It is requesting termination.</p>
                    <hr className="border-yellow-900/50" />
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-cyan/10 p-1 transition-colors">
                      <span className="text-cyan font-bold">[RESET_CYCLE]</span>
                      <span className="text-gray-500">SPEED++ (Mercy)</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-magenta/10 p-1 transition-colors">
                      <span className="text-magenta font-bold">[HARVEST_DATA]</span>
                      <span className="text-gray-500">+15 eBITS (Greed)</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 relative z-10">
                    <button onClick={acceptOffer} className="border border-cyan text-cyan px-6 py-2 hover:bg-cyan hover:text-black transition-all font-bold">RESET</button>
                    <button onClick={declineOffer} className="border border-magenta text-magenta px-6 py-2 hover:bg-magenta hover:text-black transition-all font-bold">HARVEST</button>
                  </div>
                </div>
              </div>
            ) : (
              // STANDARD DIRECTIVE STYLE
              <div className="border border-magenta bg-black p-6 w-[400px] text-center">
                <h2 className="text-xl text-magenta font-bold mb-4">[INPUT_REQUIRED]</h2>
                <div className="text-left text-sm space-y-2 mb-6 font-mono text-gray-300">
                  <p><span className="text-cyan">TASK:</span> {activeOffer.description}</p>
                  <p>
                    <span className="text-yellow-400">REWARD:</span>{' '}
                    {typeof activeOffer.reward === 'string' ? activeOffer.reward : JSON.stringify(activeOffer.reward)}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button onClick={acceptOffer} className="border border-cyan text-cyan px-6 py-2 hover:bg-cyan/20">ACCEPT (Y)</button>
                  <button onClick={declineOffer} className="border border-gray-600 text-gray-600 px-6 py-2 hover:bg-gray-800">DECLINE (N)</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ACTIVE DIRECTIVE HUD */}
      {
        currentDirective && (
          <div className="absolute top-32 left-6 border-l-2 border-magenta pl-2 pointer-events-auto bg-black/50 p-2">
            <p className="text-[10px] text-magenta">ACTIVE DIRECTIVE</p>
            <p className="text-xs text-white">{currentDirective.id}</p>
            <p className="text-[10px] text-gray-400">{currentDirective.description}</p>
          </div>
        )
      }



      {/* LAYERS */}
      {showDebug && <DebugMazeView />}
      {isDeckOpen && <CyberdeckUI onClose={() => setIsDeckOpen(false)} />}

    </div >
  );
}

export default function App() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <GameProvider>
        <InventoryProvider>
          <PlayerProvider>
            <CombatProvider>
              <CoreInterface />
            </CombatProvider>
          </PlayerProvider>
        </InventoryProvider>
      </GameProvider>
    </div>
  );
}
