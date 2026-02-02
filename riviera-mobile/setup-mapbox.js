#!/usr/bin/env node

/**
 * Mapbox Setup Script for Riviera Mobile
 * 
 * This script helps configure Mapbox access tokens in the discovery components.
 * Run with: node setup-mapbox.js YOUR_MAPBOX_TOKEN
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER_TOKEN = 'pk.eyJ1IjoicmVhbC1yaXZpZXJhIiwiYSI6ImNtNXNxdGNhZzBhZGsyanM5ZGNqZGNqZGcifQ.example';
const YOUR_TOKEN = 'YOUR_MAPBOX_SECRET_TOKEN_HERE';

const FILES_TO_UPDATE = [
  'components/RivieraDiscoveryScreen.tsx',
  'components/RivieraDiscoveryScreen-Night.tsx'
];

function updateMapboxToken(token = YOUR_TOKEN) {
  if (!token || (!token.startsWith('pk.') && !token.startsWith('sk.'))) {
    console.error('❌ Invalid Mapbox token. Token should start with "pk." or "sk."');
    console.log('📖 Get your token from: https://account.mapbox.com/access-tokens/');
    process.exit(1);
  }

  console.log('🗺️  Setting up Mapbox integration...\n');

  FILES_TO_UPDATE.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes(PLACEHOLDER_TOKEN)) {
        content = content.replace(PLACEHOLDER_TOKEN, token);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else if (content.includes(token)) {
        console.log(`✅ Already configured: ${filePath}`);
      } else {
        console.log(`⚠️  Token pattern not found in: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  });

  console.log('\n🎉 Mapbox setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm start');
  console.log('2. Test both day and night modes');
  console.log('3. Verify maps load and markers appear');
  console.log('\n📖 See mapbox-config.md for detailed setup instructions');
}

// Get token from command line argument or use default
const token = process.argv[2] || YOUR_TOKEN;

if (!token) {
  console.log('🗺️  Mapbox Setup for Riviera Mobile\n');
  console.log('Usage: node setup-mapbox.js [YOUR_MAPBOX_TOKEN]\n');
  console.log('If no token provided, will use the configured token.\n');
  console.log('Example: node setup-mapbox.js pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbXh4eHh4eHgwMDAwMG0wMDAwMDAwMDAwIn0.your-token\n');
  console.log('📖 Get your token from: https://account.mapbox.com/access-tokens/');
  
  // Use default token if available
  if (YOUR_TOKEN && YOUR_TOKEN !== 'sk.eyJ1IjoiYWxkaWQxNjAyIiwiYSI6ImNtbDQ4NHV3aDB5ZTQzZHNkZHpoYm96MnkifQ.BIK3YtfFBiLSZLRREwFNrg') {
    console.log('\n🔧 Using configured token...');
    updateMapboxToken(YOUR_TOKEN);
  } else {
    process.exit(1);
  }
} else {
  updateMapboxToken(token);
}