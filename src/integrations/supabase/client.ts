// Frontend points at the CLI's existing Supabase project (where memory_chunks lives).
// The Lovable Cloud project hosts edge functions only (search-chunks).
import { createClient } from '@supabase/supabase-js';

// CLI Supabase (data lives here)
const CLI_SUPABASE_URL = 'https://hbhntgoynkubouhtmupk.supabase.co';
const CLI_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiaG50Z295bmt1Ym91aHRtdXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTY0OTIsImV4cCI6MjA5MjA5MjQ5Mn0.BCQewcLB7Xwwx5vQLG2W3Db242hG4lIgD7CSWCbAbtk';

// Single-user mode: hardcoded user_id (RLS is permissive, service role used by CLI)
export const SINGLE_USER_ID = '00000000-0000-0000-0000-000000000000';

export const supabase = createClient(CLI_SUPABASE_URL, CLI_SUPABASE_ANON_KEY, {
  auth: { storage: localStorage, persistSession: false, autoRefreshToken: false },
});

// Lovable Cloud client — used only for invoking edge functions (search-chunks)
const LOVABLE_CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
const LOVABLE_CLOUD_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const lovableCloud = createClient(LOVABLE_CLOUD_URL, LOVABLE_CLOUD_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});