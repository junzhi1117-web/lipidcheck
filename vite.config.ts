import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'LipidCheck 血脂智能判讀',
        short_name: 'LipidCheck',
        description: '三大指引血脂風險評估工具',
        theme_color: '#006A7A',
        background_color: '#F8F9FA',
        display: 'standalone',
        icons: [
          { src: 'favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/og-image.png'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
})
