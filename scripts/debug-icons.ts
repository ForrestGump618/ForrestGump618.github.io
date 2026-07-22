import { readdirSync, readFileSync } from "fs";

const astro = readFileSync("astro.config.mjs", "utf-8");
const inlineIdx = astro.indexOf("PlayformInline");
console.log("PlayformInline context:", astro.substring(inlineIdx - 50, inlineIdx + 100));

// Check if the Icons.astro file is being scanned by UnoCSS
const html = readFileSync("dist/index.html", "utf-8");
// Look at the Layout.Cy5eKTBR.css for icon rules
for (const f of readdirSync("dist/_astro/").filter(x => x.endsWith(".css"))) {
  const css = readFileSync("dist/_astro/" + f, "utf-8");
  const iconCount = (css.match(/i-ri-/g) || []).length;
  if (iconCount > 0) {
    console.log(f + " has " + iconCount + " icon refs");
  }
}

// List all CSS files with their sizes
console.log("\nAll CSS files:");
for (const f of readdirSync("dist/_astro/").filter(x => x.endsWith(".css"))) {
  const css = readFileSync("dist/_astro/" + f, "utf-8");
  console.log(f + ": " + css.length + " bytes, icon refs: " + (css.match(/i-ri-/g) || []).length);
}
