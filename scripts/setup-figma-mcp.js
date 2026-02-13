#!/usr/bin/env node

/**
 * Setup script for Figma MCP in Codex/Cursor
 * Reads from .env file and generates MCP configuration
 */

const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// Get Cursor MCP config path
function getCursorMCPPath() {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const platform = process.platform;
  
  if (platform === 'darwin' || platform === 'linux') {
    // Try common locations
    const paths = [
      path.join(homeDir, '.cursor', 'mcp.json'),
      path.join(homeDir, '.config', 'cursor', 'mcp.json'),
      path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'mcp.json'),
    ];
    return paths.find(p => {
      const dir = path.dirname(p);
      return fs.existsSync(dir) || dir.includes('.cursor') || dir.includes('cursor');
    }) || paths[0];
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Cursor', 'mcp.json');
  }
  
  return path.join(homeDir, '.cursor', 'mcp.json');
}

// Generate MCP configuration
function generateMCPConfig(env) {
  if (!env.FIGMA_REST_API) {
    console.error('❌ FIGMA_REST_API not found in .env file');
    process.exit(1);
  }

  const config = {
    mcpServers: {
      figma: {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-figma"
        ],
        env: {
          FIGMA_ACCESS_TOKEN: env.FIGMA_REST_API
        }
      }
    }
  };

  // Add file ID and branch key as environment variables if available
  if (env.FIGMA_FILE_ID) {
    config.mcpServers.figma.env.FIGMA_FILE_ID = env.FIGMA_FILE_ID;
  }
  if (env.FIGMA_BRANCH_KEY) {
    config.mcpServers.figma.env.FIGMA_BRANCH_KEY = env.FIGMA_BRANCH_KEY;
  }

  return config;
}

// Main setup
function main() {
  console.log('🔧 Setting up Figma MCP for Codex...\n');

  // Load environment variables
  const env = loadEnv();
  console.log('✅ Loaded .env file');
  console.log(`   - FIGMA_REST_API: ${env.FIGMA_REST_API ? '✓ Found' : '✗ Missing'}`);
  console.log(`   - FIGMA_FILE_ID: ${env.FIGMA_FILE_ID ? '✓ Found' : '✗ Missing'}`);
  console.log(`   - FIGMA_BRANCH_KEY: ${env.FIGMA_BRANCH_KEY ? '✓ Found' : '✗ Missing'}\n`);

  // Generate configuration
  const config = generateMCPConfig(env);
  const configPath = getCursorMCPPath();
  const configDir = path.dirname(configPath);

  console.log(`📝 MCP configuration will be written to:`);
  console.log(`   ${configPath}\n`);

  // Check if directory exists
  if (!fs.existsSync(configDir)) {
    console.log(`📁 Creating directory: ${configDir}`);
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Check if config already exists
  let existingConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('⚠️  Existing MCP configuration found. Will merge with Figma config.\n');
    } catch (e) {
      console.log('⚠️  Existing config file found but couldn\'t parse. Will create new one.\n');
    }
  }

  // Merge configurations
  const mergedConfig = {
    ...existingConfig,
    mcpServers: {
      ...(existingConfig.mcpServers || {}),
      ...config.mcpServers
    }
  };

  // Write configuration
  fs.writeFileSync(
    configPath,
    JSON.stringify(mergedConfig, null, 2) + '\n',
    'utf8'
  );

  console.log('✅ MCP configuration written successfully!\n');
  console.log('📋 Next steps:');
  console.log('   1. Restart Cursor/Codex for changes to take effect');
  console.log('   2. Test by asking Codex to use Figma MCP');
  console.log('   3. Example: "Get design context for a component in my Figma file"');
  console.log(`\n💡 Your Figma file ID: ${env.FIGMA_FILE_ID || 'Not set'}`);
  console.log(`💡 Your Figma branch key: ${env.FIGMA_BRANCH_KEY || 'Not set'}\n`);
}

main();
