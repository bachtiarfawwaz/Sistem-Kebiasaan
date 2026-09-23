export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'KAIH - Monitoring 7 Kebiasaan Anak',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },
  modules: [
    '@nuxt/icon'
  ],
  icon: {
    serverBundle: {
      collections: ['ph']
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 2048
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
  nitro: {
    preset: 'cloudflare-pages'
  }
})
