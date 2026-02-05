/**
 * SCORING UTILITIES
 * Calculations for Velocity, Stability, and Ghost scores
 */

/**
  * Calculate Velocity Score
 * Formula: Σ (TargetTime_Floor / ActualTime_Floor) × FloorLevel
 * 
 * @param {Array} floorTimes - Array of {floor, startTime, endTime}
 * @returns {number} Velocity score
 */
export function calculateVelocityScore(floorTimes) {
    if (!floorTimes || floorTimes.length === 0) return 0;

    let totalScore = 0;

    floorTimes.forEach(({ floor, startTime, endTime }) => {
        const actualTime = (endTime - startTime) / 1000; // Convert to seconds

        // Target time scales with floor (60s base + 5s per floor)
        const targetTime = 60 + (floor * 5);

        // Calculate contribution
        const floorScore = (targetTime / actualTime) * floor;
        totalScore += floorScore;
    });

    return Math.round(totalScore * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate Stability Score
 * Formula: (CurrentFloor × 1000) / (TotalDamageTaken + (M-RAM_Used × 50) + 1)
 * 
 * @param {number} currentFloor - Current floor level
 * @param {number} totalDamage - Total damage taken
 * @param {number} mramUsed - Number of M-RAM injectors used
 * @returns {number} Stability score
 */
export function calculateStabilityScore(currentFloor, totalDamage, mramUsed) {
    const score = (currentFloor * 1000) / (totalDamage + (mramUsed * 50) + 1);
    return Math.round(score * 100) / 100;
}

/**
 * Calculate Ghost Score (True Ghost Mode)
 * Formula: TotalFloors × 10000 / TotalTimeMs
 * 
 * @param {number} totalFloors - Total floors cleared
 * @param {number} totalTimeMs - Total time in milliseconds
 * @returns {number} Ghost score
 */
export function calculateGhostScore(totalFloors, totalTimeMs) {
    if (totalTimeMs === 0) return 0;
    const score = (totalFloors * 10000) / totalTimeMs;
    return Math.round(score * 100) / 100;
}

/**
 * Get player level from XP
 * @param {number} xp - Total experience points
 * @returns {number} Player level
 */
export function getLevelFromXP(xp) {
    return Math.floor(1 + Math.sqrt(xp / 100));
}

/**
 * Get next level XP requirement
 * @param {number} currentLevel - Current player level
 * @returns {number} XP needed for next level
 */
export function getNextLevelXP(currentLevel) {
    return (currentLevel + 1) ** 2 * 100;
}

/**
 * Determine badge tier based on percentile rank
 * @param {number} percentile - Percentile rank (0-100)
 * @returns {string} Badge tier
 */
export function getBadgeTier(percentile) {
    if (percentile >= 99) return 'elite';
    if (percentile >= 90) return 'gold';
    if (percentile >= 75) return 'silver';
    if (percentile >= 50) return 'bronze';
    return 'none';
}

/**
 * Get badge name for category and tier
 * @param {string} category - 'depth' | 'velocity' | 'stealth' | 'stability' | 'ghost'
 * @param {string} tier - 'bronze' | 'silver' | 'gold' | 'elite'
 * @returns {string} Badge name
 */
export function getBadgeName(category, tier) {
    const badges = {
        depth: {
            bronze: '[USER]',
            silver: '[EXPLORER]',
            gold: '[DEEP_DIVER]',
            elite: '[VOID_WALKER]'
        },
        velocity: {
            bronze: '[PROCESS]',
            silver: '[THREAD]',
            gold: '[OVERCLOCKED]',
            elite: '[ZERO_DAY_THREAT]'
        },
        stealth: {
            bronze: '[GUEST]',
            silver: '[LURKER]',
            gold: '[PHANTOM]',
            elite: '[GHOST_DATA]'
        },
        stability: {
            bronze: '[DEBUGGED]',
            silver: '[OPTIMIZED]',
            gold: '[CLEAN_CODE]',
            elite: '[SYSTEM_ARCHITECT]'
        },
        ghost: {
            bronze: '[SIGNAL]',
            silver: '[FREQUENCY]',
            gold: '[WAVEFORM]',
            elite: '[PURE_DATA]'
        }
    };

    return badges[category]?.[tier] || '[USER]';
}
