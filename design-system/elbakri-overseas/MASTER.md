# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** ELBAKRI OVERSEAS
**Generated:** 2026-07-12 00:07:30
**Category:** Travel/Tourism Agency

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#091E5D` | `--color-navy` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#1E40AF` | `--color-blue` |
| Accent/CTA | `#C89B3C` | `--color-champagne` |
| Accent text | `#8A5A00` | `--color-champagne-ink` |
| Background | `#F7F9FC` | `--color-mist` |
| Foreground | `#071126` | `--color-midnight` |
| Muted | `#5B667A` | `--color-muted` |
| Border | `#DCE6FF` | `--color-ice` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0F172A` | `--color-ring` |

**Color Notes:** Use aviation navy for trust, champagne for primary conversion emphasis only, and the darker champagne ink for small text on light surfaces.

### Typography

- **Heading Font:** Noto Sans Arabic
- **Body Font:** Noto Sans Arabic
- **Latin/numeric Font:** Outfit
- **Mood:** established, legible, premium, modern Arabic

**CSS Import:**
```css
Use `next/font` with Noto Sans Arabic and Outfit; do not use a CSS font import.
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #A16207;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0F172A;
  border: 2px solid #0F172A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0F172A;
  outline: none;
  box-shadow: 0 0 0 3px #0F172A20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Trust & Authority with restrained aviation glass

**Keywords:** real hotel photography, clear prices, destination discovery, direct WhatsApp confirmation, navy authority, restrained glass

**Best For:** B2B SaaS, professional services, premium products, e-commerce conversion pages, established brands

**Key Effects:** one-time reveal animation, subtle image zoom, active press feedback, sticky mobile conversion dock

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Narrative increases time-on-page 3x. Use progress indicator. Mobile: simplify animations.
- **CTA Placement:** Hero, after featured offers, honeymoon feature, final assistance CTA, and a mobile thumb-zone dock
- **Section Order:** 1. Conversion hero, 2. Trust proof, 3. Destinations, 4. Featured offers, 5. Honeymoon, 6. Booking steps, 7. Assistance CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Generic photos
- ❌ Complex booking
- ❌ Unverified testimonials, ratings, or scarcity claims
- ❌ Tiny isolated card buttons when the entire card can be the target
- ❌ Mobile CTAs outside comfortable thumb reach

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Primary mobile actions are at least 48px high with 8px spacing
- [ ] Full cards are clickable where they have one destination
- [ ] Fixed mobile action dock clears iOS safe areas and page content
