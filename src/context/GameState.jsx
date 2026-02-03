import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameStateProvider = ({ children }) => {
    // 0.0 (Pure Logic/Cyan) to 1.0 (Pure Emotion/Magenta)
    const [ethicsScore, setEthicsScore] = useState(0.5);

    // Faction Reputation: -100 to 100
    const [factions, setFactions] = useState({
        privacy: 0,
        progress: 0,
        power: 0
    });

    // Adjust ethics score safely between 0 and 1
    const shiftEthics = (amount) => {
        setEthicsScore(prev => {
            const next = Math.max(0, Math.min(1, prev + amount));
            return next;
        });
    };

    const updateReputation = (faction, amount) => {
        setFactions(prev => ({
            ...prev,
            [faction]: Math.max(-100, Math.min(100, prev[faction] + amount))
        }));
    };

    const getDominantColor = () => {
        return ethicsScore > 0.5 ? 'magenta' : 'cyan';
    };

    const [activeDilemma, setActiveDilemma] = useState(null);

    // Procedural Dilemma Generator
    const generateDilemma = (level) => {
        const pool = [
            { t: "DATA LEAK", d: "Encrypted packet found.", o1: "DECRYPT", o2: "DELETE" },
            { t: "ROGUE AI", d: "Sentient code fragment detected.", o1: "MERGE", o2: "ISOLATE" },
            { t: "NETWORK ROT", d: "Infrastructure decaying.", o1: "PATCH", o2: "REBUILD" },
            { t: "USER GHOST", d: "Echo of a deleted user.", o1: "RESTORE", o2: "PURGE" },
            { t: "FIREWALL BREACH", d: "Unauthorized access attempt.", o1: "ALLOW", o2: "BLOCK" }
        ];

        const template = pool[Math.min(level - 1, pool.length - 1)] || pool[Math.floor(Math.random() * pool.length)];

        return {
            id: `lvl_${level}_${Date.now()}`,
            title: `SECTOR ${level}: ${template.t}`,
            description: `Analyzing Sector ${level} Node... ${template.d} logic(CYAN) vs emotion(MAGENTA) protocols required.`,
            options: [
                {
                    label: template.o2, // Cyan/Logic
                    type: 'cyan',
                    consequence: "System stability increased. Individual autonomy decreased.",
                    ethicsChange: -0.15,
                    reputation: { privacy: 10, progress: -5, power: 15 }
                },
                {
                    label: template.o1, // Magenta/Emotion
                    type: 'magenta',
                    consequence: "New variables introduced. Stability compromised.",
                    ethicsChange: 0.15,
                    reputation: { privacy: -10, progress: 15, power: -5 }
                }
            ]
        };
    };

    const triggerDilemma = (id) => {
        // Generate a dilemma based on current level on the fly
        const newDilemma = generateDilemma(currentLevel);
        setActiveDilemma(newDilemma);
    };

    const [resolvedCount, setResolvedCount] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [isGameOver, setGameOver] = useState(false);

    // For now, let's just cycle dilemmas or randomize them if we run out.
    // Or just end game after X levels.
    const WIN_LEVEL = 10;

    const resolveDilemma = (option) => {
        shiftEthics(option.ethicsChange);
        Object.entries(option.reputation).forEach(([faction, val]) => {
            updateReputation(faction, val);
        });
        setActiveDilemma(null);

        const newCount = resolvedCount + 1;
        setResolvedCount(newCount);

        if (currentLevel >= WIN_LEVEL) {
            setGameOver(true);
        } else {
            setCurrentLevel(prev => prev + 1);
        }
    };

    return (
        <GameContext.Provider value={{
            ethicsScore,
            factions,
            activeDilemma,
            isGameOver,
            currentLevel,
            shiftEthics,
            updateReputation,
            getDominantColor,
            triggerDilemma,
            resolveDilemma
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
