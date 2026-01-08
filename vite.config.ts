import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - set to your repository name if using a subdirectory
  // Leave as '/' for root domain or empty string for repository root
  base: '/',
})

