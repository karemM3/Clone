#!/usr/bin/env node

/**
 * WorkiT Installation Script
 * This script helps set up everything needed to run WorkiT
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Print banner
console.log(`${colors.bright}${colors.magenta}
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗████████╗
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║╚══██╔══╝
██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║   ██║
██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║   ██║
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗██║   ██║
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝

${colors.reset}${colors.cyan}Freelance Marketplace Platform - Installation${colors.reset}
`);

console.log(`${colors.bright}Welcome to the WorkiT installation script!${colors.reset}`);
console.log(`This script will help you set up everything you need to run WorkiT locally.\n`);

// Ask if user has Bun installed
rl.question(`${colors.yellow}Do you have Bun installed? (y/n)${colors.reset} `, async (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log(`${colors.cyan}Please install Bun first:${colors.reset}`);
    console.log(`${colors.bright}curl -fsSL https://bun.sh/install | bash${colors.reset}`);
    rl.close();
    return;
  }

  // Install dependencies
  console.log(`\n${colors.bright}Installing dependencies...${colors.reset}`);

  try {
    // Run bun install
    const install = spawn('bun', ['install'], {
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      install.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`bun install exited with code ${code}`));
        }
      });
    });

    console.log(`\n${colors.green}✅ Dependencies installed successfully${colors.reset}`);

    // Ask if user wants to run with MongoDB
    rl.question(`\n${colors.yellow}Do you want to use MongoDB? (y/n)${colors.reset} `, (useMongo) => {
      if (useMongo.toLowerCase() === 'y') {
        console.log(`\n${colors.cyan}MongoDB configuration:${colors.reset}`);
        console.log(`1. Make sure MongoDB is installed and running`);
        console.log(`2. Default connection string: ${colors.bright}mongodb://localhost:27017/workit${colors.reset}`);
        console.log(`3. See ${colors.bright}MONGODB_COMPASS_GUIDE.md${colors.reset} for more details\n`);

        // Show final instructions for MongoDB
        showFinalInstructions(true);
      } else {
        // Show final instructions without MongoDB
        showFinalInstructions(false);
      }
    });
  } catch (error) {
    console.error(`${colors.red}Error during installation:${colors.reset}`, error);
    rl.close();
  }
});

// Function to show final instructions
function showFinalInstructions(useMongo) {
  console.log(`\n${colors.bright}${colors.green}✅ WorkiT is ready to use!${colors.reset}\n`);

  console.log(`${colors.bright}To start WorkiT:${colors.reset}`);

  if (useMongo) {
    console.log(`${colors.cyan}Run with MongoDB:${colors.reset}`);
    console.log(`  ${colors.bright}bun start:full${colors.reset}\n`);
  } else {
    console.log(`${colors.cyan}Run with simple in-memory server (no MongoDB required):${colors.reset}`);
    console.log(`  ${colors.bright}bun start${colors.reset}\n`);
  }

  console.log(`${colors.cyan}Other commands:${colors.reset}`);
  console.log(`  ${colors.bright}bun dev${colors.reset} - Start the frontend only`);
  console.log(`  ${colors.bright}bun server:simple${colors.reset} - Start the simple API server only`);
  console.log(`  ${colors.bright}bun build${colors.reset} - Build the application for production\n`);

  console.log(`${colors.bright}For more information, see the README.md file${colors.reset}\n`);

  rl.close();
}

// Handle cleanup
rl.on('close', () => {
  console.log(`\n${colors.bright}${colors.magenta}Thanks for installing WorkiT!${colors.reset}\n`);
  process.exit(0);
});
