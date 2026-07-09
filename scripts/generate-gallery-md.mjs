/**
 * Fetch tameubem.com gallery pages and generate src/content/gallery/*.md files.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const galleryDir = join(__dirname, "../src/content/gallery");

const pages = [
  { slug: "loom-weaving", url: "https://tameubem.com/loom-weaving", title: "Loom Weaving", category: "Beadwork", description: "Handwoven loom beadwork pieces and chokers by Ta Meu Bem." },
  { slug: "beadwork-portfolio", url: "https://tameubem.com/beadwork-portfolio", title: "My Beadwork", category: "Beadwork", description: "A curated portfolio of beadwork jewelry and embroidery." },
  { slug: "queens-lace", url: "https://tameubem.com/queens-lace", title: "Queen's Lace", category: "Beadwork", description: "Queen's Lace beadwork collection." },
  { slug: "iyanah", url: "https://tameubem.com/iyanah", title: "Iyanah", category: "Photography", description: "Iyanah — Ta Meu Bem beadwork photography." },
  { slug: "ta-meu-bem-x-april-amelia-photography", url: "https://tameubem.com/ta-meu-bem-x-april-amelia-photography", title: "Ta Meu Bem x April Amelia Photography", category: "Photography", description: "Collaboration with April Amelia Photography." },
  { slug: "beaded-veils", url: "https://tameubem.com/beaded-veils", title: "Ceremonial Beaded Veils", category: "Beadwork", description: "Ceremonial beaded veils and jewelry." },
  { slug: "visions", url: "https://tameubem.com/visions", title: "Visions", category: "Photography", description: "Visions — Ta Meu Bem jewelry photography." },
  { slug: "shurlee-sweet", url: "https://tameubem.com/shurlee-sweet", title: "Shurlee Sweet", category: "Photography", description: "Shurlee Sweet wearing Ta Meu Bem jewelry." },
  { slug: "nb-summer-2019", url: "https://tameubem.com/nb-summer-2019", title: "NB Summer 2019", category: "Photography", description: "Ta Meu Bem jewelry — Summer 2019." },
  { slug: "tiana-joshua-tree-beadwork-photoshoot", url: "https://tameubem.com/tiana-joshua-tree-beadwork-photoshoot", title: "Tiana — Joshua Tree", category: "Photography", description: "Joshua Tree beadwork photoshoot featuring Tiana." },
];

const CHROME_PATTERNS = [
  /favicon\.ico/i,
  /Ta\+Meu\+Bem\+Banner/i,
  /Arco%2BIri/i,
  /TaMeuBem\+home\+page/i,
];

function isChrome(url) {
  return CHROME_PATTERNS.some((p) => p.test(url));
}

function normalizeSquarespaceUrl(raw) {
  let url = raw.replace(/\\u002F/g, "/").replace(/\\/g, "");
  if (url.startsWith("//")) url = "https:" + url;
  // Strip format/size query params but keep path
  try {
    const u = new URL(url);
    u.search = "";
    return u.href;
  } catch {
    return url.split("?")[0];
  }
}

function extractImages(html) {
  const urls = new Set();

  // Squarespace JSON blocks often contain full asset URLs
  const jsonUrlPattern = /https:\\\/\\\/images\.squarespace-cdn\.com\\\/[^"\\]+/g;
  for (const match of html.matchAll(jsonUrlPattern)) {
    const decoded = match[0].replace(/\\\//g, "/");
    urls.add(normalizeSquarespaceUrl(decoded));
  }

  // data-image and src attributes
  const attrPatterns = [
    /data-image="([^"]+)"/g,
    /data-src="([^"]+)"/g,
    /src="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/g,
    /"assetUrl":"(https:\\\/\\\/images\.squarespace-cdn\.com[^"]+)"/g,
  ];

  for (const pattern of attrPatterns) {
    for (const match of html.matchAll(pattern)) {
      let raw = match[1];
      if (raw.includes("\\/")) raw = raw.replace(/\\\//g, "/");
      urls.add(normalizeSquarespaceUrl(raw));
    }
  }

  return [...urls].filter((u) => u.includes("squarespace-cdn.com") && !isChrome(u));
}

function toYamlString(s) {
  return `"${s.replace(/"/g, '\\"')}"`;
}

function buildMarkdown(page, images) {
  if (images.length === 0) {
    console.warn(`No images for ${page.slug}`);
    return null;
  }

  const [thumbnail, ...rest] = images;
  const alt = page.title;

  let md = `---
category: ${toYamlString(page.category)}
title: ${toYamlString(page.title)}
description: ${toYamlString(page.description)}
thumbnail:
  url: ${toYamlString(thumbnail)}
  alt: ${toYamlString(alt)}
imageGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
images:
`;

  for (const url of rest) {
    md += `  - url: ${toYamlString(url)}\n    alt: ${toYamlString(alt)}\n`;
  }

  md += `---\n`;
  return md;
}

mkdirSync(galleryDir, { recursive: true });

for (const page of pages) {
  const res = await fetch(page.url);
  const html = await res.text();
  const images = extractImages(html);
  const md = buildMarkdown(page, images);
  if (md) {
    const outPath = join(galleryDir, `${page.slug}.md`);
    writeFileSync(outPath, md, "utf8");
    console.log(`Wrote ${page.slug}.md (${images.length} images)`);
  }
}
