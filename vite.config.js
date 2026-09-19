import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function getSpotsLastUpdated() {
  try {
    return execSync('git log -1 --format=%cI -- src/data/spots.json').toString().trim() || null
  } catch {
    return null
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __SPOTS_LAST_UPDATED__: JSON.stringify(getSpotsLastUpdated()),
  },
})
