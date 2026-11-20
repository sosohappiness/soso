# 소소 (Soso)

A tiny painted world: give a tired little animal one thing you love each day, write three
things you're grateful for, and watch the tree grow.

Plan and decisions: `plan.html` (also published as a private Claude artifact).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/ (installable PWA)
```

### Email sign-up (Supabase)

First launch asks for an email and a 6-digit code, then a friend to live with.

1. Create a Supabase project, then copy `.env.example` to `.env.local` and fill in the URL and anon key.
2. In Supabase → Authentication → Providers, keep **Email** on.
3. In Authentication → Email Templates → **Magic Link**, put the code in the mail so people can type it:
   `소소 인증 코드: {{ .Token }}` (a code works inside the home-screen app; a link would open Safari).
4. For real use, set up custom SMTP (Authentication → SMTP); Supabase's built-in mailer only sends a few mails per hour.

Without `.env.local` the app runs in **test mode**: no email is sent and any 6 digits are accepted.

### Test switches (URL parameters)

| Parameter | Example | Effect |
|---|---|---|
| `time` | `?time=19:42` | Freeze the clock (picks the time-of-day mood) |
| `phase` | `?phase=night` | Force `morning`, `day`, `evening` or `night` |
| `animal` | `?animal=redpanda` | `polar`, `redpanda` or `dog` |
| `days` | `?days=40` | Pretend N days of gratitude were logged (tree growth) |
| `dev` | `?dev` | Show a small bar to flip time of day and animal |

## How the look works (paper diorama)

Nothing is a 3D model. Every element (sky, moon, hill, tree, each part of Minimi) is a flat
cutout on its own depth layer. The shapes are painted at startup onto canvas textures by
`src/paint/painter.ts`: wobbly edges, a fuzzy rim and paper grain, with no outlines. The
camera can turn about ±30° (the rotate button or dragging) so the layers show their depth.

```
src/
  paint/painter.ts     gouache painter → canvas textures
  scene/Scene.tsx      canvas, camera rig, bubble tracking
  scene/Backdrop.tsx   sky, sun/moon, clouds, stars, ground flats
  scene/Tree.tsx       trunk, canopy, blossoms (grow with gratitude)
  scene/Minimi.tsx     shared body + poses for each time of day
  scene/animals.ts     polar bear, red panda, dog (head/ears/tail/colours)
  lib/                 time of day, lines, local storage
  ui/                  HUD, gift bar, tabs, sheets
```

## Status

- [x] Week 1: scene, Minimi's 4 time-of-day moods, 3 animals, Home UI, rotate view, PWA
- [ ] Week 2: gift reader (free keyword matcher) + matcha latte animation + gift-box fallback
- [ ] Week 3: email sign-up, Supabase tables, gratitude journal, real tree growth
- [ ] Week 4: choose-your-animal screen, notifications, share link, friends test
