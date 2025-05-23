class ContentHighlighter {
    constructor() {
        this.highlightClass = 'keyword-highlight';
        this.originalContent = new Map();
        this.categories = [];
        this.init();
    }

    async init() {
        // Load categories and highlight immediately
        await this.loadCategories();
        this.autoHighlight();

        // Listen for messages from popup
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'highlight') {
                this.categories = message.categories;
                this.highlightKeywords(message.categories);
                sendResponse({ success: true });
            } else if (message.action === 'clear') {
                this.clearHighlights();
                sendResponse({ success: true });
            } else if (message.action === 'categoriesUpdated') {
                this.categories = message.categories;
                this.autoHighlight();
                sendResponse({ success: true });
            }
        });

        // Listen for storage changes to auto-update highlights
        browser.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.categories) {
                this.categories = changes.categories.newValue || [];
                this.autoHighlight();
            }
        });

        // Re-highlight when new content is added dynamically
        this.observePageChanges();
    }

    async loadCategories() {
        try {
            const result = await browser.storage.local.get(['categories']);
            this.categories = result.categories || [];
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [];
        }
    }

    autoHighlight() {
        if (this.categories && this.categories.length > 0) {
            this.highlightKeywords(this.categories);
        }
    }

    observePageChanges() {
        // Observe DOM changes for dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldReHighlight = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any text nodes were added
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.TEXT_NODE || 
                            (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim())) {
                            shouldReHighlight = true;
                            break;
                        }
                    }
                }
            });

            if (shouldReHighlight) {
                // Debounce re-highlighting to avoid excessive calls
                clearTimeout(this.highlightTimeout);
                this.highlightTimeout = setTimeout(() => {
                    this.autoHighlight();
                }, 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    highlightKeywords(categories) {
        // Clear existing highlights first
        this.clearHighlights();

        // Get all text nodes in the document
        const textNodes = this.getTextNodes(document.body);
        
        // Create a map of keywords to their colors
        const keywordMap = new Map();
        categories.forEach(category => {
            category.keywords.forEach(keyword => {
                if (keyword.trim()) {
                    keywordMap.set(keyword.toLowerCase().trim(), category.color);
                }
            });
        });

        if (keywordMap.size === 0) return;

        // Process each text node
        textNodes.forEach(node => {
            this.highlightTextNode(node, keywordMap);
        });
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (parent && (
                        parent.tagName === 'SCRIPT' || 
                        parent.tagName === 'STYLE' ||
                        parent.tagName === 'NOSCRIPT' ||
                        parent.contentEditable === 'true'
                    )) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Skip empty or whitespace-only nodes
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }

    highlightTextNode(textNode, keywordMap) {
        const originalText = textNode.textContent;
        let highlightedHTML = originalText;
        let hasHighlights = false;

        // Sort keywords by length (longest first) to avoid partial matches
        const keywords = Array.from(keywordMap.keys()).sort((a, b) => b.length - a.length);

        keywords.forEach(keyword => {
            const color = keywordMap.get(keyword);
            const textColor = this.getContrastColor(color);
            const regex = new RegExp(`\\b${this.escapeRegExp(keyword)}\\b`, 'gi');
            
            const newHTML = highlightedHTML.replace(regex, (match) => {
                hasHighlights = true;
                return `<span class="${this.highlightClass}" style="background-color: ${color}; color: ${textColor}; padding: 1px 2px; border-radius: 2px;">${match}</span>`;
            });
            
            highlightedHTML = newHTML;
        });

        // If we found highlights, replace the text node with highlighted HTML
        if (hasHighlights) {
            // Store original content for restoration
            this.originalContent.set(textNode, originalText);
            
            // Create a container element
            const container = document.createElement('span');
            container.innerHTML = highlightedHTML;
            container.classList.add('keyword-highlight-container');
            
            // Replace the text node with the container
            textNode.parentNode.replaceChild(container, textNode);
        }
    }

    getContrastColor(hexColor) {
        // Remove the hash if it exists
        const hex = hexColor.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate luminance using the relative luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black for light backgrounds, white for dark backgrounds
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    clearHighlights() {
        // Remove all highlight containers and restore original text
        const containers = document.querySelectorAll('.keyword-highlight-container');
        containers.forEach(container => {
            // Create a text node with the original content
            const textContent = container.textContent;
            const textNode = document.createTextNode(textContent);
            container.parentNode.replaceChild(textNode, container);
        });

        // Clear the original content map
        this.originalContent.clear();
    }
}

// Initialize the content highlighter
new ContentHighlighter();