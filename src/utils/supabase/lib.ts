import { createClient } from '@supabase/supabase-js';

let supabase: any;

// fetch supabase inside the function // if not already fetched
export const lazySupabase = () => {
  if (!supabase) {
    supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }
  return supabase;
};
