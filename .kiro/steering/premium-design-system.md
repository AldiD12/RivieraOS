---
inclusion: always
---

# Premium Design System - Riviera ($20K+ Quality)

## Two-Track Design Philosophy

### Customer-Facing Pages (Ultra-Luxury)
**Pages:** MenuPage, ReviewPage, DiscoveryPage

**Benchmark:** Aman Resorts, Six Senses, Soho House, Park Hyatt
**Standard:** Would a design agency charge $20,000+ for this?

---

## Visual Philosophy: Quiet Luxury

- Understated elegance over flashy elements
- Every pixel intentional and curated
- Inspiration: amanresorts.com, soneva.com, sohohouse.com, parkhyatt.com
- Prioritize whitespace and breathing room - luxury never feels cramped
- Sophisticated neutrals over bright colors

---

## Color Palette (Sophisticated Neutrals)

**Primary Background:**
```
#FAFAF9 (warm off-white)
```

**Card Backgrounds:**
```
bg-gradient-to-br from-white to-stone-50/50
backdrop-blur-2xl
```

**Accent Colors (Use Sparingly):**
- Primary: `#92400E` (deep burnt amber)
- Hover: `#78350F` (darker amber)
- DO NOT USE: Bright orange (#F97316), bright teal, bright colors

**Text:**
- Primary: `#1C1917` (near black)
- Secondary: `#57534E` (warm gray)
- Muted: `#78716C`

**Borders:**
```
border border-stone-200/40
```
(0.5px thickness - barely visible)

---

## Typography (Luxury Standard)

**Premium Fonts:**
```
Headings: 'Cormorant Garamond', serif
Body: 'Inter', sans-serif
```

**Main Titles (Hotel Names, Page Headers):**
```css
font-family: 'Cormorant Garamond', serif
font-size: 4rem to 7rem (text-6xl to text-8xl)
font-weight: 300 (font-light)
letter-spacing: -0.03em (tracking-tighter)
line-height: 0.95 (leading-none)
color: #1C1917 (stone-900)
```
Example: "Hotel Coral Beach" should be massive, thin, elegant

**Subheadings (Section Labels, Categories):**
```css
font-family: 'Inter', sans-serif
font-size: 0.875rem (text-sm)
font-weight: 500 (font-medium)
letter-spacing: 0.1em (tracking-widest)
text-transform: uppercase
color: #78716C (stone-500)
```
Example: "AVAILABLE SUNBEDS" or "COCKTAILS"

**Body Text & Descriptions:**
```css
font-family: 'Inter', sans-serif
font-size: 1.125rem (text-lg)
font-weight: 400 (font-normal)
letter-spacing: 0.01em
line-height: 1.6 (leading-relaxed)
color: #57534E (stone-600)
```

**Price Display (Special Treatment):**
```css
font-family: 'Cormorant Garamond', serif
font-size: 2.5rem (text-4xl)
font-weight: 400 (font-normal)
color: #92400E (amber-900)
```
Example: €7.50 should look elegant, not bold

**Font Pairing - Editorial Luxury:**
- Headings: Cormorant Garamond (light weight, LARGE size)
- Body: Inter (regular weight, generous spacing)
- Prices: Cormorant Garamond (normal weight, large size)

---

## Component Design

**Primary Buttons:**
```
bg-stone-900 text-stone-50
px-8 py-4
rounded-full
text-sm tracking-widest uppercase
hover:bg-stone-800
transition-all duration-300
shadow-[0_4px_14px_rgba(0,0,0,0.1)]
```

**Secondary Buttons:**
```
border border-stone-300 text-stone-700
px-8 py-4
rounded-full
hover:border-stone-400 hover:bg-stone-50
transition-all duration-300
```

**Cards:**
```
bg-gradient-to-br from-white to-stone-50/50
backdrop-blur-2xl
rounded-[2rem]
p-8 md:p-12
shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]
border border-stone-200/40
hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)]
transition-all duration-500 ease-out
```

**Shadows (Subtle & Sophisticated):**
```
shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]
shadow-[0_8px_30px_rgba(0,0,0,0.04)]
```

---

## Micro-interactions & Animation

**All Hover States:**
```
transition-all duration-500 ease-out
```

**Cards:**
```
hover:-translate-y-2
```

**Images:**
```
hover:scale-105
overflow-hidden
```

**Coordinated Animations:**
- Use `group` on parent elements
- Staggered fade-ins: delay-100, delay-200, delay-300

---

## Layout Principles

**Structure:**
- Asymmetric layouts over rigid grids
- Cards extend beyond boundaries
- Hero images bleed to edges with text overlays
- Massive whitespace

**Spacing:**
- Desktop: `p-12`, `px-16`, `py-24`
- Extra padding around cards: `gap-8` minimum
- Containers: `max-w-7xl mx-auto`

---

## Luxury Touches

**Texture:**
- Subtle noise overlay at 2% opacity on backgrounds

**Depth:**
- `mix-blend-mode: multiply` on decorative elements
- Thin 1px vertical dividers: `bg-gradient-to-b from-transparent via-stone-300 to-transparent`

**Polish:**
- Staggered fade-in animations
- Blurred full-bleed images at 30% opacity for backgrounds
- Minimal outlines that fill on interaction
- Vignette overlays

---

## What to Avoid

❌ Bright orange buttons (#F97316, #EA580C)
❌ Pure white cards on gray backgrounds
❌ Centered, symmetrical layouts
❌ Small, timid typography
❌ Generic rounded corners everywhere
❌ Emoji-style illustrations
❌ Bright, saturated colors
❌ Material UI / Bootstrap vibes
❌ Cookie-cutter card layouts

---

## Page-Specific Guidelines

### Discovery Page
- Remove orange borders - use subtle shadows
- Make cards asymmetric - extend beyond map boundary
- Hero images bleed to edges
- Status badges: `bg-emerald-50 text-emerald-800 border-emerald-200`
- Search bar: Minimal underline, no rounded white box
- "View Details": Sophisticated underlined link, not button

### Review Page
- Background: Blurred full-bleed hotel image at 30% opacity
- Stars: Minimal outlines that fill on hover
- Massive whitespace - stars tiny relative to canvas
- Hotel name: `text-5xl font-light tracking-tight`
- Add subtle vignette overlay

### Menu Page
- NO ORANGE - use `bg-stone-50` for active tab with `border-b-2 border-stone-900`
- Cards: `bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- Price: `text-3xl font-light text-amber-900`
- Add button: `border border-stone-300 text-stone-700 hover:bg-stone-50`
- Replace emoji drinks with actual photographs or elegant line drawings
- Grid: `grid-cols-2 gap-8` with extra padding

---

## Staff-Facing Pages (Industrial Minimalist)
**Pages:** AdminDashboard, CollectorDashboard, BarDisplay, SunbedManager, LoginPage

**Philosophy:** Fast, efficient, readable - no decorative elements

**Colors:**
- Background: `bg-black`, `bg-zinc-900`
- Text: `text-white`, `text-zinc-400`, `text-zinc-500`
- Borders: `border-zinc-700`, `border-zinc-800` (1-2px)
- Accents: `bg-white` (buttons), `bg-blue-600` (actions)

**Typography:**
- Font: Inter (Tailwind default)
- Monospace: `font-mono` for numbers/codes
- Sizes: Large (4xl-6xl) for key info
- Weights: `font-bold`, `font-black` for emphasis

**Components:**
- Sharp corners: `rounded-md`, `rounded-lg`
- No shadows or gradients
- Flat design with 1-2px borders
- High contrast: white on black
- Tight spacing: `p-4`, `p-6`
- Dense grid layouts

---

## Implementation Checklist

Before shipping any customer-facing page:

- [ ] Does it feel like it cost $20,000+ to develop?
- [ ] Would this feel at home on amanresorts.com or sohohouse.com?
- [ ] Is there enough whitespace to breathe?
- [ ] Are colors sophisticated and muted (not bright)?
- [ ] Does the typography feel editorial and refined?
- [ ] Are shadows subtle (not harsh)?
- [ ] Do animations feel luxurious (500ms+ durations)?
- [ ] Are corners soft and organic (rounded-[2rem])?
- [ ] NO bright orange anywhere?
- [ ] Would a design agency charge $20k+ for this?

If any answer is "no", refine further.
