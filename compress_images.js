const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'images');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));

console.log("Starting image compression...");
files.forEach(f => {
  const p = path.join(imgDir, f);
  const sizeBefore = fs.statSync(p).size;
  const tempOut = path.join(imgDir, 'temp_' + f);
  
  // Scale to max width 1920, set JPEG quality q=5 (roughly 80% quality)
  const cmd = `ffmpeg -y -i "${p}" -vf "scale='min(1920,iw)':-1" -q:v 5 "${tempOut}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    if (fs.existsSync(tempOut)) {
      fs.unlinkSync(p);
      fs.renameSync(tempOut, p);
      const sizeAfter = fs.statSync(p).size;
      console.log(`✓ ${f}: ${(sizeBefore/1024/1024).toFixed(2)} MB -> ${(sizeAfter/1024).toFixed(0)} KB`);
    } else {
      console.error(`✕ ${f}: compression did not output a file`);
    }
  } catch (err) {
    console.error(`✕ Failed to compress ${f}:`, err.message);
  }
});
console.log("Image compression complete!");
