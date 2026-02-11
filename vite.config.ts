import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Transporte Eliud - Panel Admin',
        short_name: 'Panel Eliud',
        description: 'Panel de administración para Transporte Eliud',
        theme_color: '#8BC34A',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        id: '/',
        start_url: '/',
        orientation: 'portrait',
        categories: ['productivity', 'business'],
        screenshots: [
          {
            src: '/pwa-512x512.png', // Usamos el logo temporalmente como screenshot para cumplir requisito
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Panel Principal'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Panel Móvil'
          }
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})