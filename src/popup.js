// Fixed popup.js - Keyword highlighting with categories
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  try {
      await loadCategories();
      setupEventListeners();
  } catch (error) {
      console.error('Error initializing popup:', error);
      showStatus('Error loading extension', 'error');
  }
});

let categories = [];

async function loadCategories() {
  try {
      const result = await browser.storage.local.get(['categories']);
      categories = result.categories || [];
      
      // Add default category if none exist
      if (categories.length === 0) {
          categories = [{
              id: Date.now().toString(),
              name: 'Important Terms',
              color: '#ffff00',
              keywords: []
          }];
          await saveCategories();
      }
      
      renderCategories();
  } catch (error) {
      console.error('Error loading categories:', error);
      showStatus('Error loading categories', 'error');
  }
}

async function saveCategories() {
  try {
      await browser.storage.local.set({ categories: categories });
      
      // Notify content script about category updates
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab) {
          await browser.tabs.sendMessage(tab.id, {
              action: 'categoriesUpdated',
              categories: categories
          });
      }
  } catch (error) {
      console.error('Error saving categories:', error);
      showStatus('Error saving categories', 'error');
  }
}

function renderCategories() {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';
  
  categories.forEach((category, index) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';
      categoryDiv.innerHTML = `
          <div class="category-header">
              <input type="text" class="category-name" value="${category.name}" 
                     placeholder="Category name" data-index="${index}">
              <div class="color-controls">
                  <div class="color-display" style="background-color: ${category.color}">
                      <input type="color" class="color-picker" value="${category.color}" 
                             data-index="${index}">
                  </div>
                  <input type="text" class="hex-input" value="${category.color}" 
                         data-index="${index}" maxlength="7">
                  <div class="color-label">Color</div>
              </div>
              <button class="delete-category" data-index="${index}">Delete</button>
          </div>
          <textarea class="keywords-input" placeholder="Enter keywords separated by commas" 
                    data-index="${index}">${category.keywords.join(', ')}</textarea>
          <div class="keywords-help">Enter keywords separated by commas (e.g., JavaScript, React, API)</div>
      `;
      container.appendChild(categoryDiv);
  });
}

function setupEventListeners() {
  // Add category button
  document.getElementById('add-category').addEventListener('click', addCategory);
  
  // Clear highlights button
  document.getElementById('clear-btn').addEventListener('click', clearHighlights);
  
  // Event delegation for dynamic elements
  document.getElementById('categories-container').addEventListener('input', handleCategoryInput);
  document.getElementById('categories-container').addEventListener('click', handleCategoryClick);
}

function handleCategoryInput(e) {
  const index = parseInt(e.target.dataset.index);
  if (isNaN(index)) return;
  
  if (e.target.classList.contains('category-name')) {
      categories[index].name = e.target.value;
      debounce(saveCategories, 500);
  } else if (e.target.classList.contains('color-picker')) {
      const color = e.target.value;
      categories[index].color = color;
      
      // Update hex input and color display
      const hexInput = e.target.parentElement.parentElement.querySelector('.hex-input');
      const colorDisplay = e.target.parentElement;
      hexInput.value = color;
      colorDisplay.style.backgroundColor = color;
      
      debounce(saveCategories, 500);
  } else if (e.target.classList.contains('hex-input')) {
      const hexValue = e.target.value;
      
      // Validate hex color
      if (isValidHexColor(hexValue)) {
          categories[index].color = hexValue;
          
          // Update color picker and display
          const colorPicker = e.target.parentElement.querySelector('.color-picker');
          const colorDisplay = e.target.parentElement.parentElement.querySelector('.color-display');
          colorPicker.value = hexValue;
          colorDisplay.style.backgroundColor = hexValue;
          
          e.target.classList.remove('error');
          debounce(saveCategories, 500);
      } else {
          e.target.classList.add('error');
      }
  } else if (e.target.classList.contains('keywords-input')) {
      const keywords = e.target.value
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);
      
      categories[index].keywords = keywords;
      debounce(saveCategories, 500);
  }
}

function handleCategoryClick(e) {
  if (e.target.classList.contains('delete-category')) {
      const index = parseInt(e.target.dataset.index);
      if (!isNaN(index)) {
          deleteCategory(index);
      }
  }
}

async function addCategory() {
  const newCategory = {
      id: Date.now().toString(),
      name: `Category ${categories.length + 1}`,
      color: getRandomColor(),
      keywords: []
  };
  
  categories.push(newCategory);
  await saveCategories();
  renderCategories();
  showStatus('Category added successfully', 'success');
}

async function deleteCategory(index) {
  if (categories.length <= 1) {
      showStatus('Cannot delete the last category', 'error');
      return;
  }
  
  categories.splice(index, 1);
  await saveCategories();
  renderCategories();
  showStatus('Category deleted successfully', 'success');
}

async function clearHighlights() {
  try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab) {
          await browser.tabs.sendMessage(tab.id, { action: 'clear' });
          showStatus('Highlights cleared successfully', 'success');
      }
  } catch (error) {
      console.error('Error clearing highlights:', error);
      showStatus('Error clearing highlights', 'error');
  }
}

// Utility functions
function isValidHexColor(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function getRandomColor() {
  const colors = ['#ffff00', '#00ff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#ff0080'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  setTimeout(() => {
      statusEl.style.display = 'none';
  }, 3000);
}

// Debounce function to avoid excessive saves
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}