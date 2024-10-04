import { fileURLToPath } from 'url'
import VitePluginCommonjs from 'vite-plugin-commonjs'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
    'pdfjs-dist': 'pdfjs-dist/build/pdf.js'
  },
  modules: [
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],
  colorMode: {
    classSuffix: ''
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  runtimeConfig: {
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    siteUrl: process.env.SITE_URL
  },
  nitro: {
    storage: {
      uploads: {
        driver: 'fs',
        base: './uploads'
      }
    }
  },
  build: {
    transpile: ['pdfjs-dist']
  },
  vite: {
    optimizeDeps: {
      include: ['pdfjs-dist']
    },
    plugins: [
      VitePluginCommonjs({
        filter: (id) => id.includes('pdfjs-dist')
      })
    ],
    server: {
      watch: {
        usePolling: true
      }
    }
  },
  plugins: [
    { src: '~/plugins/quill.client.ts', mode: 'client' },
    { src: '~/plugins/html2pdf.client.ts', mode: 'client' }
  ],
  supabase:{
    redirectOptions:{
      login: '/login',
      include: ['/essay(/*)?']
    }
  }
})