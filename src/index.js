const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const debounce = require('lodash.debounce');
const fs = require('fs');

// Check if the current directory has a vite config
const hasViteConfig = () => {
  return fs.existsSync(path.join(process.cwd(), 'vite.config.js')) ||
         fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));
};

// Configuration
const getConfig = () => {
  const defaultConfig = {
    watchPaths: [
      './src/**/*.js',
      './src/**/*.jsx',
      './src/**/*.ts',
      './src/**/*.tsx',
      './src/**/*.css',
      './src/**/*.scss',
      './resources/**/*.js',
      './resources/**/*.jsx',
      './resources/**/*.ts',
      './resources/**/*.tsx',
      './resources/**/*.css',
      './resources/**/*.scss',
    ],
    ignorePaths: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**'
    ],
    debounceDelay: 500
  };

  // Try to load user config from current directory
  const userConfigPath = path.join(process.cwd(), '.vitewatchrc.json');
  try {
    if (fs.existsSync(userConfigPath)) {
      const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.warn('⚠️ Error loading user config, using defaults:', error.message);
  }

  return defaultConfig;
};

// Validate current directory
if (!hasViteConfig()) {
  console.error('❌ No Vite configuration found in current directory!');
  console.error('Please run this command in a Vite project root directory.');
  process.exit(1);
}

const config = getConfig();

// Function to run Vite build
const runViteBuild = () => {
  console.log('\n🚀 Changes detected, running Vite build...');
  
  exec('vite build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build error:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Build warnings:', stderr);
    }
    
    console.log('✨ Build output:', stdout);
    console.log('✅ Build completed successfully!\n');
  });
};

// Debounced version of the build function
const debouncedBuild = debounce(runViteBuild, config.debounceDelay);

// Initialize watcher
const watcher = chokidar.watch(config.watchPaths, {
  ignored: config.ignorePaths,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 100
  }
});

// Watch events
watcher
  .on('ready', () => {
    console.log('👀 Watching for file changes...');
    console.log('📁 Watched paths:', config.watchPaths.join('\n'));
  })
  .on('change', filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`🔄 File changed: ${relativePath}`);
    debouncedBuild();
  })
  .on('error', error => {
    console.error('⚠️ Watcher error:', error);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  watcher.close().then(() => process.exit(0));
});
