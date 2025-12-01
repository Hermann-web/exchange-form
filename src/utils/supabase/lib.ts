import { createClient } from '@supabase/supabase-js';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';

// // Local definition for debugging
// type Database = {
//   public: {
//     Tables: {
//       submissions: {
//         Row: any;
//         Insert: any;
//         Update: any;
//       };
//     };
//   };
// };

let supabase: any = null;

// fetch supabase inside the function // if not already fetched
export const lazySupabase = (): any => {
  if (!supabase) {
    supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
        },
      }
    );
  }
  return supabase;
};
