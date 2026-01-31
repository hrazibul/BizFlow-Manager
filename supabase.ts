
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzdmufykoovueksnaxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuemRtdWZ5a29vdnVla3NuYXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTUyNzUsImV4cCI6MjA4NTQzMTI3NX0.nv2TMkre1ifjJ5lC0XuIqk78tgkOU06E89Kzfai-46g';

export const supabase = createClient(supabaseUrl, supabaseKey);
