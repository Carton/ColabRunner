# KataGo Colab Extension

A Chrome extension for easy access to KataGo distributed training on Google Colab.

## Overview

This extension provides a convenient interface to launch KataGo distributed training sessions on Google Colab. It integrates with the KataGo distributed training system to contribute computing power for Go AI training.

## Prerequisites

- Google account with access to Google Colab
- GitHub account for KataGo distributed training
- Basic understanding of Go and AI training concepts

## Quick Start

### 1. Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

### 2. Setting up KataGo Distributed Training

The extension uses the KataGo distributed training setup from:
https://gist.githubusercontent.com/Carton/1da29b7f89144c7176543839ddc5f9bb

### 3. Configuration

Before running the training, you need to configure your credentials:

```python
# Replace with your actual credentials
USERNAME = "your_github_username"
PASSWD = "your_katago_password"

# Download and run the setup script
!wget -O katago_dist_setup.ipy "https://gist.githubusercontent.com/Carton/1da29b7f89144c7176543839ddc5f9bb/raw/katago_dist_setup.ipy"
%run katago_dist_setup.ipy
```

### 4. Important Notes

**Security Warning:** Never commit your actual username and password to version control or share them publicly.

**Recommended Setup:**
1. Create a `.env` file or use environment variables
2. Store credentials securely using Colab secrets
3. Use GitHub's personal access tokens instead of passwords when possible

### 5. Usage Instructions

1. Open Google Colab
2. Create a new notebook
3. Copy the configuration code above
4. Replace `your_github_username` with your actual GitHub username
5. Replace `your_katago_password` with your KataGo distributed training password
6. Run the cells to start training

## Extension Features

- **Quick Launch**: One-click access to Colab with pre-configured settings
- **Resource Monitoring**: Track GPU usage and training progress
- **Configuration Templates**: Pre-built code snippets for common setups

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your GitHub credentials
   - Check if your KataGo account is active
   - Ensure you're using the correct password (not GitHub password)

2. **GPU Not Available**
   - Try running at different times when GPU availability is higher
   - Consider using Colab Pro for better GPU access

3. **Memory Issues**
   - Reduce batch size in configuration
   - Use smaller network sizes if running into memory limits

### Getting Help

- Check the [KataGo distributed training documentation](https://katagotraining.org/)
- Review the [GitHub issues](https://github.com/lightvector/KataGo/issues)
- Join the KataGo Discord community for support

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

## Security Best Practices

- Never expose credentials in code
- Use environment variables for sensitive data
- Regularly update dependencies
- Review code for security vulnerabilities

## License

This project is open source. Please ensure compliance with KataGo's terms of service when using the distributed training system.

## Additional Resources

- [KataGo Official Repository](https://github.com/lightvector/KataGo)
- [KataGo Distributed Training](https://katagotraining.org/)
- [Google Colab Documentation](https://colab.research.google.com/)
- [Chrome Extension Development Guide](https://developer.chrome.com/docs/extensions/) 