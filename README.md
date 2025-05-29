# Open Highlight 🎨

A free and open-source browser extension that automatically highlights keywords on web pages using customizable categories and colors. Perfect for research, studying, content analysis, or simply making important information stand out while browsing.

## ✨ What Does It Do?

Open Highlight helps you **automatically spot important keywords** on any webpage by highlighting them in different colors. Instead of manually searching for terms, the extension does the work for you by:

- **Automatically highlighting** your chosen keywords as you browse
- **Organizing keywords** into different colored categories 
- **Working on any website** without requiring special setup
- **Updating highlights** instantly when you add new keywords

## 🚀 Quick Start Guide

### 1. Install the Extension
- **Chrome**: Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/ogdfilacpmeadajkhlfofcghafiepgpl)
- **Firefox**: Install from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/open-highlight/)

### 2. Add Your Keywords
1. Click the Open Highlight icon in your browser toolbar
2. You'll see a default "Important Terms" category
3. Add your keywords in the text box (separate with commas)
4. Example: `JavaScript, React, API, database`

### 3. Customize Categories
- **Change colors**: Click the color box to pick a new highlight color
- **Rename categories**: Click on the category name to edit it
- **Add more categories**: Use the "Add Category" button
- **Delete categories**: Click the "Delete" button (you must have at least one)

### 4. Start Browsing!
Your keywords will automatically be highlighted on any webpage you visit. No need to refresh - it works instantly!

## 🎯 Features

### 🏷️ **Category Management**
- Create unlimited categories for different types of keywords
- Each category has its own unique highlight color
- Easily rename, recolor, or delete categories
- Intuitive color picker with hex code support

### 🔍 **Smart Highlighting**
- **Automatic detection**: Highlights appear as soon as you visit a page
- **Word boundaries**: Only highlights complete words (not partial matches)
- **Dynamic updates**: New content that loads gets highlighted automatically
- **Performance optimized**: Works smoothly even on large pages

### ⚡ **User Experience**
- **Zero configuration**: Works immediately after installation
- **Persistent settings**: Your categories and keywords are saved
- **Cross-site functionality**: Highlights work on all websites
- **Easy clearing**: One-click to remove all highlights temporarily

## 🛠️ How to Use

### Basic Usage
1. **Open the popup**: Click the extension icon in your toolbar
2. **Add keywords**: Type keywords separated by commas in any category
3. **Browse normally**: Keywords will be highlighted automatically
4. **Manage categories**: Add, delete, or modify categories as needed

## 🔧 Technical Information

### Key Technologies
- Pure JavaScript (no external dependencies)
- Chrome/Firefox Extension APIs
- Local storage for settings persistence
- CSS transitions and animations
- DOM TreeWalker for efficient text processing

### Performance Features
- **Efficient text scanning**: Uses TreeWalker API for optimal performance
- **Debounced updates**: Prevents excessive re-highlighting
- **Mutation observation**: Automatically handles dynamic content
- **Memory management**: Cleans up resources properly

## 📥 Installation

### From Browser Stores
- **Chrome Web Store**: [Install Open Highlight](https://chromewebstore.google.com/detail/ogdfilacpmeadajkhlfofcghafiepgpl)
- **Mozilla Add-ons**: [Install Open Highlight](https://addons.mozilla.org/en-US/firefox/addon/open-highlight/)

### Manual Installation (Development)
1. Fork this repository. 
2. Clone your fork of the repository: `git clone [repository-url]`
3. Open Chrome/Firefox extension management page
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `src` folder
6. The extension will appear in your toolbar

## 🤝 Contributing

Open Highlight is open source and welcomes contributions! Here's how you can help:

### For Non-Technical Users
- 🐛 **Report bugs** or suggest features via Issues
- 📝 **Share use cases** and workflow suggestions  
- 🌟 **Rate and review** on browser stores
- 📢 **Spread the word** to colleagues and friends

### For Developers  
- 🔧 **Fix bugs** and implement features
- 📚 **Improve documentation** 
- 🧪 **Add tests** and improve code quality
- 🎨 **Enhance UI/UX** design

### Development Setup
```bash
# Clone repository
git clone [repository-url]
cd open-highlight

# Load in browser (Chrome example)
# 1. Go to chrome://extensions/
# 2. Enable Developer mode  
# 3. Click "Load unpacked"
# 4. Select the 'src' folder
```

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Free to use** for personal and commercial purposes
- ✅ **Free to modify** and customize for your needs
- ✅ **Free to distribute** copies to others
- ⚠️ **Must remain open source** if you distribute modifications
- ⚠️ **Must include license** in any distributions

## 🆘 Support & FAQ

### Common Questions

**Q: Do I need to add keywords manually?**  
A: Yes! The extension doesn't come with pre-loaded keywords. You need to add the specific terms you want to highlight based on your needs.

**Q: Will it slow down my browsing?**  
A: No, the extension is optimized for performance and won't noticeably impact page loading or browsing speed.

**Q: Can I share my keyword categories with teammates?**  
A: Currently, categories are stored locally.

**Q: Does it work on all websites?**  
A: Yes, it works on virtually all websites. Some sites with special security policies may limit functionality.

---

**Made with ❤️ by Keagan | Licensed under GPL-3.0 | Available on Chrome Web Store & Mozilla Add-ons**
