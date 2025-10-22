#!/usr/bin/env bun
// scripts/generate-favicons.ts - Generate placeholder favicons for Arsenal Lab

/**
 * Generates SVG-based favicon placeholders
 * For production, use a tool like sharp or imagemagick to convert to PNG/ICO
 */

const iconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="80"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">⚡</text>
</svg>
`.trim();

async function generateFavicons() {
  console.log('🎨 Generating favicon placeholders...\n');

  const files = [
    { name: 'public/icon-192.svg', size: 192, content: iconSVG },
    { name: 'public/icon-512.svg', size: 512, content: iconSVG },
    { name: 'public/apple-touch-icon.svg', size: 180, content: iconSVG },
    { name: 'public/favicon.svg', size: 32, content: iconSVG },
  ];

  for (const file of files) {
    await Bun.write(file.name, file.content);
    console.log(`✅ Created ${file.name}`);
  }

  // Create simple ICO placeholder (text file for now)
  const icoPlaceholder = `# Favicon ICO Placeholder
# Convert the SVG files to ICO format using:
# - ImageMagick: convert public/favicon.svg -define icon:auto-resize=16,32,48 public/favicon.ico
# - sharp (Node): sharp('public/favicon.svg').resize(32).toFile('public/favicon-32x32.png')
# - Online: https://realfavicongenerator.net/
`;

  await Bun.write('public/FAVICON_TODO.md', icoPlaceholder);

  console.log('\n📝 Created FAVICON_TODO.md with conversion instructions');
  console.log('\n💡 To create production-ready favicons:');
  console.log('   1. Visit https://realfavicongenerator.net/');
  console.log('   2. Upload public/icon-512.svg');
  console.log('   3. Download and extract to public/');
  console.log('\n✅ Favicon generation complete!');
}

// Run if called directly
if (import.meta.main) {
  await generateFavicons();
}

export { generateFavicons };
