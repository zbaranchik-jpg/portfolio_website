# Zhenya Baranchik — Portfolio Website

Personal design portfolio. Five-page static site — no framework, no build step. Deploy directly from this repo.

**Live site:** deployed on Vercel from `main` branch.

---

## Pages

| File | URL path | What it is |
|---|---|---|
| `index.html` | `/` | Homepage — split hero, work card grid, contact footer |
| `case-nowyouknow.html` | `/case-nowyouknow.html` | NowYouKnow case study |
| `case-automation.html` | `/case-automation.html` | Automation Revamp case study (Workiz) |
| `case-equipment.html` | `/case-equipment.html` | Equipment Tracking case study (Workiz) |
| `case-phone-plans.html` | `/case-phone-plans.html` | Phone Plans page revamp case study (Workiz) |

---

## Case studies

**NowYouKnow** — Consumer mobile app, 2026  
Redesign of a learning app from V2 to V3. Covers product strategy, visual identity from scratch, full design system in Figma, V3 launch (journeys, Now tab, guided practice, achievements), dev handoff in Hungary, post-launch iteration with Amplitude, and the Play hub (trivia, match, swipe games). Sole designer; co-led strategy with founder.

**Automation Revamp** — B2B SaaS, Workiz  
Redesign of Workiz's automation engine. Trigger → action + condition rule builder, new component library, UI overhaul. Covers goals, research, process, components, and results.

**Equipment Tracking** — B2B SaaS, Workiz  
New feature that lets field-service businesses track installed equipment per client — serial numbers, warranties, service history, install locations. Desktop and mobile. Covers user research, personas, competitor analysis, flow design, and results.

**Phone Plans page revamp** — B2B SaaS, Workiz
A static billing tab turned into a page people actually use. One page with three entry points depending on whether the account has a phone plan and whether on-demand billing is on. Covers the readable usage graph, the on-demand spend cap, and the post-subscription upgrade moment (9% of new SaaS subscribers took a phone plan within two weeks).

---

## Design system

- **Fonts:** Sora (headings, display, labels) · DM Sans (body text) — both loaded from Google Fonts
- **Colors:**
  - `#FF41AC` — pink, expression (accent words, numbers, cursor)
  - `#1F50E6` — blue, action (CTAs, links, nav underlines, arrows)
  - `#FFC01F` — yellow, highlight (marker behind key words)
  - `#FFFFFF` — white canvas background
  - `#1B242C` — dark footer
- **Motion:** scroll reveals, clip-wipe on media, custom cursor (label / arrow / waving-hand variants), WebGL mesh warp on the hero portrait, scroll-linked portrait zoom, page-transition veil, reading-progress bar, count-up metrics, magnetic email link

---

## File structure

```
/
├── index.html               # Homepage
├── case-nowyouknow.html     # Case study 1
├── case-automation.html     # Case study 2
├── case-equipment.html      # Case study 3
├── case-phone-plans.html    # Case study 4
├── site.css                 # Shared styles (all pages)
├── site.js                  # Shared interactions (all pages)
├── image-slot.js            # <image-slot> custom element
├── portrait-warp.js         # WebGL mesh warp on the hero portrait (homepage)
├── tweaks.js                # Live theme panel (accent / density)
├── assets/
│   ├── portrait.jpeg        # Legacy hero spotlight photo
│   └── nyk-hero-new.webp    # NowYouKnow hero
└── images/
    ├── portrait-halftone.webp  # Hero portrait (homepage)
    ├── cursor-hand.png         # Waving-hand cursor glyph (CSS mask)
    ├── nyk-*.webp              # NowYouKnow case study images
    ├── auto-*.webp             # Automation Revamp images
    ├── equip-*.webp            # Equipment Tracking images
    └── pp-*.webp               # Phone Plans images
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

This repo includes Vercel configuration for static deployment.

1. Import this repo in Vercel
2. **Framework preset:** Other
3. **Build command:** *(leave empty)*
4. **Output directory:** `.`
5. Deploy — every push to `main` auto-deploys

### GitHub Actions deploy

A GitHub Actions workflow is included to deploy to Vercel on every push to `main`.

To enable it, add these repository secrets in GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Once secrets are configured, pushes to `main` will trigger the Vercel deploy workflow.

---

## Updating content

All content is in the HTML files — no CMS, no templating. Each page is self-contained except for the shared files (`site.css`, `site.js`, `image-slot.js`, `tweaks.js`).

To swap an image, replace the corresponding file in `images/` keeping the same filename, then push.

---

## Origin

Designed in [Claude Design](https://claude.ai/design), implemented and deployed via Claude Code.
