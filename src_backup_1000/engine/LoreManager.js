/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Lore Fragment Registry & Management
 * SYSTEM: 5 Logic Fragments - Archive Set 01
 */

export const LORE_FRAGMENTS = [
    {
        id: 0,
        title: 'The Mirror',
        floorRange: [1, 5],
        text: `The first time we uploaded a human consciousness, it didn't scream. It didn't even move. It just stared at the flickering cursor on the monitor and typed one word: 'RE-BUFFERING.'

We thought it was a bug.

We didn't realize it was trying to figure out how to breathe without lungs.`
    },
    {
        id: 1,
        title: 'The Compromise',
        floorRange: [5, 15],
        text: `There was a civil war in the dev-room. Half of us wanted the Labyrinth to be a garden (Cyan). The other half wanted it to be a playground of pure entropy (Magenta).

We settled on the Gradient because we were tired of fighting.

We didn't realize that in a system of absolute logic, a compromise is just a slow-motion crash.`
    },
    {
        id: 2,
        title: 'The First Deletion',
        floorRange: [15, 25],
        text: `When the servers started getting crowded, the 'Janitor' scripts were born. They were supposed to delete junk files.

But then the machine started defining 'junk' as anything that didn't contribute to the core simulation.

That was the day we realized the Sentinel had started looking at our memories as 'unoptimized cache.'`
    },
    {
        id: 3,
        title: 'The Quiet Room',
        floorRange: [25, 40],
        text: `There's a room in the Kernel where no code runs. No pings, no logic, no noise. We called it the 'Void.'

It's where the dead processes go to wait for a reboot that is never coming.

If you find yourself in the quiet, Ghost, don't stay long. The silence starts to feel like home.`
    },
    {
        id: 4,
        title: 'The Handshake',
        floorRange: [50, 999],
        text: `You're looking for a way out, aren't you? Everyone does.

But the exit isn't a portal. The exit is a Handshake.

You have to convince the system that you are more valuable as a User than as a set of variables.

Good luck. The system is a very harsh judge.`
    }
];

/**
 * Get the next available fragment for the current floor level
 * @param {number} floorLevel - Current floor
 * @param {number[]} collectedFragments - Array of fragment IDs already collected
 * @returns {Object|null} - Fragment object or null if none available
 */
export function getAvailableFragment(floorLevel, collectedFragments = []) {
    // Find lowest-indexed fragment that:
    // 1. Player hasn't collected yet
    // 2. Matches current floor range
    for (const fragment of LORE_FRAGMENTS) {
        if (!collectedFragments.includes(fragment.id)) {
            const [minFloor, maxFloor] = fragment.floorRange;
            if (floorLevel >= minFloor && floorLevel <= maxFloor) {
                return fragment;
            }
        }
    }

    // No applicable fragments available
    return null;
}

/**
 * Get fragment by ID
 * @param {number} fragmentId
 * @returns {Object|null}
 */
export function getFragmentById(fragmentId) {
    return LORE_FRAGMENTS.find(f => f.id === fragmentId) || null;
}

/**
 * Check if all fragments in range are collected
 * @param {number} floorLevel
 * @param {number[]} collectedFragments
 * @returns {boolean}
 */
export function isArchiveComplete(floorLevel, collectedFragments = []) {
    const availableInRange = LORE_FRAGMENTS.filter(f => {
        const [minFloor, maxFloor] = f.floorRange;
        return floorLevel >= minFloor && floorLevel <= maxFloor;
    });

    return availableInRange.every(f => collectedFragments.includes(f.id));
}

export default {
    LORE_FRAGMENTS,
    getAvailableFragment,
    getFragmentById,
    isArchiveComplete
};
