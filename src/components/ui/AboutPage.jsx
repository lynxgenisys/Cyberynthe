import React from 'react';

const AboutPage = () => {
    return (
        <div className="w-full h-full flex flex-col p-8 text-cyan bg-black/80 font-mono overflow-y-auto">
            <h1 className="text-4xl font-bold mb-6 text-magenta glitch-text">[ CYBERYNTHE v0.12.0 ]</h1>
            
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

        </div>
    );
};

export default AboutPage;
