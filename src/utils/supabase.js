import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Leaderboard functionality will be disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Submit a run to the leaderboard
 * @param {Object} runData - { player_name, score, floor_reached, run_time, game_mode }
 */
export async function submitScore(runData) {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .insert([runData]);

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error submitting score:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Fetch top scores for the leaderboard
 * @param {string} mode - Optional game mode filter
 * @param {number} limit - Number of records to fetch
 */
export async function getTopScores(mode = null, limit = 10) {
    try {
        let query = supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (mode) {
            query = query.eq('game_mode', mode);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error fetching scores:", err);
        return { success: false, error: err.message };
    }
}
