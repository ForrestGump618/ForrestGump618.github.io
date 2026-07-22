// Migration script: transforms Hexo frontmatter to ShokaX Astro format
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const SOURCE = "source/_posts";
const TARGET = "src/posts";

function migrateFrontmatter(raw: string): string {
  // Split frontmatter from body
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    console.log("  WARN: No frontmatter found, copying as-is");
    return raw;
  }

  const [, fmRaw, body] = match;
  let fm;
  try {
    fm = parseYaml(fmRaw) || {};
  } catch (e) {
    console.log(`  ERROR parsing YAML: ${e}`);
    return raw;
  }

  // 1. Fix date: strip time portion "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DD"
  if (fm.date) {
    const dateStr = String(fm.date);
    const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      fm.date = dateMatch[1];
    }
  }

  // 2. Fix categories: bare string -> array
  if (typeof fm.categories === "string") {
    fm.categories = [fm.categories];
  }

  // 3. Remove fields NOT in the new Zod schema (src/content.config.ts)
  // The new schema has: title, description, date, updated, tags, categories, draft, cover, sticky, license, encrypted, password
  delete fm.comments;
  delete fm.math;
  delete fm.layout;
  delete fm.type;
  delete fm.photos;
  delete fm.excerpt;
  delete fm.toc;
  delete fm.permalink;
  delete fm.top;

  // 4. Ensure tags is an array if it's a bare string
  if (fm.tags && !Array.isArray(fm.tags)) {
    fm.tags = [fm.tags];
  }

  // 5. If tags has duplicates, dedupe (unlikely but safe)
  if (Array.isArray(fm.tags)) {
    fm.tags = [...new Set(fm.tags)];
  }

  // Reconstruct frontmatter
  const newFm = stringifyYaml(fm, { lineWidth: 0 }).trim();
  return `---\n${newFm}\n---\n${body}`;
}

function migratePosts() {
  if (!existsSync(TARGET)) {
    mkdirSync(TARGET, { recursive: true });
  }

  const entries = readdirSync(SOURCE, { withFileTypes: true });
  const dirNames = new Set(entries.filter(e => e.isDirectory()).map(e => e.name));
  let migrated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const srcPath = join(SOURCE, entry.name);

    // Skip hidden files/dirs (except .obsidian)
    if (entry.name.startsWith(".") && entry.name !== ".obsidian") continue;

    if (entry.isDirectory()) {
      const dirContents = readdirSync(srcPath).filter(f => !f.startsWith("."));
      const mdFiles = dirContents.filter(f => f.endsWith(".md"));
      const assets = dirContents.filter(f => !f.endsWith(".md"));

      if (mdFiles.length === 0 && assets.length === 0) {
        console.log(`SKIP (empty dir): ${entry.name}`);
        skipped++;
        continue;
      }

      // This is an asset-only directory (like "LINGER：从单细胞多组学数据推断基因调控网络/")
      // If there's a same-named .md file at the root, we'll handle it there.
      // If there's no matching .md file, this is a post dir where the .md is inside.
      const hasStandaloneMd = dirNames.has(entry.name)
        ? existsSync(join(SOURCE, `${entry.name}.md`))
        : false;

      // We handle this when processing the standalone .md file
      // But if the .md is INSIDE this directory, we process it here
      if (mdFiles.length > 0) {
        const targetDir = join(TARGET, entry.name);
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        // Copy assets
        for (const asset of assets) {
          const srcAsset = join(srcPath, asset);
          const dstAsset = join(targetDir, asset);
          if (statSync(srcAsset).isFile()) {
            writeFileSync(dstAsset, readFileSync(srcAsset));
          }
        }

        // Migrate .md files
        for (const mdFile of mdFiles) {
          const srcMd = join(srcPath, mdFile);
          const raw = readFileSync(srcMd, "utf-8");
          const newContent = migrateFrontmatter(raw);
          const dstMd = join(targetDir, mdFile);
          writeFileSync(dstMd, newContent);
          console.log(`OK: ${entry.name}/${mdFile}`);
          migrated++;
        }
      }
    } else if (entry.name.endsWith(".md")) {
      // Standalone .md file
      const raw = readFileSync(srcPath, "utf-8");

      // Check if there's a same-named directory with assets
      const dirName = entry.name.replace(/\.md$/, "");
      const assetDir = join(SOURCE, dirName);
      const hasAssetDir = existsSync(assetDir) && statSync(assetDir).isDirectory();

      if (hasAssetDir) {
        // Move .md file INTO the asset directory
        const targetDir = join(TARGET, dirName);
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        // Copy any existing assets
        const dirContents = readdirSync(assetDir).filter(f => !f.startsWith("."));
        for (const asset of dirContents) {
          if (!asset.endsWith(".md")) {
            const srcAsset = join(assetDir, asset);
            if (statSync(srcAsset).isFile()) {
              writeFileSync(join(targetDir, asset), readFileSync(srcAsset));
            }
          }
        }

        // Write the migrated .md inside the directory
        const newContent = migrateFrontmatter(raw);
        // Use the same filename, or "index.md" if preferred
        // Actually, Astro content collections work with any filename
        writeFileSync(join(targetDir, entry.name), newContent);
        console.log(`OK (with assets): ${dirName}/${entry.name}`);
        migrated++;
      } else {
        // Plain standalone .md file, no assets
        const newContent = migrateFrontmatter(raw);
        writeFileSync(join(TARGET, entry.name), newContent);
        console.log(`OK: ${entry.name}`);
        migrated++;
      }
    }
  }

  // Copy .obsidian to target
  const obsidianSrc = join(SOURCE, ".obsidian");
  const obsidianDst = join(TARGET, ".obsidian");
  if (existsSync(obsidianSrc)) {
    if (!existsSync(obsidianDst)) {
      mkdirSync(obsidianDst, { recursive: true });
    }
    const obsidianFiles = readdirSync(obsidianSrc);
    for (const f of obsidianFiles) {
      writeFileSync(join(obsidianDst, f), readFileSync(join(obsidianSrc, f)));
    }
    console.log("OK: .obsidian/ config copied");
  }

  console.log(`\nDone: ${migrated} posts migrated, ${skipped} empty dirs skipped`);
}

migratePosts();
