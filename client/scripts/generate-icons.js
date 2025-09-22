// Icon generation script: requires `npm install --save-dev sharp`
// Usage: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
let sharp;
(async () => {
  try { sharp = require('sharp'); } catch (e) { console.error('Please install sharp: npm i -D sharp'); process.exit(1); }
  const sizes = [64,128,192,256,384,512];
  const srcBase = path.join(__dirname,'..','public','icons','logo-base.svg');
  const srcMask = path.join(__dirname,'..','public','icons','logo-maskable.svg');
  const outDir = path.join(__dirname,'..','public','icons');
  if(!fs.existsSync(srcBase)) { console.error('Missing logo-base.svg'); process.exit(1); }
  for (const s of sizes) {
    await sharp(srcBase).resize(s,s).png().toFile(path.join(outDir,`icon-${s}.png`));
    await sharp(srcMask).resize(s,s).png().toFile(path.join(outDir,`maskable-${s}.png`));
    console.log('Generated', s);
  }
  console.log('Done. Update manifest.json if adding new sizes.');
})();
