
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://igfpasvqbjczyohitymc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZnBhc3ZxYmpjenlvaGl0eW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxODc1MTMsImV4cCI6MjA1NTc2MzUxM30.OCTAnf1Otn1XYa1E3PY2yZz5vCjmzWDtDUHkA8qA1O4'

const fetchWithRetry = async (url: RequestInfo | URL, options: RequestInit = {}, maxRetries = 3): Promise<Response> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
    // Exponential backoff with max delay of 3 seconds
    await new Promise(resolve => 
      setTimeout(resolve, Math.min(100 * Math.pow(2, attempt), 3000))
    );
  }
  return fetch(url, options); // Final attempt
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetchWithRetry
  },
})

