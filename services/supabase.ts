
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qfekazzayamxecbpgcze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZWthenpheWFteGVjYnBnY3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjQ4MjgsImV4cCI6MjA4MDE0MDgyOH0.6PV0-DNfu6VaZdOQT0yhrNTe3boTNBIqAnOmwq4IKcE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
