const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const srcDir = './src';
const iconsDir = './icons';
const chromeDir = './chrome';
const firefoxDir = './firefox';

// Download webextension-polyfill
async function downloadPolyfill() {
  const polyfillPath = path.join(chromeDir, 'browser-polyfill.js');
  
  // Check if polyfill already exists
  if (await fs.pathExists(polyfillPath)) {
    console.log('📦 Polyfill already exists, skipping download');
    return;
  }

  return new Promise((resolve, reject) => {
    const url = 'https://unpkg.com/webextension-polyfill@0.10.0/dist/browser-polyfill.min.js';
    const file = fs.createWriteStream(polyfillPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('📦 Downloaded webextension-polyfill');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(polyfillPath, () => {}); // Delete file on error
      reject(err);
    });
  });
}

// Chrome Manifest V3 (with polyfill)
const chromeManifest = {
  manifest_version: 3,
  name: "Open Highlight",
  version: "1.0",
  description: "Highlight and save text snippets across web pages",
  permissions: ["storage", "activeTab"],
  background: {
    service_worker: "background.js"
  },
  content_scripts: [{
    matches: ["<all_urls>"],
    js: ["browser-polyfill.js", "content.js"],
    css: ["highlight.css"]
  }],
  action: {
    default_popup: "popup.html",
    default_title: "Open Highlight",
    default_icon: {
      "16": "icons/open_highlight_icon.png",
      "32": "icons/open_highlight_icon.png",
      "48": "icons/open_highlight_icon.png",
      "128": "icons/open_highlight_icon.png"
    }
  },
  icons: {
    "16": "icons/open_highlight_icon.png",
    "32": "icons/open_highlight_icon.png", 
    "48": "icons/open_highlight_icon.png",
    "128": "icons/open_highlight_icon.png"
  },
  web_accessible_resources: [{
    resources: ["browser-polyfill.js"],
    matches: ["<all_urls>"]
  }]
};

async function updateFirefoxManifest() {
  const firefoxManifestPath = path.join(firefoxDir, 'manifest.json');
  
  // Read existing Firefox manifest if it exists
  let firefoxManifest = {};
  if (await fs.pathExists(firefoxManifestPath)) {
    firefoxManifest = await fs.readJson(firefoxManifestPath);
  }
  
  // Ensure Firefox manifest has the correct structure for MV2
  const updatedFirefoxManifest = {
    ...firefoxManifest,
    manifest_version: 2,
    background: {
      scripts: ["background.js"],
      persistent: false
    },
    content_scripts: [{
      matches: ["<all_urls>"],
      js: ["content.js"],
      css: ["highlight.css"]
    }],
    browser_action: {
      default_popup: "popup.html",
      default_title: firefoxManifest.name || "Open Highlight",
      default_icon: {
        "16": "icons/open_highlight_icon.png",
        "32": "icons/open_highlight_icon.png",
        "48": "icons/open_highlight_icon.png",
        "128": "icons/open_highlight_icon.png"
      }
    },
    icons: {
      "16": "icons/open_highlight_icon.png",
      "32": "icons/open_highlight_icon.png",
      "48": "icons/open_highlight_icon.png", 
      "128": "icons/open_highlight_icon.png"
    },
    permissions: firefoxManifest.permissions || ["storage", "activeTab"]
  };
  
  await fs.writeJson(firefoxManifestPath, updatedFirefoxManifest, { spaces: 2 });
  console.log('🦊 Updated Firefox manifest');
}

async function build() {
  try {
    console.log('🔨 Starting build process...');
    
    // Ensure chrome directory exists
    await fs.ensureDir(chromeDir);
    await fs.ensureDir(firefoxDir);
    
    // Copy source files to both directories
    console.log('📁 Copying source files...');
    await fs.copy(srcDir, chromeDir, { overwrite: true });
    await fs.copy(srcDir, firefoxDir, { overwrite: true });
    
    // Copy icons to both directories
    console.log('🎨 Copying icons...');
    await fs.copy(iconsDir, path.join(chromeDir, 'icons'), { overwrite: true });
    await fs.copy(iconsDir, path.join(firefoxDir, 'icons'), { overwrite: true });
    
    // Download polyfill for Chrome
    await downloadPolyfill();
    
    // Update manifests
    await fs.writeJson(path.join(chromeDir, 'manifest.json'), chromeManifest, { spaces: 2 });
    await updateFirefoxManifest();
    
    // Process background.js for Chrome (add polyfill import)
    const chromeBackgroundPath = path.join(chromeDir, 'background.js');
    let backgroundContent = await fs.readFile(chromeBackgroundPath, 'utf8');
    
    // Check if polyfill import already exists
    if (!backgroundContent.includes('importScripts')) {
      backgroundContent = `// Chrome MV3 Service Worker with webextension-polyfill
importScripts('browser-polyfill.js');

${backgroundContent}`;
      await fs.writeFile(chromeBackgroundPath, backgroundContent);
      console.log('🔧 Added polyfill import to Chrome background.js');
    }
    
    // Process popup.html for Chrome (add polyfill script)
    const chromePopupPath = path.join(chromeDir, 'popup.html');
    if (await fs.pathExists(chromePopupPath)) {
      let popupContent = await fs.readFile(chromePopupPath, 'utf8');
      
      // Add polyfill script if not already present
      if (!popupContent.includes('browser-polyfill.js')) {
        popupContent = popupContent.replace(
          '<head>',
          '<head>\n    <script src="browser-polyfill.js"></script>'
        );
        await fs.writeFile(chromePopupPath, popupContent);
        console.log('🔧 Added polyfill script to Chrome popup.html');
      }
    }
    
    console.log('✅ Build complete!');
    console.log('📋 Chrome extension ready in: ./chrome/');
    console.log('📋 Firefox extension ready in: ./firefox/');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('  Chrome: Load ./chrome/ directory in Chrome Developer Mode');
    console.log('  Firefox: Load ./firefox/ directory as temporary addon');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];
if (command === 'clean') {
  console.log('🧹 Cleaning build directories...');
  Promise.all([
    fs.emptyDir(chromeDir),
    fs.remove(path.join(chromeDir, 'browser-polyfill.js'))
  ]).then(() => {
    console.log('✅ Clean complete');
  });
} else {
  // Run build
  build();
}