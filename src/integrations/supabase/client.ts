
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://igfpasvqbjczyohitymc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZnBhc3ZxYmpjenlvaGl0eW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxODc1MTMsImV4cCI6MjA1NTc2MzUxM30.OCTAnf1Otn1XYa1E3PY2yZz5vCjmzWDtDUHkA8qA1O4'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
