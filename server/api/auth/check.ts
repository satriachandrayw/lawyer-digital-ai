import { defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

const runtimeConfig = useRuntimeConfig()

const supabase = createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseServiceKey)

export default defineEventHandler(async (event) => {
  const { req } = event.node
  const token = req.headers.cookie?.split(';').find(c => c.trim().startsWith('sb-access-token='))?.split('=')[1]

  if (!token) {
    return { authenticated: false }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(token)
    return { authenticated: !!user }
  }
  catch (error) {
    console.error('Error checking authentication:', error)
    return { authenticated: false }
  }
})
