import { createClient } from '@supabase/supabase-js';

// Replace with your actual env variable access method
const supabaseUrl = 'VITE_SUPABASE_URL'; 
const supabaseKey = 'VITE_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);