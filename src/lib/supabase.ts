import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://jorpfsrvhnelnboupiyx.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvcnBmc3J2aG5lbG5ib3VwaXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDA2NTAsImV4cCI6MjA5NDIxNjY1MH0.lj927gjZn3fYoEKbpw7jIic122ftHVzmyRpDFtch9do'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
