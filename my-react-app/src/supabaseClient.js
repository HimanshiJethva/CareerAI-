import { createClient } from '@supabase/supabase-js'

// Apne Supabase dashboard se copy kiye huye values yahan dalein
const supabaseUrl = 'https://zixxsinhbithmaxadrrx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHhzaW5oYml0aG1heGFkcnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTEwMDIsImV4cCI6MjA4ODQ2NzAwMn0.lnA6iik4ackM1k998sBn5apaxqPJOaPOBORZFgDeiTQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)