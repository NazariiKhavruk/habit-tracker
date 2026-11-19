import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// GitHub Pages віддає 404.html для будь-якої невідомої адреси.
// Копія index.html дозволяє відкривати прямі посилання на кшталт /habits/123.
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // На GitHub Pages сайт лежить у підпапці /habit-tracker/
  base: command === 'build' ? '/habit-tracker/' : '/',
  plugins: [vue(), vueDevTools(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
