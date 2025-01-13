# Vite Watcher

A CLI tool that watches your Vite project files and automatically triggers rebuilds when changes are detected.

## Installation

```bash
# Install globally
npm install -g vite-watcher

# Or install locally in your project
npm install --save-dev vite-watcher
```

## Usage

Navigate to your Vite project directory and run:

```bash
vite-watch
```

## Configuration

You can create a `.vitewatchrc.json` file in your project root to customize the behavior:

```json
{
  "watchPaths": [
    "./src/**/*.js",
    "./src/**/*.css"
  ],
  "ignorePaths": [
    "**/node_modules/**",
    "**/dist/**"
  ],
  "debounceDelay": 500
}
```

## Features

- Watches for file changes in your Vite project
- Automatically triggers rebuilds
- Configurable file paths and ignore patterns
- Debounced builds to prevent rapid successive builds
- Clear console output with status indicators