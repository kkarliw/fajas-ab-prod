const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../src/data/catalog.ts');
let content = fs.readFileSync(catalogPath, 'utf8');

// Replace imports with string constants
// e.g. import product1 from "@/assets/product-1.jpg"; -> const product1 = "@/assets/product-1.jpg";
content = content.replace(/import\s+(\w+)\s+from\s+["']([^"']+)["'];/g, 'const $1 = "$2";');

// Remove the exports at the bottom that depend on DOM or React
content = content.replace(/const getInitialCatalog = \(\) => {[\s\S]*?};/g, '');
content = content.replace(/export const catalog: CatalogProduct\[\] = getInitialCatalog\(\);/g, '');
content = content.replace(/export const formatCOP = [\s\S]*?};/g, '');
content = content.replace(/export const getProductBySlug = [\s\S]*?catalog\[0\];/g, '');
content = content.replace(/export const getRelatedProducts = [\s\S]*?};/g, '');
content = content.replace(/export type .*?;/g, '');

// Append code to dump rawCatalog to JSON
content += `\n\nimport fs from 'fs';\nimport path from 'path';\nimport { fileURLToPath } from 'url';\nconst __dirname2 = path.dirname(fileURLToPath(import.meta.url));\nfs.writeFileSync(path.join(__dirname2, 'rawCatalog.json'), JSON.stringify(rawCatalog, null, 2));\n`;

const tempPath = path.join(__dirname, 'temp-catalog.ts');
fs.writeFileSync(tempPath, content);

console.log("Created temp-catalog.ts");
