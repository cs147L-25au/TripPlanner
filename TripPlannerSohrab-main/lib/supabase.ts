import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Replace these with your actual Supabase project URL and anon key
// You can get these from your Supabase project settings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

if (!isSupabaseConfigured()) {
    console.warn(
        "⚠️ Supabase is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

