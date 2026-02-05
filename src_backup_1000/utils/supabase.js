import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Leaderboard functionality will be disabled.");
} else {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
    }
}

export const supabase = supabaseInstance;

// 0. Sign Out
export async function signOut() {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * AUTHENTICATION METHODS
 */

// 1. Request Login Code (OTP)
export async function signInWithOtp(email) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 1.5 Login with Password (accepts Email OR Username)
export async function signInWithPassword(loginId, password) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        let email = loginId;

        // CHECK IF INPUT IS NOT AN EMAIL (Simple Regex)
        // If it looks like a username (no @), try to resolve it
        if (!loginId.includes('@')) {
            const { data, error } = await supabase
                .from('profiles')
                .select('email')
                .ilike('hacker_id', loginId) // Case-insensitive lookup
                .single();

            if (error || !data) {
                return { success: false, error: "Username not found." };
            }
            email = data.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}


// 2. Verify Login Code
export async function verifyOtp(email, token) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 3. Create/Update Profile
export async function updateProfile(userId, hackerId) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                hacker_id: hackerId,
                email: (await supabase.auth.getUser()).data.user.email
            });
        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 4. Get Current Profile
export async function getProfile(userId) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) return { success: false, error: error.message }; // Might not exist yet
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 5. CLAIM INVITE TICKET
export async function claimInvite(code) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        const { data, error } = await supabase
            .rpc('claim_invite', { invite_code: code });

        if (error) throw error;
        // RPC returns boolean (true = success, false = invalid/taken)
        if (data === true) return { success: true };
        return { success: false, error: "Invalid or already claimed ticket." };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Submit a run to the leaderboard
 * @param {Object} runData - { player_name, score, floor_reached, run_time, game_mode }
 */
export async function submitScore(runData) {
    if (!supabase) {
        return { success: false, error: "Supabase not initialized." };
    }
    try {
        // GET USER ID SECURELY
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "User not authenticated. Score cache only." };
        }

        const payload = {
            ...runData,
            user_id: user.id // REQURIED BY NEW RLS POLICY
        };

        const { data, error } = await supabase
            .from('leaderboard')
            .insert([payload]);

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("SCORE SUBMISSION FAILED:", err);
        // Alert the user visibly for now to help debug
        alert(`UPLINK ERROR: ${err.message || 'Data Transmission Failed'}`);
        return { success: false, error: err.message };
    }
}

/**
 * Fetch top scores for the leaderboard
 * @param {string} mode - Optional game mode filter
 * @param {number} limit - Number of records to fetch
 * @param {string} sortBy - Column to sort by (score, floor_reached, etc)
 */
export async function getTopScores(mode = null, limit = 100, sortBy = 'score') {
    if (!supabase) {
        return { success: false, error: "Supabase not initialized." };
    }
    try {
        let query = supabase
            .from('leaderboard')
            .select('*')
            .order(sortBy, { ascending: false }) // Always DESC for now (Higher score/floor/stability is better)
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

/**
 * Get aggregated lifetime stats for a user (Profile Card)
 * Uses the custom Database Function 'get_player_stats'
 */
export async function getPlayerStats(targetUserId = null) {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
        // If no target provided, use current auth user
        let userId = targetUserId;
        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false, error: "Not authenticated" };
            userId = user.id;
        }

        const { data, error } = await supabase
            .rpc('get_player_stats', { target_user_id: userId });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
