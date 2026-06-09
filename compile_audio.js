const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(process.env.TEMP || '/tmp', 'cvs-render', 'audio-build');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log("Padding narration audios to exactly 5.0 seconds...");
const listLines = [];
for (let i = 1; i <= 12; i++) {
  const padIndex = String(i).padStart(2, '0');
  const src = path.join(__dirname, 'assets', 'narration', `page-${padIndex}.mp3`);
  const dst = path.join(tempDir, `p${padIndex}.mp3`);
  
  // Pad with silence to 5.0 seconds
  const cmd = `ffmpeg -y -i "${src}" -af "apad" -t 5 "${dst}"`;
  execSync(cmd, { stdio: 'ignore' });
  listLines.push(`file 'p${padIndex}.mp3'`);
}

// Write list.txt
const listPath = path.join(tempDir, 'list.txt');
fs.writeFileSync(listPath, listLines.join('\n'));

// Concat
console.log("Concatenating narration audios...");
const concatOut = path.join(tempDir, 'master_audio.mp3');
const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${concatOut}"`;
execSync(concatCmd, { stdio: 'ignore' });

// Copy master_audio to renders/ folder
const finalNarration = path.join(__dirname, 'renders', 'master_audio.mp3');
if (!fs.existsSync(path.dirname(finalNarration))) {
  fs.mkdirSync(path.dirname(finalNarration), { recursive: true });
}
fs.copyFileSync(concatOut, finalNarration);

// Mix with BGM and fade out
console.log("Mixing with BGM and applying fade out...");
const bgmPath = path.join(__dirname, 'assets', 'audio', 'bgm.mp3');
const finalMixed = path.join(__dirname, 'renders', 'master_audio_mixed.mp3');
const mixCmd = `ffmpeg -y -i "${concatOut}" -i "${bgmPath}" -filter_complex "[0:a]volume=1.0[vov]; [1:a]volume=0.15[bgm]; [vov][bgm]amix=inputs=2:duration=first[mixed]; [mixed]afade=t=out:st=50:d=10[out]" -map "[out]" -c:a mp3 -b:a 192k "${finalMixed}"`;
execSync(mixCmd, { stdio: 'ignore' });

console.log("Audio compilation complete! Mixed file: " + finalMixed);
