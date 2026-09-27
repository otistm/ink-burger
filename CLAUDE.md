# Ink Burger: notes for Claude Code

Ink Burger is a minimal mobile card game drawn like a paper-and-ink cartoon: solitaire where the columns are half-built burgers. It's a sister game to Ink Nine (`../ink-nine`) and Ink Rally (`../ink-rally`) and shares their way of working. It's hosted on Vercel from this repo (expected at https://ink-burger.vercel.app; update the `og:` and canonical links in both HTML files if the address changes).

## Who you're working with
Otis is the designer. He doesn't read code. He judges changes by playing them on his phone.
- Explain every change in plain language: what the player will see and feel, not how the code works.
- After pushing a branch, give Otis the Vercel preview link so he can play it before it goes live.
- Keep replies short. Ask one question at a time when a design decision is his to make.

## How the project is built
- **No build step, no frameworks, no npm packages in the game.** Plain HTML, CSS and JavaScript files served as-is by Vercel. The only outside code is Supabase's client, loaded from a CDN the first time a note is sent, plus Google Fonts.
- `index.html` — the front page (a burger that keeps stacking itself, and a Play button). It borrows `play/js/data.js` and `play/js/draw.js` to draw the burger.
- `play/index.html` — the game page. It loads `styles.css` and then the scripts in `play/js/` **in the order listed there**.
- The scripts are classic scripts that share one global scope. Order matters: a file can only use things defined in files above it *while it is loading*. Calls that happen later (on tap, per frame) can use anything.
- `manifest.webmanifest`, `sw.js`, `icons/`, `og-image.png` — home-screen install and share previews. When you change files the service worker caches, bump `CACHE` in `sw.js`.
- `tools/` — not part of the game. `python tools/make-art.py` redraws the icons and `og-image.png` from the game's own burger (needs Pillow, Node, and Chrome or Edge).

| File | What's in it |
|---|---|
| config.js | `VERSION`, Supabase URL and publishable key |
| data.js | Ingredients (`ING`: name, layer height, card art height) and the five days (`DAYS`: toppings, orders, patience, rail size, story) |
| core.js | Small helpers, saved progress (`BEST`), game state `S` |
| online.js | Supabase connection, the feedback screen, quiet crash notes |
| audio.js | Procedural sound effects |
| draw.js | Ink SVG for each ingredient, burgers on tickets, customer faces, cards |
| kitchen.js | Setting up a day: orders, the deal, the pantry |
| render.js | Card sizing to the screen, the ticket rail, pantry row and columns, card motion |
| rules.js | Which cards can go where |
| actions.js | Plating, serving, walkouts, the street meter, the pantry, toasts |
| input.js | Tapping and dragging cards |
| flow.js | The shift clock: customers arriving, waiting, walking out, end of day |
| screens.js | Title, day intro, end of day, lose and pause screens |
| main.js | Main loop and startup (always last) |

## How it plays
- Ingredients are numbered 1–9 from bottom bun to top bun. A card can sit on any face-up card with a lower number, so a column can hold a half-built burger.
- Tap a card (or a run of cards) to plate it onto the order that needs it next; drag to move between columns, the two prep slots, or straight onto a ticket.
- Each order has a patience bar. Serving earns tips and 1–3 stars and pushes the street meter your way; a walkout pushes it toward Glossy's. At 0% you lose the day.
- Five days, Monday to Friday. Each adds a topping and more, bigger orders.

## Every change
1. Work on a new branch, never directly on `main`.
2. Bump `VERSION` in `play/js/config.js` (patch for fixes, minor for features) and add a line to `CHANGELOG.md` in plain language.
3. Test locally: run `python -m http.server` in the repo folder and open http://localhost:8000/play/ at a phone size (390 × 844).
4. Push the branch and share the Vercel preview link with Otis. Merge to `main` only when he's happy.

## Protect players' saved progress
Progress is kept in the browser's localStorage. An update must never wipe or break it.
- Key: `inkburger` — `day` and `tips` of the best run, `won` once the week has been won, and `muted`.
- Never rename or remove a saved field. Add new fields with defaults.

## Supabase
- It's the same Supabase project as Ink Nine, with its own table `burger_feedback` (`supabase/01-burger-feedback.sql`): tester notes with the version and a snapshot of the game (day, street meter, tickets, screen size), readable only in the Supabase dashboard.
- "Send feedback" is on the title, pause, end-of-day and lose screens. It opens over the current screen, and Back restores that screen exactly.
- Unexpected errors are sent quietly as kind "Crash" (at most three per visit, never from localhost).
- `config.js` holds only the public publishable key. **Never add a Supabase secret or service key anywhere.**
- Players are anonymous Supabase users. Row-level security lets each player insert only their own notes.
- Sending a note from local play lands in the real table. Any schema change needs a new numbered file in `supabase/` and a clear note to Otis to run it before merging.

## Look and feel (keep it consistent)
- Paper and ink only: white and black, with grey only for secondary text. Shading is hatching, dots and stripes, never color. Dark mode swaps paper and ink.
- Fonts: Bagel Fat One (display) and Bricolage Grotesque (UI). These are Ink Burger's own; Ink Nine uses Fraunces and Figtree.
- Motion follows Disney's principles: squash and stretch, anticipation, follow-through, slow in and out.
- Mobile first, portrait, one thumb. Respect safe areas and `prefers-reduced-motion`.
- Writing: sentence case, short and plain, no jargon.

## Smoke test before sharing a preview
- The front page shows the burger stacking itself and a Play button that opens the game.
- Title screen shows the version; "Open the kitchen" then "Start shift" deals the cards and the first ticket slides in.
- Tap the pantry: a card flips. Tap a bottom bun: it flies onto the ticket. Drag a card onto a higher-numbered column.
- Finish an order: "Served" stamp, tips go up, the meter moves toward Ink Burger. Let one run out: it walks to Glossy's.
- Send feedback from the pause screen: it says thank you, and Back returns to the pause screen.
- Pause, resume, and the end-of-day card; the best run is shown on the title screen after a refresh.
- No errors in the browser console.
