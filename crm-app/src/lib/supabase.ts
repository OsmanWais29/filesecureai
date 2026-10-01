import { createClient } from "@supabase/supabase-js";

// Supabase is optional: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env to enable it.
// When they're missing, `supabase` is null and the app runs on demo data.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
