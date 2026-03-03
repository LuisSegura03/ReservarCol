import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://peusaakbgqmreqcfeqqr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldXNhYWtiZ3FtcmVxY2ZlcXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTc5MjUsImV4cCI6MjA4NzczMzkyNX0.GrW_0d3PIELrU0KnIQjOSDB6peVTMWV6PVx-O0p2PLU';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
