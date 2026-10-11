import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // relative paths so the build works from any static folder
  plugins: [react(), tailwindcss()],
})
