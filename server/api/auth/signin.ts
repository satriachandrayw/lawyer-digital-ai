import { defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

const runtimeConfig = useRuntimeConfig()

const supabase = createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey)

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    // options: {
    //   redirectTo: `${runtimeConfig.siteUrl}/api/auth/callback`
    // }
  })

  if (error) {
    console.error('Error initiating Google sign-in:', error)
    return { error: 'Failed to initiate sign-in' }
  }
  console.log(data.url)

  return data
})
