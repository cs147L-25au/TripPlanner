import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// These should be set as environment variables in production
// For now, using placeholder values - replace with your Supabase project URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wesejnwsxdbkaehwesph.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_secret_FYYtZwKyw23iCyr95MCIXQ_hce3M8dr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

