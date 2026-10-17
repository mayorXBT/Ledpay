# Ledpay landing page

Static marketing page for Ledpay, styled after the Framer template Accretion (white ground, signal red, Instrument Sans, changelog-style entries). Vite + React + TypeScript + Tailwind CSS v4. Copy is taken from the repo README and `docs/` (threat model, P0 status).

```bash
cd site
npm install
npm run lint
npm run build     # tsc -b && vite build -> site/dist
npm run preview
```

Deploy: any static host. On Vercel, set the project root directory to `site` (framework preset: Vite, output `dist`).
