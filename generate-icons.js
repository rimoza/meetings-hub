const fs = require('fs');
const path = require('path');

// Simple function to create a basic PNG data URL
function createIconDataURL(size) {
  // This creates a simple colored square as a base64 PNG
  // In a real project, you'd use proper image generation libraries
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="url(#gradient)"/>
      <path d="M${size * 0.25} ${size * 0.328}C${size * 0.25} ${size * 0.297} ${size * 0.272} ${size * 0.281} ${size * 0.297} ${size * 0.281}H${size * 0.703}C${size * 0.728} ${size * 0.281} ${size * 0.75} ${size * 0.297} ${size * 0.75} ${size * 0.328}V${size * 0.703}C${size * 0.75} ${size * 0.728} ${size * 0.728} ${size * 0.75} ${size * 0.703} ${size * 0.75}H${size * 0.297}C${size * 0.272} ${size * 0.75} ${size * 0.25} ${size * 0.728} ${size * 0.25} ${size * 0.703}V${size * 0.328}Z" stroke="white" stroke-width="${size * 0.047}" fill="none"/>
      <path d="M${size * 0.75} ${size * 0.406}L${size * 0.25} ${size * 0.406}" stroke="white" stroke-width="${size * 0.047}"/>
      <path d="M${size * 0.375} ${size * 0.1875}L${size * 0.375} ${size * 0.375}" stroke="white" stroke-width="${size * 0.047}" stroke-linecap="round"/>
      <path d="M${size * 0.625} ${size * 0.1875}L${size * 0.625} ${size * 0.375}" stroke="white" stroke-width="${size * 0.047}" stroke-linecap="round"/>
      <circle cx="${size * 0.375}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
      <circle cx="${size * 0.5}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
      <circle cx="${size * 0.625}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
      <circle cx="${size * 0.375}" cy="${size * 0.625}" r="${size * 0.031}" fill="white"/>
      <circle cx="${size * 0.5}" cy="${size * 0.625}" r="${size * 0.031}" fill="white"/>
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
          <stop stop-color="#B68D2C"/>
          <stop offset="1" stop-color="#D4A943"/>
        </linearGradient>
      </defs>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

// Generate icons for different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="url(#gradient)"/>
    <path d="M${size * 0.25} ${size * 0.328}C${size * 0.25} ${size * 0.297} ${size * 0.272} ${size * 0.281} ${size * 0.297} ${size * 0.281}H${size * 0.703}C${size * 0.728} ${size * 0.281} ${size * 0.75} ${size * 0.297} ${size * 0.75} ${size * 0.328}V${size * 0.703}C${size * 0.75} ${size * 0.728} ${size * 0.728} ${size * 0.75} ${size * 0.703} ${size * 0.75}H${size * 0.297}C${size * 0.272} ${size * 0.75} ${size * 0.25} ${size * 0.728} ${size * 0.25} ${size * 0.703}V${size * 0.328}Z" stroke="white" stroke-width="${size * 0.047}" fill="none"/>
    <path d="M${size * 0.75} ${size * 0.406}L${size * 0.25} ${size * 0.406}" stroke="white" stroke-width="${size * 0.047}"/>
    <path d="M${size * 0.375} ${size * 0.1875}L${size * 0.375} ${size * 0.375}" stroke="white" stroke-width="${size * 0.047}" stroke-linecap="round"/>
    <path d="M${size * 0.625} ${size * 0.1875}L${size * 0.625} ${size * 0.375}" stroke="white" stroke-width="${size * 0.047}" stroke-linecap="round"/>
    <circle cx="${size * 0.375}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
    <circle cx="${size * 0.5}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
    <circle cx="${size * 0.625}" cy="${size * 0.531}" r="${size * 0.031}" fill="white"/>
    <circle cx="${size * 0.375}" cy="${size * 0.625}" r="${size * 0.031}" fill="white"/>
    <circle cx="${size * 0.5}" cy="${size * 0.625}" r="${size * 0.031}" fill="white"/>
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
        <stop stop-color="#B68D2C"/>
        <stop offset="1" stop-color="#D4A943"/>
      </linearGradient>
    </defs>
  </svg>`;
  
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`Created ${filename}`);
});

console.log('Icons generated successfully!');
console.log('Note: These are SVG icons. For production, convert them to PNG using a tool like ImageMagick or online converters.');