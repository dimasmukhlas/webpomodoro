import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fmhxyquaxgyfttmfmmab.supabase.co';

// The anon key is a public key that starts with 'eyJ' (it's a JWT token)
// You can find this in your Supabase dashboard under Settings > API
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaHh5cXVheGd5ZnR0bWZtbWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDQ5NTksImV4cCI6MjA3MTA4MDk1OX0.WUKSd4ObvlHjYVX5rJdRP4KWNj2MYlh7BKqslhleuuQ';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names for Supabase
export const TABLES = {
  TASKS: 'tasks',
  TIME_LOGS: 'time_logs',
  USERS: 'users'
} as const;

export default supabase;