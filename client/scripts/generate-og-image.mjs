import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../public/og-image.png");

const logoPath = resolve(__dirname, "../public/favicon.png");
const logoBase64 = readFileSync(logoPath).toString("base64");
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f0f7ff"/>
  <rect x="0" y="0" width="1200" height="6" fill="#3b82f6"/>

  <!-- 메인 타이틀 -->
  <text x="600" y="260" font-family="sans-serif" font-size="72" font-weight="800" fill="#111827" text-anchor="middle">주유 할인카드</text>
  <text x="600" y="350" font-family="sans-serif" font-size="72" font-weight="800" fill="#3b82f6" text-anchor="middle">비교 계산기</text>

  <!-- 브랜드 -->
  <image href="${logoDataUri}" x="524" y="430" width="36" height="36"/>
  <text x="568" y="456" font-family="sans-serif" font-size="20" font-weight="600" fill="#9ca3af">ShakiLabs</text>
</svg>
`;

await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outputPath);
console.log(`OG image generated: ${outputPath}`);
