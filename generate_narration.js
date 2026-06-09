const { EdgeTTS } = require('edge-tts-universal');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, "assets", "narration");
if (!fs.existsSync(OUT)) {
  fs.mkdirSync(OUT, { recursive: true });
}

const VOICE = "zh-TW-YunJheNeural";
const RATE = "-10%";
const PITCH = "-2Hz";

const SCRIPT = [
  [1, "當城市還在沉睡，我們已經背起行囊出發。"],
  [2, "天空微微亮起，山脊的輪廓逐漸清晰。"],
  [3, "金黃色的朝陽，溫暖了冰冷的空氣。"],
  [4, "朝著更高的地方，我們一步一步向上攀爬。"],
  [5, "陡峭的山路，考驗著我們的意志。"],
  [6, "在稀薄的空氣中，聆聽著自己的心跳聲。"],
  [7, "抬頭看著壯麗的圈谷，感覺自己的渺小。"],
  [8, "穿過重重考驗，我們終於站在雪山之巔。"],
  [9, "所有的汗水，在這一刻都化成了喜悅。"],
  [10, "山一直在這裡，而我們帶走了勇氣。"],
  [11, "雙腿雖然疲憊，心中的感動卻無比清晰。"],
  [12, "這不是終點，而是下一次出發的起點。"]
];

async function synth(i, text) {
  const padIndex = String(i).padStart(2, '0');
  const outFile = path.join(OUT, `page-${padIndex}.mp3`);
  
  const tts = new EdgeTTS(text, VOICE, { rate: RATE, pitch: PITCH });
  const { audio } = await tts.synthesize();
  const buffer = Buffer.from(await audio.arrayBuffer());
  fs.writeFileSync(outFile, buffer);
  console.log(`OK page-${padIndex}.mp3`);
}

async function main() {
  for (const [i, text] of SCRIPT) {
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await synth(i, text);
        success = true;
        break;
      } catch (e) {
        console.log(`retry ${i} (attempt ${attempt}): ${e.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!success) {
      console.error(`Failed to generate narration for page-${i}`);
      process.exit(1);
    }
  }
  console.log("All done.");
}

main();
