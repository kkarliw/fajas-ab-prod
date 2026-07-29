import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "https://fajas-ab-prod.onrender.com/api/v1/products";
const BASE_URL = "https://www.fajasab.com";

const STATIC_PAGES = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/size-guide",
  "/care",
  "/faq",
  "/pqr",
  "/privacy",
  "/terms",
  "/shipping",
  "/login"
];

async function generateSitemap() {
  console.log("Generating sitemap...");
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    const rawData = await res.json();
    const items = Array.isArray(rawData) ? rawData : (rawData.data || []);

    // Save catalog for instant frontend loading (SSG-like behavior)
    const catalogPath = path.join(__dirname, "../public/catalog.json");
    fs.writeFileSync(catalogPath, JSON.stringify(items));
    console.log("catalog.json generated successfully in public/catalog.json");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>${page === "" || page === "/shop" ? "daily" : "weekly"}</changefreq>
    <priority>${page === "" ? "1.0" : page === "/shop" ? "0.9" : "0.7"}</priority>
  </url>\n`;
    }

    // Dynamic products
    for (const product of items) {
      if (product.slug) {
        xml += `  <url>
    <loc>${BASE_URL}/product/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    }

    xml += `</urlset>`;

    const publicDir = path.resolve(__dirname, "../public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
    console.log("sitemap.xml generated successfully in public/sitemap.xml");

  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
