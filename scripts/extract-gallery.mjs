/**
 * One-time helper: fetch tameubem.com gallery pages and extract Squarespace image URLs.
 */
const pages = [
  { slug: "loom-weaving", url: "https://tameubem.com/loom-weaving" },
  { slug: "beadwork-portfolio", url: "https://tameubem.com/beadwork-portfolio" },
  { slug: "queens-lace", url: "https://tameubem.com/queens-lace" },
  { slug: "iyanah", url: "https://tameubem.com/iyanah" },
  { slug: "ta-meu-bem-x-april-amelia-photography", url: "https://tameubem.com/ta-meu-bem-x-april-amelia-photography" },
  { slug: "beaded-veils", url: "https://tameubem.com/beaded-veils" },
  { slug: "visions", url: "https://tameubem.com/visions" },
  { slug: "shurlee-sweet", url: "https://tameubem.com/shurlee-sweet" },
  { slug: "nb-summer-2019", url: "https://tameubem.com/nb-summer-2019" },
  { slug: "tiana-joshua-tree-beadwork-photoshoot", url: "https://tameubem.com/tiana-joshua-tree-beadwork-photoshoot" },
];

function extractImages(html) {
  const urls = new Set();
  const patterns = [
    /https:\/\/images\.squarespace-cdn\.com[^"'\\<>\\s)]+/g,
    /\/\/images\.squarespace-cdn\.com[^"'\\<>\\s)]+/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      let url = match[0].replace(/\\+$/, "");
      if (url.startsWith("//")) url = "https:" + url;
      // Prefer full-size: strip format params for uniqueness, keep base path
      url = url.split("?")[0];
      if (url.includes("squarespace-cdn.com")) urls.add(url);
    }
  }
  return [...urls];
}

function extractTitle(html) {
  const og = html.match(/<meta property="og:title" content="([^"]+)"/);
  if (og) return og[1].replace(/\s*—\s*Ta Meu Bem\s*$/, "").trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)</);
  if (h1) return h1[1].trim();
  const title = html.match(/<title>([^<]+)<\/title>/);
  if (title) return title[1].replace(/\s*—\s*Ta Meu Bem\s*$/, "").trim();
  return "Untitled";
}

for (const page of pages) {
  try {
    const res = await fetch(page.url);
    const html = await res.text();
    const title = extractTitle(html);
    const images = extractImages(html);
    console.log(JSON.stringify({ slug: page.slug, title, imageCount: images.length, images }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ slug: page.slug, error: String(err) }));
  }
}
