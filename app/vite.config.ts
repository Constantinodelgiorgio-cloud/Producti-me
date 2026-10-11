import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `vite build --mode pages` publica en GitHub Pages bajo /Producti-me/; el resto usa la raíz (Vercel, local).
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Producti-me/' : '/',
  build: { chunkSizeWarningLimit: 1200 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Producti-Me',
        short_name: 'Producti-Me',
        description: 'Mi sistema personal de rendimiento',
        theme_color: '#08090B',
        background_color: '#08090B',
        display: 'standalone',
        lang: 'es',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
}))
