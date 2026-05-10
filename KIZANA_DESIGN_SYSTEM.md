# KEEPSAFE — DESIGN SYSTEM
> Reference this file every time you work on the Keepsafe UI.

---

## IDENTITY

**Product:** Keepsafe — keyless virtual safe  
**Vibe:** Industrial minimal · monochrome · futuristic · crypted  
**Reference:** drrop app — sparse, monospace everything, high contrast, zero decoration  

---

## TYPOGRAPHY

### UI Font — Geist Mono
Used for all UI text: labels, inputs, buttons, breadcrumbs, chat, status.

```ts
// app/layout.tsx
import { GeistMono } from 'geist/font/mono'
// apply GeistMono.className to <html> tag
```

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-geist-mono)', 'monospace'],
  mono: ['var(--font-geist-mono)', 'monospace'],
}
```

### Display Font — Martian Mono
Used for the KIZANA hero title and its slogan on the landing page. Nowhere else.

```ts
// app/layout.tsx
import { Martian_Mono } from 'next/font/google'
const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian-mono',
  weight: ['400', '800'],
})
// add martianMono.variable to <html> className alongside GeistMono.className
```

```ts
// tailwind.config.ts
fontFamily: {
  display: ['var(--font-martian-mono)', 'monospace'],
}
```

| Element | Font | Weight | How |
|---|---|---|---|
| KIZANA title | Martian Mono | 800 | `fontFamily: 'var(--font-martian-mono), monospace'`, `fontWeight: 800` |
| "YOUR CRYPTED SECRET" slogan | Martian Mono | 400 | `fontFamily: 'var(--font-martian-mono), monospace'`, `fontWeight: 400` |
| Everything else | Geist Mono | 300–500 | inherited from `<html>` via `GeistMono.className` |

DecryptedText spans inherit font from their parent — no font changes needed inside DecryptedText.tsx.

---

**Weights:** Geist Mono: 300 · 400 · 500 only. Never 600+. Martian Mono: 800 for title, 400 for slogan.  
**Casing:** UPPERCASE for labels, breadcrumbs, buttons, tags. Sentence case for body/input text.  
**Letter spacing:**
- Labels / breadcrumbs: `tracking-[0.12em]` to `tracking-[0.16em]`
- Body / input: `tracking-[0.04em]`
- Buttons: `tracking-[0.1em]`

**Sizes:**
- Page labels / breadcrumbs: `text-[10px]` or `text-[9px]`
- Body / input: `text-[13px]` to `text-[15px]`
- Cipher/decorative text: `text-[9px]` weight 300, opacity 20–25%

---

## COLOR PALETTE

Monochrome base. One brand signal. Nothing else.

| Token     | Hex       | Usage                                  |
|-----------|-----------|----------------------------------------|
| `brand`   | `#FF4A00` | Primary CTA, cursor, status, sent msgs |
| `ink`     | `#0a0a0a` | Text, active tab bg, dark bg           |
| `paper`   | `#f2f1ee` | Light mode background                  |
| `muted`   | `#888780` | Secondary text, placeholders           |
| `dim`     | `#3d3d3a` | Tertiary text, disabled states         |

```ts
// tailwind.config.ts
colors: {
  brand:  '#FF4A00',
  ink:    '#0a0a0a',
  paper:  '#f2f1ee',
  muted:  '#888780',
  dim:    '#3d3d3a',
}
```

**Dark mode mapping:**
- bg: `ink` (`#0a0a0a`)
- surface: `#111111`
- text: `paper` (`#f2f1ee`)
- borders: `rgba(255,255,255,0.08)`

**Light mode mapping:**
- bg: `paper` (`#f2f1ee`)
- surface: `#eae9e5`
- text: `ink` (`#0a0a0a`)
- borders: `rgba(0,0,0,0.12)`

---

## BRAND COLOR — WHERE IT LIVES

`#FF4A00` appears in exactly these places. Nowhere else.

| Use case | Detail |
|---|---|
| Logo dot | `ks.` — the period is brand color |
| Live / status indicator | Small 4–5px dot, `bg-brand` |
| Primary CTA button (filled) | `bg-brand text-white` when active |
| Primary CTA button (disabled) | `border border-brand text-brand opacity-60 bg-transparent` |
| Outgoing chat messages | `border-brand text-brand` bubble |
| Blinking cursor in key input | `text-brand` on the `_` character |
| "Encrypted" footer status label | `text-brand text-[10px]` |

**Never use `#FF4A00` on:** backgrounds, large text blocks, decorative borders, icons, headings.

---

## BUTTONS

### Primary (CTA)

```tsx
// Disabled state — no key typed
<button disabled className="
  w-full border border-brand text-brand bg-transparent
  text-[11px] tracking-[0.12em] uppercase
  opacity-60 cursor-not-allowed
  transition-all duration-200
">
  Open Safe
</button>

// Active state — key has value
<button className="
  w-full bg-brand text-white border-none
  text-[11px] tracking-[0.12em] uppercase
  cursor-pointer opacity-100
  transition-all duration-200
">
  Open Safe
</button>
```

Toggle logic:
```tsx
const [key, setKey] = useState('')
// disabled={!key}
// className conditionally switches between the two states above
```

### Ghost button
```tsx
<button className="
  border border-ink/20 dark:border-paper/20
  bg-transparent text-ink dark:text-paper
  text-[11px] tracking-[0.12em] uppercase
  opacity-45 hover:opacity-100
  transition-opacity duration-150
">
  Join Room
</button>
```

---

## TABS / SWITCHER

Two-tab switcher for Safe / Room selection on landing page.

```tsx
// Active tab
<button className="
  flex-1 bg-ink text-paper dark:bg-paper dark:text-ink
  text-[11px] tracking-[0.1em] uppercase
  py-2 border-none
">

// Inactive tab  
<button className="
  flex-1 bg-transparent text-muted
  text-[11px] tracking-[0.1em] uppercase
  py-2 border-b border-ink/10
">
```

Container: `border border-ink/10 dark:border-paper/10 flex w-full`  
No border-radius anywhere on tabs.

---

## INPUTS

```tsx
<input className="
  w-full bg-transparent border-t border-b border-ink/10 dark:border-paper/10
  font-mono text-[13px] tracking-[0.06em]
  text-ink dark:text-paper
  py-2 px-0 outline-none
  placeholder:text-muted placeholder:opacity-40
"/>
```

- No border-left, no border-right — top and bottom only
- No border-radius
- Placeholder: muted color, 40% opacity
- Blinking cursor character `_` in brand color `#FF4A00`

---

## BORDERS & RADIUS

```ts
// tailwind.config.ts
borderRadius: { DEFAULT: '2px', none: '0' }
borderWidth:  { DEFAULT: '0.5px' }
```

- **Border radius:** `2px` max. Mostly `0`. Never rounded.
- **Border weight:** `0.5px` default. `1px` only for primary button stroke.
- **Border color light:** `rgba(0,0,0,0.12)` for cards, `rgba(0,0,0,0.08)` for dividers
- **Border color dark:** `rgba(255,255,255,0.08)` for cards, `rgba(255,255,255,0.06)` for dividers

---

## LAYOUT & SPACING

- Spacing scale: `8px · 12px · 24px · 48px`
- Page padding: `24px` desktop, `16px` mobile
- Max content width: `480px` centered for landing, full-width for vault/room
- All layouts: flex column, generous vertical whitespace

---

## BREADCRUMB NAVIGATION

Appears top-left on every screen below landing.

```tsx
<div className="text-[8px] tracking-[0.1em] uppercase opacity-30 leading-loose">
  KEEPSAFE<br/>
  VAULT/<br/>
  {hash.slice(0, 6)}…
</div>
```

Pattern: `KEEPSAFE / [section] / [identifier]`  
Always muted, never interactive.

---

## CIPHER TEXT EFFECT (decorative)

Static version (pre-animation):
```tsx
<p className="
  font-mono text-[9px] tracking-[0.06em]
  opacity-20 leading-relaxed break-all
  select-none pointer-events-none
">
  a3f7c92e1d084b56f2a8e3c19d07b4e6f1a2d3c8e9
</p>
```

Animation version (add later with JS):
- Characters scramble randomly through hex chars `0-9 a-f`
- Settle into real hash value on load
- Loop on hover or on a slow interval
- Use weight 300, opacity 20–25%

---

## DARK MODE

```ts
// tailwind.config.ts
darkMode: 'class'
```

```tsx
// app/layout.tsx — wrap with next-themes
import { ThemeProvider } from 'next-themes'
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

Toggle component: a single text button, `LIGHT / DARK`, uppercase, 10px, opacity 40%, no icon.

---

## VAULT ITEMS

```tsx
<div className="flex items-start gap-2 py-2 border-b border-ink/[0.06] dark:border-paper/[0.05]">
  <span className="text-[7px] tracking-[0.1em] uppercase opacity-30 min-w-[28px] pt-0.5">
    {item.type}  {/* LINK · NOTE · CODE */}
  </span>
  <span className="text-[11px] tracking-[0.04em] opacity-75 flex-1 truncate">
    {item.value}
  </span>
  {item.isNew && (
    <div className="w-1 h-1 rounded-full bg-brand flex-shrink-0 mt-1.5" />
  )}
</div>
```

---

## CHAT MESSAGES

```tsx
// Incoming
<div className="
  border border-ink/10 dark:border-paper/8
  text-[11px] tracking-[0.04em] leading-relaxed
  px-2 py-1.5 max-w-[82%] self-start
">

// Outgoing (brand color)
<div className="
  border border-brand text-brand
  text-[11px] tracking-[0.04em] leading-relaxed
  px-2 py-1.5 max-w-[82%] self-end
">
```

Timestamp: `text-[8px] tracking-[0.08em] opacity-25 uppercase`

---

## LOGO

```tsx
<span className="text-[11px] tracking-[0.14em] uppercase font-medium">
  ks<span className="text-brand">.</span>
</span>
```

Always `ks.` — the period in `#FF4A00`, everything else in current text color.

---

## FOOTER BAR

```tsx
<footer className="
  flex items-center justify-between
  px-3 py-2
  border-t border-ink/[0.08] dark:border-paper/[0.07]
">
  <span className="text-[8px] tracking-[0.12em] uppercase opacity-25">
    {section}  {/* input · vault · room */}
  </span>
  <span className="text-[8px] tracking-[0.1em] uppercase text-brand">
    {status}   {/* encrypted · 3 inside · model: 001 */}
  </span>
</footer>
```

---

## WHAT TO NEVER DO

- No rounded corners beyond `2px`
- No shadows (box-shadow, drop-shadow)
- No gradients
- No color other than `#FF4A00` as accent — no blue, green, red for states
- No font weight above `500`
- No sans-serif fallback UI (shadcn defaults must be overridden)
- No border-radius on inputs or buttons beyond `2px`
- No `#FF4A00` used decoratively or on backgrounds
- No icons from icon libraries — use text arrows `→` and characters `_` instead
- No Title Case — uppercase or sentence case only

---

## SHADCN OVERRIDES

```css
/* globals.css */
:root {
  --primary: 18 100% 50%;           /* #FF4A00 */
  --primary-foreground: 0 0% 100%;  /* white */
  --background: 40 14% 95%;         /* #f2f1ee */
  --foreground: 0 0% 4%;            /* #0a0a0a */
  --border: 0 0% 0% / 0.12;
  --radius: 2px;
}

.dark {
  --primary: 18 100% 50%;
  --primary-foreground: 0 0% 100%;
  --background: 0 0% 4%;            /* #0a0a0a */
  --foreground: 40 14% 95%;         /* #f2f1ee */
  --border: 0 0% 100% / 0.08;
}

* {
  font-family: var(--font-geist-mono), monospace;
}
```

---

*Last updated: project kickoff*  
*Stack: Next.js 14 · Tailwind CSS · shadcn/ui · Geist Mono · next-themes*
