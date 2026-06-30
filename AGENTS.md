# AGENTS.md — Semplice (`@lexington/semplice`)

**Semplice** is a Lexington Themes Astro template aimed at **photography, gallery, and creative visuals**: a curated homepage gallery, team (photographers), **blog** posts (composition, visual storytelling), a **digital print store**, legal pages, and a **studio** services page. Primary use case is a **portfolio / exhibition / marketing site** for image-forward brands rather than a SaaS product shell.

## Tech stack (this repo)

| Area | Details |
|------|---------|
| **Framework** | Astro `^6.0.0` (`astro`) |
| **Styling** | Tailwind CSS `^4.1.18` via `@tailwindcss/vite`; plugins `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwind-scrollbar-hide` |
| **Content** | `astro:content` with `defineCollection`, `glob` loaders, Zod (`astro/zod`); Markdown in `.md` files. **MDX is not a dependency** — do not assume `@astrojs/mdx`. |
| **Markdown** | `astro.config.mjs`: drafts + Shiki `css-variables`, `wrap: true` |
| **SEO** | `@lexingtonthemes/seo` (`AstroSeo` in `src/components/fundations/head/Seo.astro`) |
| **Integrations** | `@astrojs/sitemap` (in `astro.config.mjs`) |
| **RSS** | `@astrojs/rss` — `src/pages/rss.xml.js` (not registered as an integration; used by the route file) |
| **Aliases** | `@/*` → `src/*` (`tsconfig.json`) |

## Folder map

| Path | Role |
|------|------|
| `src/pages/` | File-based routes (blog, team, store, gallery, legal, system, alternates `index-two.astro` / `index-three.astro`, `404.astro`, `rss.xml.js`) |
| `src/layouts/` | `BaseLayout.astro`, `BlogLayout.astro`, `GalleryLayout.astro`, `LegalLayout.astro`, `StoreLayout.astro`, `TeamLayout.astro` |
| `src/components/` | `global/` (Navigation, Footer), `blog/`, `gallery/`, `store/`, `team/`, `assets/`, **`fundations/`** (head, elements, containers, scripts — keep this spelling) |
| `src/content/` | Markdown per collection: `team/`, `store/`, `gallery/`, `posts/`, `legal/` |
| `src/styles/` | `global.css` — Tailwind `@theme` tokens (fonts, gallery accents, accent/base palettes) |
| `src/images/` | Images imported via content `image()` or direct imports (e.g. `src/pages/studio.astro`) |
| `public/` | **Not present in this repository.** `Favicons.astro` still links to root paths like `/favicon.ico`; add a `public/` folder and assets if you need them served verbatim at `/`. |

## Content collections (`src/content.config.ts`)

All collections use `glob({ pattern: "**/*.md", base: "./src/content/<name>" })`. Image fields use the Astro content helper **`image()`**; in Markdown, `url` values are typically under `/src/images/...` (see existing entries).

### `team` → `src/content/team/`

- **Required:** `name` (string), `image: { url: image(), alt: string }`
- **Optional:** `role`, `bio`, `socials: { twitter?, website?, linkedin?, email? }`
- **Template:** copy structure from `src/content/team/samuel-ortiz.md`
- **URLs:** `/team/{entry.id}` (filename stem)

### `store` → `src/content/store/`

- **Required:** `price`, `title`, `checkout`, `license`, `highlights` (string[]), `description`, `image: { url, alt }`, `images: [{ url, alt }, ...]`
- **Optional:** `specifications: [{ name, value }]`, `faq: [{ question, answer }]`
- **Template:** `src/content/store/1.md`
- **URLs:** `/store/{entry.id}`

### `gallery` → `src/content/gallery/`

- **Required:** `category`, `title`, `description`, `thumbnail: { url, alt }`
- **Optional:** `bgColor`, `textColor`, `thumbnailClass`, `imageGrid` (Tailwind class string for grid wrapper), `images: [{ url, alt, class? }]`
- **Template:** `src/content/gallery/1.md` (comments in file explain grid / thumbnail classes)
- **URLs:** `/gallery/posts/{entry.id}`. Homepage variants use `GalleryCard1/2/3` linking here.

### `posts` (blog) → `src/content/posts/`

- **Required:** `title`, `pubDate` (date), `description`, `team` (string — must match a **`team` entry `id`**, e.g. `david-lee`), `image: { url, alt }`, `tags` (string[])
- **Template:** `src/content/posts/1.md`
- **Note:** `BlogLayout.astro` renders `frontmatter.category`, but **`category` is not in the Zod schema**. Adding it requires updating `src/content.config.ts` and existing posts (or removing that markup from the layout).

### `legal` → `src/content/legal/`

- **Required:** `page` (string), `pubDate` (date)
- **Template:** `src/content/legal/privacy.md`
- **URLs:** `/legal/{entry.id}`

## Routing (content → URL)

| Content | List / hub | Detail route |
|---------|------------|--------------|
| `posts` | `/blog` (`src/pages/blog/index.astro`) | `/blog/posts/[...slug].astro` → `/blog/posts/{id}` |
| Tags | `/blog/tags` (`blog/tags/index.astro`), cards link to `/blog/tags/{tag}` | `blog/tags/[tag].astro` |
| `team` | `/team` | `/team/[...slug].astro` → `/team/{id}` |
| `store` | `/store` | `/store/[...slug].astro` → `/store/{id}` |
| `gallery` | No dedicated index page; home uses `index.astro` / alternates | `/gallery/posts/[...slug].astro` → `/gallery/posts/{id}` |
| `legal` | No index | `/legal/[...slug].astro` → `/legal/{id}` |
| RSS | — | `/rss.xml` (`rss.xml.js`) |

**Dynamic segments:** `[...slug].astro` is used for team, store, gallery posts, legal, and blog posts; blog tags use `[tag].astro`. Static extras include `/studio`, `/system/*` (overview, colors, typography, buttons, link), `index-two.astro`, `index-three.astro`, `404.astro`.

**Changelog:** no on-site changelog collection or route in this repo; Lexington’s template changelog is linked from the README (external).

## Customization guide

- **Site URL / sitemap / RSS:** set `site` in `astro.config.mjs` (currently `https://yourdomain.com`). RSS uses `context.site` in `src/pages/rss.xml.js`.
- **Brand colors & typography:** `src/styles/global.css` — `@theme` blocks (`--font-serif`, `--font-sans`, `--color-gallery-*`, `--color-accent-*`, `--color-base-*`).
- **Navigation / footer:** `src/components/global/Navigation.astro`, `Footer.astro`.
- **Global chrome:** `src/layouts/BaseLayout.astro` imports `global.css`, `BaseHead`, `Navigation`, `Footer`, optional `BigLogo`. Props: `hideBigLogo`, `hideNavigation`, `hideFooter` (see layout comments).
- **Head / SEO:** `src/components/fundations/head/BaseHead.astro` pulls in `Seo`, `Meta`, `Fonts`, `Favicons`, `FuseJS`, `KeenSlider`. **`Seo.astro` is still placeholder copy** — wire real `title` / `canonical` / Open Graph per page or lift props from layouts.

## Commands

From README (root of project):

| Command | Action |
|--------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server |
| `npm run build` | Production build → `./dist/` |
| `npm run preview` | Preview production build |
| `npm run astro ...` | Astro CLI |

## Guardrails for contributors / agents

1. **Do not rename `fundations`** — that folder name is intentional and referenced throughout imports.
2. **Do not widen Zod content schemas** without updating every layout and page that reads `entry.data` (and sample Markdown). Prefer additive optional fields only when consumers handle them.
3. **Keep `image()` fields valid** — broken image paths break `astro:assets` usage in layouts/cards.
4. **Minimal diffs** — match existing import style (`@/…` preferred; note `store/[...slug].astro` uses a relative layout import).
5. **Do not claim dependencies** that are not in `package.json`.

## Lexington links (from README)

- Theme: [https://lexingtonthemes.com/templates/semplice](https://lexingtonthemes.com/templates/semplice)  
- Docs: [https://lexingtonthemes.com/documentation/getting-started](https://lexingtonthemes.com/documentation/getting-started)  
- Changelog (template): [https://lexingtonthemes.com/changelog/semplice](https://lexingtonthemes.com/changelog/semplice)  
- Support: [https://lexingtonthemes.com/legal/support/](https://lexingtonthemes.com/legal/support/)  
- Bundle: [https://lexingtonthemes.com](https://lexingtonthemes.com)

Publisher: **[Lexington Themes](https://lexingtonthemes.com/)**
