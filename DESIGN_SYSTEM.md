# Kizana Design System

## Typography
- Geist Mono only — no other fonts
- Weights 300 / 400 / 500 only — never bold or 600+
- Labels/buttons: UPPERCASE. Body/inputs: sentence case
- Letter spacing — labels: `tracking-[0.12em]`–`tracking-[0.16em]`, buttons: `tracking-[0.1em]`, body: `tracking-[0.04em]`
- Sizes — labels: `text-[10px]`/`text-[9px]`, body: `text-[13px]`–`text-[15px]`

## Colors
- `brand #FF4A00` — CTA button, cursor, status dot, outgoing messages ONLY. Never on backgrounds, headings, decorative borders
- `ink #0a0a0a` — text, active tab bg
- `paper #f2f1ee` — light mode bg
- `muted #888780` — secondary text, placeholders
- `dim #3d3d3a` — tertiary/disabled

## Buttons
- Primary disabled: `border border-brand text-brand bg-transparent opacity-60 cursor-not-allowed`
- Primary active: `bg-brand text-white border-none opacity-100`
- Text: `text-[11px] tracking-[0.12em] uppercase`

## Tabs
- Container: `border border-ink/10 dark:border-paper/10 flex w-full`
- Active: `bg-ink text-paper dark:bg-paper dark:text-ink`
- Inactive: `bg-transparent text-muted border-b border-ink/10`
- No border-radius

## Inputs
- `border-t border-b` only — NO left/right borders
- `px-0`, no border-radius, `text-[13px] tracking-[0.06em]`
- Placeholder: `text-muted opacity-40`

## Sensitive Inputs (key, PIN)
All sensitive inputs are `type="password"` by default with a SHOW/HIDE text toggle:
- Wrapper: `position: relative`, `width: 100%`
- Input: `type={show ? 'text' : 'password'}`, `paddingRight: '52px'`, uses `inputClass`
- Toggle button: `position: absolute`, `right: 8px`, `top: 50%`, `translateY(-50%)`
- Button style: `color: #888780`, `fontSize: 11px`, `letterSpacing: 0.08em`, `textTransform: uppercase`, no border/background
- Label text: `SHOW` / `HIDE`
- Default state: hidden (`false`)
- Reset to hidden on every state transition (in `fade()`)

## Never
- No rounded corners beyond `2px`
- No shadows, no gradients
- No color other than `#FF4A00` as accent
- No font weight above 500
- No icons from libraries — use `→` and `_`
- No Title Case
