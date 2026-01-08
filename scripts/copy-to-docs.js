import { copyFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

const distDir = 'dist'
const docsDir = 'docs'

// Remove existing docs directory if it exists
if (existsSync(docsDir)) {
  rmSync(docsDir, { recursive: true, force: true })
}

// Create docs directory
mkdirSync(docsDir, { recursive: true })

// Function to copy files recursively
function copyRecursive(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// Copy dist to docs
if (existsSync(distDir)) {
  copyRecursive(distDir, docsDir)
  console.log('✅ Successfully copied dist to docs folder for GitHub Pages')
} else {
  console.error('❌ dist folder not found. Run "npm run build" first.')
  process.exit(1)
}

