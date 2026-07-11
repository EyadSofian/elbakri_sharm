/**
 * Guard against Lovable coupling, remote image sources, and placeholder links
 * leaking into the rebuilt project (npm run check:no-lovable).
 * Exits non-zero if any forbidden pattern is found.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "scripts", "public", "reports"];
const SCAN_ROOT_FILES = ["next.config.mjs", "package.json", "README.md", "README-IMAGES.md"];
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".jsx", ".css", ".json", ".md", ".html"]);
const SELF = "check-no-lovable.ts";

// Tokens assembled from parts so this scanner file never matches itself.
const L = "lovable";
// `codeOnly` patterns are skipped for Markdown/docs (prose legitimately mentions
// href="#" and image URLs when describing the rules).
const forbidden: { name: string; re: RegExp; codeOnly?: boolean }[] = [
  { name: "@lovable.dev dependency", re: new RegExp(`@${L}\\.dev`) },
  { name: "Lovable __l5e asset path", re: /__l5e/ },
  { name: "lovable.app preview host", re: new RegExp(`${L}\\.app`) },
  { name: ".lovable metadata dir", re: new RegExp(`\\.${L}/`) },
  { name: "Lovable R2 preview key", re: /assets-v1\/[0-9a-f-]{36}/ },
  { name: "remote image src (http)", re: /(?:src=|image:\s*|url\()\s*["'{(]?https?:\/\/[^"')\s]+\.(?:png|jpe?g|webp|gif|svg)/i, codeOnly: true },
  { name: "unsplash remote image", re: /images\.unsplash\.com/ },
  { name: 'placeholder link href="#"', re: /href=["']#["']/, codeOnly: true },
];

const violations: string[] = [];

function walk(dir: string) {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (["node_modules", ".next", ".git", "out", "build"].includes(name)) continue;
      walk(full);
    } else if (st.isFile()) {
      scanFile(full);
    }
  }
}

function scanFile(file: string) {
  if (basename(file) === SELF) return; // never scan the scanner
  if (!TEXT_EXT.has(extname(file))) return;
  try {
    if (statSync(file).size > 2_000_000) return;
  } catch {
    return;
  }
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);
  const isMd = extname(file) === ".md";
  text.split(/\r?\n/).forEach((line, i) => {
    for (const f of forbidden) {
      if (isMd && f.codeOnly) continue;
      if (f.re.test(line)) {
        violations.push(`${rel}:${i + 1}  [${f.name}]  ${line.trim().slice(0, 120)}`);
      }
    }
  });
}

for (const d of SCAN_DIRS) walk(join(ROOT, d));
for (const f of SCAN_ROOT_FILES) {
  try {
    if (statSync(join(ROOT, f)).isFile()) scanFile(join(ROOT, f));
  } catch {
    /* file may not exist yet */
  }
}

if (violations.length) {
  console.error(`\n✗ check:no-lovable found ${violations.length} issue(s):\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error("");
  process.exit(1);
} else {
  console.log("\n✓ check:no-lovable passed — no Lovable coupling, remote images, or dead links.\n");
  process.exit(0);
}
