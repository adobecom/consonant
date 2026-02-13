#!/usr/bin/env node

/**
 * Setup Adobe Fonts for Product Lockup Component
 * 
 * This script helps set up Adobe Clean Display font using Adobe Fonts API.
 * Note: Adobe Fonts requires Web Projects and embed codes, not direct file downloads.
 */

const fs = require('fs');
const path = require('path');

async function hydrateEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  try {
    const contents = await fs.promises.readFile(envPath, 'utf8');
    const vars = {};
    contents.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        vars[key] = value;
      }
    });
    
    for (const [key, value] of Object.entries(vars)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function main() {
  try {
    await hydrateEnv();
    
    const apiKey = process.env.ADOBE_FONTS_API;
    
    if (!apiKey) {
      console.error('❌ Missing ADOBE_FONTS_API environment variable');
      console.log('\n📝 To set up Adobe Fonts:');
      console.log('1. Get your Adobe Fonts API key from fonts.adobe.com');
      console.log('2. Add it to your .env file: ADOBE_FONTS_API=your_api_key');
      console.log('\n💡 Alternative: Use Adobe Fonts Web Project embed code');
      console.log('   See: https://helpx.adobe.com/fonts/using/add-fonts-website.html');
      process.exit(1);
    }
    
    console.log('✅ Found ADOBE_FONTS_API');
    console.log('\n📋 Adobe Fonts Setup Instructions:');
    console.log('\nAdobe Fonts uses Web Projects with embed codes, not direct API downloads.');
    console.log('Here\'s how to set it up:\n');
    
    console.log('1. Go to https://fonts.adobe.com');
    console.log('2. Search for "Adobe Clean Display"');
    console.log('3. Click the "</>" icon to add it to a Web Project');
    console.log('4. Select the Black (900) weight');
    console.log('5. Copy the embed code (link tag)');
    console.log('\n6. Add the embed code to .storybook/preview.js:');
    console.log('   import "https://use.typekit.net/[YOUR_KIT_ID].css";');
    console.log('\n7. The font will then be available as "Adobe Clean Display" in your CSS');
    
    console.log('\n💡 Note: The API key is for management, not runtime embedding.');
    console.log('   Fonts must be served via Adobe Fonts CDN (Typekit).');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
