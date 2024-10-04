import { defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

const runtimeConfig = useRuntimeConfig()

const supabase = createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey)

export default defineEventHandler(async (event) => {
  const { req, res } = event.node
  const { code } = getQuery(event)

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)
    if (error) {
      console.error('Error exchanging code for session:', error)
      res.writeHead(302, { Location: '/login?error=AuthFailed' })
      return res.end()
    }

    // Set the access token as an HTTP-only cookie
    res.setHeader('Set-Cookie', `sb-access-token=${data.session.access_token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`)
    res.writeHead(302, { Location: '/essay' })
    return res.end()
  }

  res.writeHead(302, { Location: '/login?error=NoCode' })
  return res.end()
})
