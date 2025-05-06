import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL não encontrada. Certifique-se de que VITE_SUPABASE_URL está definida.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase Anon Key não encontrada. Certifique-se de que VITE_SUPABASE_ANON_KEY está definida.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);