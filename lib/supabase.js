import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fcjwceztnypezwkatjbo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjandjZXp0bnlwZXp3a2F0amJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTA5MTcsImV4cCI6MjA2OTk4NjkxN30.bFktQkbYPhV3k7R2h29opk2nvRladH3O4nPTM0ATLoQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
