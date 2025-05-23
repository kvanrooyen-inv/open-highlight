class KeywordHighlighter {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.renderCategories();
        this.attachEventListeners();
    }

    async loadCategories() {
        try {
            const result = await browser.storage.local.get(['categories']);
            this.categories = result.categories || [
                {
                    id: Date.now(),
                    name: 'Important',
                    color: '#ffff00',
                    keywords: []
                }
            ];
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [{
                id: Date.now(),
                name: 'Important',
                color: '#ffff00',
                keywords: []
            }];
        }
    }

    async saveCategories() {
        try {
            await browser.storage.local.set({ categories: this.categories });
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }

    renderCategories() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `
                <div class="category-header">
                    <input type="text" class="category-name" value="${category.name}" 
                           data-id="${category.id}" placeholder="Category name">
                    <div class="color-controls">
                        <div class="color-display" style="background-color: ${category.color}">
                            <input type="color" class="color-picker" value="${category.color}" 
                                   data-id="${category.id}">
                        </div>
                        <input type="text" class="hex-input" value="${category.color}" 
                               data-id="${category.id}" placeholder="#000000" maxlength="7">
                    </div>
                    <button class="delete-category" data-id="${category.id}">Delete</button>
                </div>
                <textarea class="keywords-input" data-id="${category.id}" 
                          placeholder="Enter keywords separated by commas or new lines">${category.keywords.join(', ')}</textarea>
                <div class="keywords-help">Enter keywords separated by commas or line breaks</div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    attachEventListeners() {
        // Add category button
        document.getElementById('add-category').addEventListener('click', () => {
            this.addCategory();
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearHighlights();
        });

        // Dynamic event listeners for category inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('category-name')) {
                this.updateCategoryName(e.target.dataset.id, e.target.value);
            } else if (e.target.classList.contains('keywords-input')) {
                this.updateCategoryKeywords(e.target.dataset.id, e.target.value);
            } else if (e.target.classList.contains('hex-input')) {
                this.updateCategoryColorFromHex(e.target.dataset.id, e.target.value, e.target);
            } else if (e.target.classList.contains('color-picker')) {
                this.updateCategoryColorFromPicker(e.target.dataset.id, e.target.value, e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-category')) {
                this.deleteCategory(e.target.dataset.id);
            }
        });
    }

    addCategory() {
        const newCategory = {
            id: Date.now(),
            name: 'New Category',
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            keywords: []
        };
        this.categories.push(newCategory);
        this.saveCategories();
        this.renderCategories();
        this.notifyContentScript();
    }

    updateCategoryName(id, name) {
        const category = this.categories.find(c => c.id == id);
        if (category) {
            category.name = name;
            this.saveCategories();
            this.notifyContentScript();
        }
    }

    updateCategoryColorFromHex(id, hexValue, inputElement) {
        // Clean up the hex value
        let cleanHex = hexValue.trim().toUpperCase();
        
        // Add # if missing
        if (cleanHex && !cleanHex.startsWith('#')) {
            cleanHex = '#' + cleanHex;
        }
        
        // Update the input to show the corrected format
        if (inputElement.value !== cleanHex) {
            inputElement.value = cleanHex;
        }
        
        // Validate hex color format
        if (this.isValidHexColor(cleanHex)) {
            const category = this.categories.find(c => c.id == id);
            if (category) {
                category.color = cleanHex;
                this.saveCategories();
                this.notifyContentScript();
                
                // Update the color display and color picker
                const colorDisplay = inputElement.closest('.color-controls').querySelector('.color-display');
                const colorPicker = inputElement.closest('.color-controls').querySelector('.color-picker');
                
                if (colorDisplay) {
                    colorDisplay.style.backgroundColor = cleanHex;
                }
                if (colorPicker) {
                    colorPicker.value = cleanHex;
                }
                
                // Remove error styling
                inputElement.classList.remove('error');
            }
        } else if (cleanHex.length > 1) {
            // Show error styling for invalid colors (but not for empty input)
            inputElement.classList.add('error');
        } else {
            // Reset styling for empty input
            inputElement.classList.remove('error');
        }
    }

    updateCategoryColorFromPicker(id, color, pickerElement) {
        const category = this.categories.find(c => c.id == id);
        if (category) {
            category.color = color.toUpperCase();
            this.saveCategories();
            this.notifyContentScript();
            
            // Update the hex input and color display
            const hexInput = pickerElement.closest('.color-controls').querySelector('.hex-input');
            const colorDisplay = pickerElement.closest('.color-controls').querySelector('.color-display');
            
            if (hexInput) {
                hexInput.value = color.toUpperCase();
                hexInput.classList.remove('error');
            }
            if (colorDisplay) {
                colorDisplay.style.backgroundColor = color;
            }
        }
    }

    isValidHexColor(hex) {
        // Check if it's a valid hex color format
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(hex);
    }

    updateCategoryColor(id, color) {
        const category = this.categories.find(c => c.id == id);
        if (category) {
            category.color = color;
            this.saveCategories();
            this.notifyContentScript();
        }
    }

    updateCategoryKeywords(id, keywordsText) {
        const category = this.categories.find(c => c.id == id);
        if (category) {
            // Split by commas or newlines and clean up
            const keywords = keywordsText
                .split(/[,\n]/)
                .map(k => k.trim())
                .filter(k => k.length > 0);
            category.keywords = keywords;
            this.saveCategories();
            this.notifyContentScript();
        }
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id != id);
        this.saveCategories();
        this.renderCategories();
        this.notifyContentScript();
    }

    async notifyContentScript() {
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                await browser.tabs.sendMessage(tabs[0].id, {
                    action: 'categoriesUpdated',
                    categories: this.categories
                });
            }
        } catch (error) {
            // Content script might not be ready, that's okay
            console.log('Could not notify content script:', error);
        }
    }

    async clearHighlights() {
        try {
            // Get active tab
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0) return;

            // Send message to content script
            await browser.tabs.sendMessage(tabs[0].id, {
                action: 'clear'
            });

            this.showStatus('Highlights cleared!', 'success');
        } catch (error) {
            console.error('Error clearing highlights:', error);
            this.showStatus('Error clearing highlights', 'error');
        }
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new KeywordHighlighter();
});