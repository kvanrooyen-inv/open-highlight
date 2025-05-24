// Fixed background.js - Keyword highlighting support
browser.runtime.onInstalled.addListener((details) => {
  console.log('Open Highlight extension installed:', details.reason);
  
  // Initialize default settings
  browser.storage.local.set({
      categories: [{
          id: Date.now().toString(),
          name: 'Important Terms',
          color: '#ffff00',
          keywords: []
      }]
  });
});

// Handle messages from content script and popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'getCategories') {
      browser.storage.local.get(['categories']).then((result) => {
          sendResponse({ categories: result.categories || [] });
      }).catch((error) => {
          sendResponse({ categories: [], error: error.message });
      });
      
      return true; // Keep message channel open for async response
  }
  
  if (message.action === 'saveCategories') {
      browser.storage.local.set({ categories: message.categories }).then(() => {
          sendResponse({ success: true });
      }).catch((error) => {
          console.error('Error saving categories:', error);
          sendResponse({ success: false, error: error.message });
      });
      
      return true; // Keep message channel open for async response
  }
  
  // Legacy support for highlight saving (if needed later)
  if (message.action === 'saveHighlight') {
      browser.storage.local.get(['highlights']).then((result) => {
          const highlights = result.highlights || [];
          highlights.push({
              text: message.text,
              url: sender.tab.url,
              timestamp: Date.now(),
              id: Date.now().toString()
          });
          
          return browser.storage.local.set({ highlights });
      }).then(() => {
          sendResponse({ success: true });
      }).catch((error) => {
          console.error('Error saving highlight:', error);
          sendResponse({ success: false, error: error.message });
      });
      
      return true; // Keep message channel open for async response
  }
  
  if (message.action === 'getHighlights') {
      browser.storage.local.get(['highlights']).then((result) => {
          sendResponse({ highlights: result.highlights || [] });
      }).catch((error) => {
          sendResponse({ highlights: [], error: error.message });
      });
      
      return true; // Keep message channel open for async response
  }
});