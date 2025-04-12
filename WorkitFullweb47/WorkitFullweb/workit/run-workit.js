#!/usr/bin/env node

/**
 * WorkiT runner script
 * This script starts both the frontend and the backend server
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const API_PORT = 5001;
const FRONTEND_PORT = 5173;
const DEFAULT_SERVER = 'simple-server.js'; // Use simple server by default

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Print banner
console.log(`${colors.bright}${colors.magenta}
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗████████╗
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║╚══██╔══╝
██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║   ██║
██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║   ██║
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗██║   ██║
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝

${colors.reset}${colors.cyan}Freelance Marketplace Platform${colors.reset}
`);

// Check which server file to use
let serverFile = DEFAULT_SERVER;
if (process.argv.includes('--full')) {
  serverFile = 'server.js';
  console.log(`${colors.yellow}Running with full MongoDB server (make sure MongoDB is running)${colors.reset}`);
} else {
  console.log(`${colors.green}Running with simple in-memory server (no MongoDB required)${colors.reset}`);
}

// Ensure the server file exists
const serverPath = path.join(process.cwd(), 'server', serverFile);
if (!fs.existsSync(serverPath)) {
  console.error(`${colors.red}Error: Server file not found: ${serverPath}${colors.reset}`);
  process.exit(1);
}

// Start the backend server
console.log(`${colors.bright}Starting API server...${colors.reset}`);
const apiServer = spawn('bun', ['server/' + serverFile], {
  stdio: 'pipe',
  shell: true
});

// Start the frontend server
console.log(`${colors.bright}Starting frontend server...${colors.reset}`);
const frontendServer = spawn('bun', ['dev'], {
  stdio: 'pipe',
  shell: true
});

// Helper function to prefix output with colors
function formatOutput(data, prefix, color) {
  return data
    .toString()
    .split('\n')
    .filter(line => line.trim())
    .map(line => `${color}${prefix}${colors.reset} ${line}`)
    .join('\n');
}

// Handle API server output
apiServer.stdout.on('data', data => {
  console.log(formatOutput(data, '[API]', colors.cyan));
});

apiServer.stderr.on('data', data => {
  console.error(formatOutput(data, '[API Error]', colors.red));
});

// Handle frontend server output
frontendServer.stdout.on('data', data => {
  console.log(formatOutput(data, '[Frontend]', colors.green));
});

frontendServer.stderr.on('data', data => {
  console.error(formatOutput(data, '[Frontend Error]', colors.red));
});

// Handle process termination
function cleanup() {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
  apiServer.kill();
  frontendServer.kill();
  process.exit(0);
}

// Handle Ctrl+C and other termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Display access URLs
setTimeout(() => {
  console.log(`\n${colors.bright}${colors.green}✅ WorkiT is running!${colors.reset}`);
  console.log(`${colors.bright}API:${colors.reset} http://localhost:${API_PORT}/api`);
  console.log(`${colors.bright}Frontend:${colors.reset} http://localhost:${FRONTEND_PORT}`);
  console.log(`${colors.dim}Press Ctrl+C to stop all servers${colors.reset}\n`);
}, 2000);
