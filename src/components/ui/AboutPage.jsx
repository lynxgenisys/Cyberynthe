import React, { useState } from 'react';
import { patchNotes } from '../../data/patchNotesData';

const AboutPage = () => {
    const [activeTab, setActiveTab] = useState('archive'); // 'archive' | 'patch_notes'

    const renderArchive = () => (
        <>
            <section className="mb-8">
                <h2 className="text-2xl mb-2 text-yellow-500">{">>"} DIRECTIVE OVERVIEW</h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                    Welcome to Cyberynthe, an endless, procedurally generated dungeon crawler set in a collapsing digital construct. 
                    You are a Ghost Protocol entity tasked with descending through the layers of an infected mainframe. 
                    Scavenge for M-RAM, survive corrupted logic entities, and discover fragments of the lost system.
                </p>
            </section>

            <section className="mb-8 flex gap-8">
                <div className="flex-1 bg-gray-900/50 p-4 border border-cyan/30">
                    <h2 className="text-xl mb-4 text-cyan border-b border-cyan/30 pb-2">{">>"} KEYBOARD MAPPINGS</h2>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><span className="text-white font-bold inline-block w-24">W A S D</span> : Movement</li>
                        <li><span className="text-white font-bold inline-block w-24">Space</span> : Jump</li>
                        <li><span className="text-white font-bold inline-block w-24">Shift</span> : Sprint (Hold)</li>
                        <li><span className="text-white font-bold inline-block w-24">R</span> : Toggle Auto-Run</li>
                        <li><span className="text-white font-bold inline-block w-24">E</span> : Scan Pulse (Uses 10 M-RAM)</li>
                        <li><span className="text-white font-bold inline-block w-24">F</span> : Interact / Dismiss Data</li>
                        <li><span className="text-white font-bold inline-block w-24">I</span> : Open Cyberdeck (Inventory)</li>
                        <li><span className="text-white font-bold inline-block w-24">1, 2</span> : Use Quickslot Items</li>
                        <li><span className="text-white font-bold inline-block w-24">H</span> : Toggle HUD Keymap</li>
                        <li><span className="text-white font-bold inline-block w-24">F11</span> : Fullscreen Mode</li>
                        <li><span className="text-white font-bold inline-block w-24">ESC</span> : Release Mouse / Pause</li>
                    </ul>
                </div>

                <div className="flex-1 bg-gray-900/50 p-4 border border-magenta/30">
                    <h2 className="text-xl mb-4 text-magenta border-b border-magenta/30 pb-2">{">>"} MOUSE BINDINGS</h2>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><span className="text-white font-bold inline-block w-24">Left Click</span> : Fire Standard Ping (Low DMG)</li>
                        <li><span className="text-white font-bold inline-block w-24">Right Click</span> : Fire Shred (Uses 5 M-RAM)</li>
                        <li><span className="text-white font-bold inline-block w-24">Mouse Move</span> : Look Around</li>
                    </ul>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl mb-2 text-yellow-500">{">>"} SURVIVAL TIPS</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                    <li><span className="text-cyan">M-RAM</span> acts as your mana/stamina. Managing it is crucial to using powerful abilities.</li>
                    <li>Look out for glowing <span className="text-yellow-400">yellow cubes</span>; they contain items and hardware upgrades.</li>
                    <li>Red dots on the minimap indicate <span className="text-red-500">hostile entities</span>. Proceed with caution.</li>
                    <li>Your progress, inventory, and stats are saved securely to your cloud profile.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl mb-2 text-yellow-500">{">>"} SCORING MECHANICS</h2>
                <div className="space-y-4 text-sm text-gray-300">
                    <div>
                        <h3 className="text-cyan font-bold">Velocity Score (Distance over Time)</h3>
                        <p>The system assigns a "target par time" for each floor (60s base + 5s per floor depth). If you beat that par time, your score multiplies exponentially. The deeper the floor you speedrun, the higher the multiplier. <br/><span className="text-xs text-gray-500">Formula: Σ ((60s + 5s per floor) / ActualTime) * Floor</span></p>
                    </div>
                    <div>
                        <h3 className="text-cyan font-bold">System Stability (Survival Efficiency)</h3>
                        <p>Rewards descending deep into the maze while taking as close to zero damage as possible and conserving M-RAM injectors. Any damage taken or injectors used severely drops this score. <br/><span className="text-xs text-gray-500">Formula: (CurrentFloor * 1000) / (TotalDamageTaken + (MRAM_Used * 50) + 1)</span></p>
                    </div>
                    <div>
                        <h3 className="text-cyan font-bold">Stealth Partition (Ghost Score)</h3>
                        <p>Exclusive to "Ghost Mode". This measures pure speed and evasion, rewarding clearing as many floors as possible without triggering combat or taking damage. <br/><span className="text-xs text-gray-500">Formula: (TotalFloors * 10000) / TotalTimeInMilliseconds</span></p>
                    </div>
                </div>
            </section>
        </>
    );

    const renderPatchNotes = () => (
        <div className="space-y-8">
            {patchNotes.map((patch, index) => (
                <div key={index} className="border border-cyan/20 bg-black/40 p-6 relative">
                    <div className="absolute top-0 right-0 bg-cyan text-black px-3 py-1 text-xs font-bold">
                        {patch.date}
                    </div>
                    <h3 className="text-2xl text-cyan mb-4">{patch.version}</h3>
                    <div className="space-y-6 text-sm text-gray-300">
                        {Object.entries(patch.categories).map(([category, items]) => (
                            <div key={category}>
                                <h4 className={`text-lg font-bold mb-2 border-b pb-1 
                                    ${category === 'Added' ? 'text-green-400 border-green-400/30' : 
                                      category === 'Fixed' ? 'text-magenta border-magenta/30' : 
                                      category === 'Changed' ? 'text-yellow-500 border-yellow-500/30' : 
                                      'text-blue-400 border-blue-400/30'}`}
                                >
                                    [{category}]
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col p-8 text-cyan bg-black/80 font-mono overflow-y-auto">
            <div className="flex justify-between items-end mb-6 border-b border-cyan/30 pb-4">
                <h1 className="text-4xl font-bold text-magenta glitch-text">[ CYBERYNTHE v0.14.2 ]</h1>
                
                <div className="flex gap-4">
                    <button 
                        className={`px-4 py-2 border transition-colors ${activeTab === 'archive' ? 'border-cyan bg-cyan text-black' : 'border-cyan text-cyan hover:bg-cyan/20'}`}
                        onClick={() => setActiveTab('archive')}
                    >
                        SYSTEM_ARCHIVE
                    </button>
                    <button 
                        className={`px-4 py-2 border transition-colors ${activeTab === 'patch_notes' ? 'border-magenta bg-magenta text-black' : 'border-magenta text-magenta hover:bg-magenta/20'}`}
                        onClick={() => setActiveTab('patch_notes')}
                    >
                        UPDATE_LOG
                    </button>
                </div>
            </div>

            {activeTab === 'archive' ? renderArchive() : renderPatchNotes()}
        </div>
    );
};

export default AboutPage;
