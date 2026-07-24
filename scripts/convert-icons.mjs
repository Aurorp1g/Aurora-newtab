import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const iconsDir = join(rootDir, "icons");

// 图标尺寸配置
const sizes = [16, 32, 48, 128];

async function convertSvgToPng() {
  console.log("🎨 开始转换 SVG 图标为 PNG...\n");

  // 读取主 SVG 文件
  const svgPath = join(iconsDir, "logo.svg");
  const svgBuffer = readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ 已生成: icon-${size}.png (${size}x${size})`);
  }

  console.log("\n🎉 所有 PNG 图标生成完成!");
}

convertSvgToPng().catch(console.error);
