import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function optimizeImages(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await optimizeImages(fullPath);
    } else if (file.name.match(/\.(jpg|jpeg|png)$/i)) {
      try {
        const metadata = await sharp(fullPath).metadata();
        
        // Skip small images or logos to avoid blurring them too much
        if (metadata.width > 800 || (metadata.size && metadata.size > 150000)) {
          console.log(`Optimizing: ${file.name} (Original: ${metadata.width}x${metadata.height})`);
          
          const tempPath = fullPath + '.tmp';
          await sharp(fullPath)
            .resize({ 
              width: metadata.width > 800 ? 800 : metadata.width, 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 80, progressive: true, force: false })
            .png({ quality: 80, force: false })
            .toFile(tempPath);
            
          await fs.rename(tempPath, fullPath);
        }
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

const assetsDir = path.join(process.cwd(), "src", "assets");
optimizeImages(assetsDir)
  .then(() => console.log("Done optimizing images!"))
  .catch(console.error);
