# Colab Runner Extension

A Chrome extension for easy running and stopping of multiple Google Colab notebooks.

## Overview

This extension provides a convenient interface to run or stop multiple Google Colab notebooks at once, based on a title keyword.

## Quick Start

### 1. Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

### 2. Usage Instructions

1. Open the Colab notebooks you want to control.
2. Click the extension icon in your Chrome toolbar.
3. Enter a keyword to match the titles of the Colab tabs you want to control. If you leave it blank, it will match all Colab tabs.
4. Click "Run All Matching Tabs" to execute the first cell in each matched notebook.
5. Click "Stop All Matching Tabs" to interrupt execution in each matched notebook.

## Development

### Project Structure

```
colab_extension/
├── icons/              # Extension icons
├── manifest.json       # Extension manifest
├── popup.html         # Extension popup UI
├── popup.js          # Extension logic
└── test_colab_runner.js  # Colab integration
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.