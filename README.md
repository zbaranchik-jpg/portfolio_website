# Zhenya Baranchik — Portfolio Website

Personal design portfolio. Four-page static site — no framework, no build step. Deploy directly from this repo.

**Live site:** deployed on Vercel from `main` branch.

---

## Pages

| File | URL path | What it is |
|---|---|---|
| `index.html` | `/` | Homepage — hero, work index, contact footer |
| `case-nowyouknow.html` | `/case-nowyouknow.html` | NowYouKnow case study |
| `case-automation.html` | `/case-automation.html` | Automation Revamp case study (Workiz) |
| `case-equipment.html` | `/case-equipment.html` | Equipment Tracking case study (Workiz) |

---

## Case studies

**NowYouKnow** — Consumer mobile app, 2026  
Redesign of a learning app from V2 to V3. Covers product strategy, visual identity from scratch, full design system in Figma, V3 launch (journeys, Now tab, guided practice, achievements), dev handoff in Hungary, post-launch iteration with Amplitude, and the Play hub (trivia, match, swipe games). Sole designer; co-led strategy with founder.

**Automation Revamp** — B2B SaaS, Workiz  
Redesign of Workiz's automation engine. Trigger → action + condition rule builder, new component library, UI overhaul. Covers goals, research, process, components, and results.

**Equipment Tracking** — B2B SaaS, Workiz  
New feature that lets field-service businesses track installed equipment per client — serial numbers, warranties, service history, install locations. Desktop and mobile. Covers user research, personas, competitor analysis, flow design, and results.

---

## Design system

- **Fonts:** Space Grotesk (headings, display, labels) · DM Sans (body text) — both loaded from Google Fonts
- **Colors:**
  - `#EA3A12` — red-orange, expression (accent words, numbers, brand dot, cursor)
  - `#1F50E6` — blue, action (CTAs, links, nav underlines, arrows)
  - `#FFC01F` — yellow, highlight (marker behind key words)
  - `#FFFFFF` — white canvas background
  - `#1B242C` — dark footer
- **Motion:** scroll reveals, clip-wipe on media, custom coral cursor, page-transition veil, reading-progress bar, count-up metrics, magnetic email link

---

## File structure

```
/
├── index.html               # Homepage
├── case-nowyouknow.html     # Case study 1
├── case-automation.html     # Case study 2
├── case-equipment.html      # Case study 3
├── site.css                 # Shared styles (all pages)
├── site.js                  # Shared interactions (all pages)
├── image-slot.js            # <image-slot> custom element
├── assets/
│   └── portrait.jpeg        # Hero spotlight photo (homepage)
└── images/
    ├── nyk-*.webp           # NowYouKnow case study images
    ├── auto-*.webp          # Automation Revamp images
    └── equip-*.webp         # Equipment Tracking images
```

---

## How to run locally

No install needed. Just serve the root folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or use the VS Code Live Server extension.

> Opening via `file://` directly works for viewing but disables the image-slot persistence feature (drag-and-drop image saving). Use a local server if you need that.

---

## Deploying on Vercel

1. Import this repo in Vercel
2. **Framework preset:** Other
3. **Build command:** *(leave empty)*
4. **Output directory:** `.`
5. Deploy — every push to `main` auto-deploys

---

## Updating content

All content is in the HTML files — no CMS, no templating. Each page is self-contained except for the three shared files (`site.css`, `site.js`, `image-slot.js`).

To swap an image, replace the corresponding file in `images/` keeping the same filename, then push.

---

## Origin

Designed in [Claude Design](https://claude.ai/design), implemented and deployed via Claude Code.
