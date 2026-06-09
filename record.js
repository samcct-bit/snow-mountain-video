const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'],
  });
  
  const rendersDir = path.join(__dirname, 'renders');
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: rendersDir, size: { width: 1920, height: 1080 } },
  });

  const page = await context.newPage();
  const fileUrl = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/') + '?render=true';
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl);
  
  console.log('Recording 61.5 seconds...');
  // The video is 60 seconds long. We wait 61.5 seconds to make sure it records everything.
  await page.waitForTimeout(61500);
  
  console.log('Closing browser...');
  await context.close();
  await browser.close();
  console.log('Recording done.');
  
  // Find the generated webm file in the renders directory
  const files = fs.readdirSync(rendersDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    // Sort by modification time to get the latest one
    files.sort((a, b) => {
      return fs.statSync(path.join(rendersDir, b)).mtime.getTime() - fs.statSync(path.join(rendersDir, a)).mtime.getTime();
    });
    const latestWebm = path.join(rendersDir, files[0]);
    const targetWebm = path.join(rendersDir, 'video.webm');
    if (fs.existsSync(targetWebm)) {
      fs.unlinkSync(targetWebm);
    }
    fs.renameSync(latestWebm, targetWebm);
    console.log(`WebM video saved to: ${targetWebm}`);
  } else {
    console.error('No WebM video was generated!');
  }
})();
