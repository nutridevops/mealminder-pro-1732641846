const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy manifest and HTML files
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);
fs.copyFileSync(
  path.join(__dirname, 'popup.html'),
  path.join(distDir, 'popup.html')
);

// Copy JavaScript files
['popup.js', 'content.js', 'background.js'].forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, file),
    path.join(distDir, file)
  );
});

// Create icons directory
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

console.log('Extension built successfully in dist/ directory');
