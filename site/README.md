# Ledpay landing page

Static marketing page for Ledpay. A section-by-section port of Mayor's Framer site (https://gleaming-basis-969677.framer.app/): cream hero with the orange funnel grid, dark middle with bento, accordion, plugin, tools, limits, status and FAQ sections, and a cream CTA and footer. Switzer (Fontshare, ITF Free Font License) is self-hosted in `public/fonts`; Geist Mono for addresses. All imagery is CSS/SVG, with no template images. Copy comes only from the repo README and `docs/` (threat model, P0 status). Vite + React + TypeScript + Tailwind CSS v4.

```bash
cd site
npm install
npm run lint
npm run build     # tsc -b && vite build -> site/dist
npm run preview
```

Deploy: any static host. On Vercel, set the project root directory to `site` (framework preset: Vite, output `dist`).
