# Ink Burger: notes for Claude Code

Ink Burger is a minimal mobile burger game drawn like a paper-and-ink cartoon. The start screen offers two ways to play the burger week: **Drop and stack** (time each drop onto a swinging stack) and **Trace** (swipe the recipe through a grid of ingredient tiles). It's a sister game to Ink Nine (`../ink-nine`) and Ink Rally (`../ink-rally`) and shares their way of working. It's hosted on Vercel from this repo (expected at https://ink-burger.vercel.app; update the `og:` and canonical links in both HTML files if the address changes).

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
| data.js | Dishes and their ingredients (`DISHES`, flattened into `ING`), the weeks (`WEEKS`: dish, rival, stories), how each weekday plays (`DAYTPL`), and `dayDef`. Both modes use week 1 (burgers) only for now |
| core.js | Small helpers, the old solitaire save (`BEST`), game state `S` |
| online.js | Supabase connection, the feedback screen, quiet crash notes |
| audio.js | Procedural sound effects |
| draw.js | Ink SVG for each ingredient (`shape`, by its `k`), dishes on tickets (`burgerSVG`), dish icons, customer faces, cards |
| kitchen.js | `makeOrder`: picking a dish and toppings and naming the order (its solitaire deal, `startDay`, is unused) |
| render.js | `ticketHTML`, `renderRail` and `mood` for the ticket rail (the rest is solitaire, unused) |
| kit.js | The shell both modes share: `MODES`, `GAME` (the mode being played), start screen with the two mode buttons, day intro with that mode's how-to, end of day, lose, pause, the ticket rail, `serveTicket`, `walkTicket`, the street meter, tips, the main loop, `kitStart()` |
| stack.js | Drop and stack mode (`MODES.stack`) |
| trace.js | Trace mode (`MODES.trace`) |

- Each mode is wrapped in its own `(()=>{ ... })()` and returns `{id, name, blurb, how, start(D), tick(dt), stop()}` plus optional `resize`, `afterRail` (mark tickets after the rail redraws) and `stats` (extra lines on the end-of-day card). Its input handlers must check `GAME===ME` so the other mode's taps are ignored.
- `play/index.html` loads the shell, both modes, then calls `kitStart()`.
- The solitaire game (`screens.js`, `rules.js`, `actions.js`, `input.js`, `flow.js`, `main.js`, and the card parts of `render.js`, `kitchen.js`, `styles.css`) is kept in the repo but not loaded. The seven-weeks, dishes-as-suits version (0.3.0) is in git history.
- A third idea, a turn-based kitchen deck-builder, lives on the branch `proto/deck`, not in main.

## How it plays
- Both modes: the burger week, Monday to Friday. Tickets arrive on the rail with a patience bar. Serving earns tips and 1–3 stars and pushes the street meter your way; a walkout pushes it toward Glossy's. At 0% you lose the day and can retry it. Win Friday and the week is won.
- **Drop and stack**: the next ingredient the front order needs swings on a hook above the plate; tap anywhere to drop it. The hook rides a fixed height (`GAP`) above the stack. Off the layer below by more than 70% of half a width: it slides off and costs 2 s of patience. Stack's top more than 85% of half a width from the plate's centre: it topples and the order restarts. Within ~8 px: Perfect (snaps straight, +$2 each). Swing speed rises with the day and the stack's height.
- **Trace**: a 5×6 grid of tiles. Drag through touching tiles (8 directions) in recipe order; the ticket previews as you trace. Release on a finished order to serve it, or after 2+ tiles to plate part of it (the order keeps its progress in `base`). Traces of 3+ tip `(length−2)×2`. New tiles lean toward what the rail needs (`pickIngredient`). "Shake the pantry" redraws every tile and costs everyone 3 s.

## Every change
1. Work on a new branch, never directly on `main`.
2. Bump `VERSION` in `play/js/config.js` (patch for fixes, minor for features) and add a line to `CHANGELOG.md` in plain language.
3. Test locally: run `python -m http.server` in the repo folder and open http://localhost:8000/play/ at a phone size (390 × 844).
4. Push the branch and share the Vercel preview link with Otis. Merge to `main` only when he's happy.

## Protect players' saved progress
Progress is kept in the browser's localStorage. An update must never wipe or break it.
- `inkburger-stack` and `inkburger-trace` — each mode's best run: `day`, `tips`, `won`.
- `inkburger` — the solitaire save (`best`, `run`, `muted`, and older `day`/`tips`/`won`). Not used by the two modes, but kept untouched so it works if solitaire comes back.
- Never rename or remove a saved field. Add new fields with defaults. Never reorder `DISHES` or a dish's ingredients. Add new dishes at the end.

## Supabase
- It's the same Supabase project as Ink Nine, with its own table `burger_feedback` (`supabase/01-burger-feedback.sql`): tester notes with the version and a snapshot of the game (day, street meter, tickets, screen size), readable only in the Supabase dashboard.
- "Send feedback" is on the start, pause, end-of-day and lose screens. Notes say which mode (`game`) was being played. It opens over the current screen, and Back restores that screen exactly.
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
- The start screen shows two buttons, Drop and stack and Trace, each with its best run, plus the version and "Send feedback".
- Drop and stack: the Monday intro shows its how-to; Start shift brings a ticket and a swinging bottom bun. Tap to drop; layers stack; a finished burger is served and slides off. Drop far off-centre: it slides off. Lean the stack: it topples.
- Trace: the grid fills; drag bottom bun, patty, cheese, top bun through touching tiles; the ticket fills as you trace and serves on release. Used tiles pop and new ones fall.
- Quit to the menu from one mode and start the other: taps only affect the mode you're in.
- Let a customer run out: "Went to Glossy's". Send feedback from the pause screen: it says thank you, and Back returns to the pause screen.
- The end-of-day card, and each mode's best run on the start screen after a refresh.
- No errors in the browser console.
