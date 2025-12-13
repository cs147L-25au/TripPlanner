import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wesejnwsxdbkaehwesph.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_secret_FYYtZwKyw23iCyr95MCIXQ_hce3M8dr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
