# AI Prompt Processor Browser Extension

A beautiful and modern browser extension that allows you to process text with AI using OpenAI GPT or Google Gemini APIs. The extension features a sleek dark theme with glassmorphism effects and smooth animations.

## Features

✨ **Modern UI Design**
- Beautiful glassmorphism design with gradient backgrounds
- Smooth animations and transitions
- Responsive layout that works on all screen sizes
- Dark theme with vibrant accent colors

🤖 **AI Integration**
- Support for OpenAI GPT models
- Support for Google Gemini models
- Configurable API keys through settings
- Multiple prompt types (analyze, summarize, translate, rewrite, creative, code)
- Custom prompt support

⚙️ **Advanced Settings**
- Adjustable temperature and max tokens
- Secure API key storage
- Easy settings management
- Real-time configuration updates

📋 **User Experience**
- One-click copy to clipboard
- Loading animations
- Error handling with helpful messages
- Keyboard shortcuts (Ctrl+Enter to process)

## Installation

### For Chrome/Chromium Browsers:

1. **Download the Extension Files**
   - Download all files from this repository
   - Keep the folder structure intact

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "AI Prompt Processor" and click the pin icon

### For Firefox:

1. **Open Firefox**
   - Go to `about:debugging`
   - Click "This Firefox"

2. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the extension folder

## Setup

### Getting API Keys

**OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Google Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AI`)

### Configuring the Extension

1. **Open the Extension**
   - Click the extension icon in your browser toolbar

2. **Access Settings**
   - Click the settings (gear) icon in the top right

3. **Enter API Keys**
   - Paste your OpenAI API key in the "OpenAI API Key" field
   - Paste your Gemini API key in the "Gemini API Key" field
   - Adjust max tokens and temperature as needed

4. **Save Settings**
   - Click "Save Settings"

## Usage

### Basic Usage

1. **Enter Text**
   - Type or paste your text in the main text area

2. **Select Prompt Type**
   - Choose from predefined prompt types:
     - **Analyze**: Get insights about content, tone, and themes
     - **Summarize**: Create concise summaries
     - **Translate**: Translate between languages
     - **Rewrite**: Improve clarity and readability
     - **Creative**: Generate creative content
     - **Code**: Generate code based on requirements
     - **Custom**: Use your own custom prompt

3. **Choose AI Model**
   - Select between OpenAI GPT or Google Gemini

4. **Process**
   - Click "Process with AI" or press Ctrl+Enter
   - Wait for the AI response
   - Copy results with the copy button

### Advanced Features

**Custom Prompts:**
- Select "Custom" from prompt type dropdown
- Enter your own prompt in the custom prompt field
- The extension will combine your prompt with the input text

**Settings Configuration:**
- **Max Tokens**: Control response length (1-4000)
- **Temperature**: Control creativity/randomness (0.0-2.0)
  - Lower values = more focused and deterministic
  - Higher values = more creative and random

## File Structure

```
AI-Prompt-Processor/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.js              # Main JavaScript logic
├── styles.css            # Styling and animations
├── icons/
│   ├── icon.svg          # SVG icon source
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

## Privacy & Security

- **API Keys**: Stored securely in browser's sync storage
- **Data Processing**: Text is sent directly to chosen AI service
- **No Data Collection**: Extension doesn't collect or store your text
- **Local Storage**: All settings stored locally in your browser

## Troubleshooting

### Common Issues

**"Please configure your API key" Error:**
- Make sure you've entered a valid API key in settings
- Check that the API key is active and has credits

**"API Error" Messages:**
- Verify your API key is correct
- Check your internet connection
- Ensure you have sufficient API credits

**Extension Not Loading:**
- Make sure all files are in the same folder
- Check that `manifest.json` is valid
- Try reloading the extension

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct and active
3. Ensure you have internet connectivity
4. Try reloading the extension

## Development

### Building Icons

To generate PNG icons from the SVG:
```bash
# Using ImageMagick (if installed)
convert icons/icon.svg -resize 16x16 icons/icon16.png
convert icons/icon.svg -resize 48x48 icons/icon48.png
convert icons/icon.svg -resize 128x128 icons/icon128.png
```

### Customization

The extension is built with modern web technologies:
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations, and glassmorphism
- **JavaScript ES6+**: Modern JavaScript with classes and async/await
- **Chrome Extensions API**: For storage and permissions

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Enjoy using the AI Prompt Processor! 🚀**
