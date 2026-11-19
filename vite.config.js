import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // На GitHub Pages сайт лежить у підпапці /habit-tracker/.
  // Прямі посилання обробляє public/404.html (див. README, розділ «Розгортання»).
  base: command === 'build' ? '/habit-tracker/' : '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
