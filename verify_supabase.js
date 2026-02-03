import { supabase } from './src/utils/supabase.js';

async function verifyTable() {
    console.log("--- SUPABASE VERIFICATION ---");
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Verification Failed:", error.message);
            if (error.code === '42P01') {
                console.log("HINT: Table 'leaderboard' does not exist in the public schema.");
            }
        } else {
            console.log("Verification Success: 'leaderboard' table is accessible.");
            console.log("Row count (test):", data.length);
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

verifyTable();
