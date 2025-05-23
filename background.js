// Background script for Firefox extension
// This handles extension lifecycle and cross-tab communication

class BackgroundManager {
    constructor() {
        this.init();
    }

    init() {
        // Handle extension installation
        browser.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onInstall();
            } else if (details.reason === 'update') {
                this.onUpdate(details.previousVersion);
            }
        });

        // Handle messages from content scripts and popup
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            return this.handleMessage(message, sender, sendResponse);
        });
    }

    onInstall() {
        // Set up default categories on first install
        const defaultCategories = [
            {
                id: Date.now(),
                name: 'Important',
                color: '#ffff00',
                keywords: ['important', 'urgent', 'critical']
            },
            {
                id: Date.now() + 1,
                name: 'Names',
                color: '#90EE90',
                keywords: ['john', 'jane', 'smith']
            }
        ];

        browser.storage.local.set({ 
            categories: defaultCategories,
            version: '1.0'
        });
    }

    onUpdate(previousVersion) {
        // Handle extension updates if needed
        console.log(`Updated from version ${previousVersion}`);
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'getCategories':
                    const result = await browser.storage.local.get(['categories']);
                    return { categories: result.categories || [] };
                
                case 'saveCategories':
                    await browser.storage.local.set({ categories: message.categories });
                    return { success: true };
                
                default:
                    return { error: 'Unknown action' };
            }
        } catch (error) {
            console.error('Background script error:', error);
            return { error: error.message };
        }
    }
}

// Initialize background manager
new BackgroundManager();