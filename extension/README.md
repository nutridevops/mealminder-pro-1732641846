# MealMinder Recipe Capture Extension

A browser extension for capturing recipes from any website and saving them to your MealMinder account.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` directory from this extension

## Development

1. Run `node build.js` to build the extension
2. The built extension will be in the `dist` directory
3. Load the extension in Chrome as described in the Installation section

## Features

- Captures recipe details from any website
- Automatically extracts ingredients, instructions, and nutritional information
- Saves recipes directly to your MealMinder account
- Works with schema.org recipe markup
- Fallback to basic page scraping for non-structured content

## Usage

1. Navigate to any recipe webpage
2. Click the MealMinder extension icon
3. Click "Capture Recipe"
4. The recipe will be automatically saved to your MealMinder account
