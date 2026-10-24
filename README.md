# Rajpal Nishad — Portfolio

A black, crimson, and neon-green poster-style portfolio for **Rajpal Nishad**, Full Stack Developer · AI & LLM.
Built with plain HTML, CSS, and JavaScript, with an optional Node.js/Express server for local
development and a working contact endpoint.

**Live:** <https://foxdev-404.github.io>

![Theme: light + dark](https://img.shields.io/badge/theme-light%20%2B%20dark-c8ff3d)

## Highlights

- **Poster-inspired design** — near-black surfaces, crimson bands, neon-green highlights, condensed display type
- **Light & dark mode** — toggle in the navbar, saved in `localStorage`, defaults to dark
- **Fully responsive** — mobile menu, stacked layouts, reduced motion support
- **Featured projects** — BGMI Cup, AI MockPrep, LLM Engineering, with live links
- **Animated details** — scroll reveals, counters, skill meters, subtle card tilt
- **Working contact form** — posts to a Node endpoint (saved locally) or falls back to `mailto:`
- **No build step** — open `index.html`, or run the Express server

## Tech stack

| Layer | Tech |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Behaviour | Vanilla JavaScript (IntersectionObserver, fetch) |
| Server | Node.js + Express 5 |
| Fonts | Anton, Inter, JetBrains Mono (Google Fonts) |

## Project structure

```
portfolio/
├── index.html                  # All page content and sections
├── css/
│   └── style.css               # Theme tokens, layouts, components, responsive rules
├── js/
│   └── main.js                 # Theme toggle, nav, reveals, counters, contact form
├── assets/
│   ├── avatar.jpg              # GitHub profile photo
│   └── favicon.svg             # RN monogram
├── data/
│   └── messages.json           # Created by the server when someone submits the form
├── server.js                   # Express static server + /api/contact
├── package.json
└── Rajpal_Nishad_Resume.pdf    # Downloadable CV (served as-is)
```

> `data/messages.json` is created automatically on the first submission and is blocked from
> static access by the server.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm start
```

Open <http://localhost:3000>.

For auto-restart while editing:

```bash
npm run dev
```

You can also just open `index.html` in a browser. In that case the contact form opens the
visitor's email app instead of posting to the server.

## Contact form behaviour

- **With the Node server** → `POST /api/contact` validates the fields and appends the message to
  `data/messages.json`.
- **On a static host** (or `file://`) → the form builds a `mailto:` link with the message
  pre-filled and opens the visitor's mail client.
- A hidden honeypot field filters basic spam bots.
- Messages are capped at the latest 500 entries to keep the JSON file small.

## Customising

| What | Where |
| --- | --- |
| Name, bio, social links | `index.html` |
| Colours, spacing, fonts | CSS variables at the top of `css/style.css` |
| Featured / mini projects | `<section id="projects">` in `index.html` |
| Resume download | Replace `Rajpal_Nishad_Resume.pdf` (keep the filename, or update both links) |
| Avatar | Replace `assets/avatar.jpg` |
| Theme default | Inline script in `<head>` of `index.html` |

CSS theme tokens live under `:root, [data-theme="dark"]` and `[data-theme="light"]`. The main
accents are `--accent` (neon green), `--accent-2` (crimson), and `--lime` (solid button fill).

## Deploying

The site is static-first, so any static host works:

- **GitHub Pages / Netlify / Cloudflare Pages** — publish the project root.
- **Vercel** — static deploy; contact form falls back to `mailto:`.
- **Railway / Render / Fly.io** — deploy with `npm install && npm start` to keep the contact
  endpoint. Set `PORT` if the platform requires it (the server already reads `process.env.PORT`).

## Notes

- Resume PDF and details sourced from Rajpal's resume; project links and avatar sourced from
  GitHub ([@FoXDev-404](https://github.com/FoXDev-404)).
- Fonts load from Google Fonts; the design falls back to system fonts if they are unavailable.
- Built with accessibility in mind: semantic landmarks, visible focus states, ARIA labels on
  icon buttons, and `prefers-reduced-motion` support.

---

© 2026 Rajpal Nishad · MIT License
