# cutouts

Flat colour figures that draw themselves and answer the pointer. A personal open-source library by Aftab Khan (GitHub `loadingthedev`, npm `loadingthe_dev`).

## Rules

- Use bun for everything (`bun install`, `bun test`, `bun run`, `bunx`).
- Written from scratch. No code or data from any employer. Do not read `/Users/aftab/Projects`.
- The library has no runtime dependencies. React is an optional peer, used only by the React entry.
- Every figure renders as a plain SVG string with no DOM, so it works on a server. Motion is added on top in the browser.
- Honour `prefers-reduced-motion`. Every figure has an accessible name.
- Do not invent numbers, users or testimonials in the README or the demo. Every number comes from a real run.
- Never add `Co-Authored-By` lines or "Generated with" footers to commits, PRs or any GitHub content.
- Comments only for a non-obvious "why".
- Aftab gave the go-ahead on 2026-11-15 for these steps: the public repo `loadingthedev/cutouts`, CI, GitHub Pages, the hero GIF, publishing `cutouts` 0.1.0 to npm, and the shadcn registry. Anything beyond them still waits for his word in the thread.
- Do not edit the portfolio repo from this project; its panel is done from another thread.
- The demo is served by Cloudflare Pages at https://cutouts.loadingthelife.eu.org/, redeployed from `main` on every push through Cloudflare's Git integration (build `bun install --frozen-lockfile && bun run demo`, output `demo/dist`, `BUN_VERSION=1.4.0`). No wrangler file and no GitHub Pages.
- Aftab publishes to npm himself. Do not run `npm publish`.
