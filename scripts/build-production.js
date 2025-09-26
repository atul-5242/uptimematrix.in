#!/usr/bin/env node

/**
 * Production Build Script for UptimeMatrix
 * Builds all packages and applications for production deployment
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting UptimeMatrix production build...');

// Clean previous build
const buildDir = join(rootDir, 'build');
if (existsSync(buildDir)) {
  console.log('🧹 Cleaning previous build...');
  rmSync(buildDir, { recursive: true, force: true });
}
mkdirSync(buildDir, { recursive: true });

try {
  // Build packages first (dependencies)
  console.log('📦 Building packages...');
  
  console.log('  - Building @uptimematrix/store...');
  execSync('pnpm run build', { 
    cwd: join(rootDir, 'packages/store'),
    stdio: 'inherit'
  });
  
  console.log('  - Building @uptimematrix/redisstream...');
  execSync('pnpm run build', { 
    cwd: join(rootDir, 'packages/redisstream'),
    stdio: 'inherit'
  });

  // Build applications
  console.log('🏗️  Building applications...');
  
  console.log('  - Building API...');
  execSync('pnpm run build', { 
    cwd: join(rootDir, 'apps/api'),
    stdio: 'inherit'
  });
  
  console.log('  - Building Pusher...');
  execSync('pnpm run build', { 
    cwd: join(rootDir, 'apps/pusher'),
    stdio: 'inherit'
  });
  
  console.log('  - Building Worker...');
  execSync('pnpm run build', { 
    cwd: join(rootDir, 'apps/worker'),
    stdio: 'inherit'
  });

  // Copy built files to build directory
  console.log('📋 Copying built files...');
  
  // Copy API
  cpSync(join(rootDir, 'apps/api/dist'), join(buildDir, 'api'), { recursive: true });
  cpSync(join(rootDir, 'apps/api/package.json'), join(buildDir, 'api/package.json'));
  
  // Copy Pusher
  cpSync(join(rootDir, 'apps/pusher/dist'), join(buildDir, 'pusher'), { recursive: true });
  cpSync(join(rootDir, 'apps/pusher/package.json'), join(buildDir, 'pusher/package.json'));
  
  // Copy Worker
  cpSync(join(rootDir, 'apps/worker/dist'), join(buildDir, 'worker'), { recursive: true });
  cpSync(join(rootDir, 'apps/worker/package.json'), join(buildDir, 'worker/package.json'));
  
  // Copy packages
  mkdirSync(join(buildDir, 'packages'), { recursive: true });
  cpSync(join(rootDir, 'packages/store/dist'), join(buildDir, 'packages/store'), { recursive: true });
  cpSync(join(rootDir, 'packages/store/package.json'), join(buildDir, 'packages/store/package.json'));
  cpSync(join(rootDir, 'packages/redisstream/dist'), join(buildDir, 'packages/redisstream'), { recursive: true });
  cpSync(join(rootDir, 'packages/redisstream/package.json'), join(buildDir, 'packages/redisstream/package.json'));
  
  // Copy deployment scripts
  if (existsSync(join(rootDir, 'scripts/deployment'))) {
    cpSync(join(rootDir, 'scripts/deployment'), join(buildDir, 'deployment'), { recursive: true });
  }

  console.log('✅ Production build completed successfully!');
  console.log(`📁 Build output: ${buildDir}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
