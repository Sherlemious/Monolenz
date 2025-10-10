# 6. Branding & Style Guide

## 6.1 Visual Identity

**Brand Guidelines:** Athaar follows existing application patterns with profile-specific refinements

**Design Language:** Modern, clean, professional with emphasis on clarity

**Key Brand Attributes:**
- Professional (suitable for career/portfolio)
- Approachable (not intimidating)
- Trustworthy (clear communication)
- Efficient (respects user time)

---

## 6.2 Typography

### Font Families

- **Primary (UI):** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace:** `"JetBrains Mono", "Fira Code", Consolas, monospace`

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H2** | 1.875rem (30px) | 600 | 1.3 | Section headings (Choose Your Username) |
| **H3** | 1.5rem (24px) | 600 | 1.4 | Dialog titles (Edit Profile) |
| **H4** | 1.25rem (20px) | 600 | 1.5 | Card titles |
| **Body** | 1rem (16px) | 400 | 1.5 | Primary text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | Character counters, helper text |
| **Button** | 0.875rem (14px) | 500 | 1 | Button text |
| **Label** | 0.875rem (14px) | 500 | 1.5 | Form labels |

**Mobile Base Size:** 16px minimum (prevents iOS zoom)

---

## 6.3 Iconography

**Icon Library:** Lucide React (v0.263.1+)

**Icon Usage:**

| Icon | Context | Size | Color |
|------|---------|------|-------|
| `user-circle` | Default avatar | 80-120px | `muted` |
| `check-circle` | Valid username | 20px | `success` |
| `x-circle` | Invalid input | 20px | `destructive` |
| `loader-2` | Loading spinner | 16-20px | `muted-foreground` (animated) |
| `alert-triangle` | Warning (username dialog) | 48px | `warning` |
| `linkedin` | LinkedIn link | 20px | `#0A66C2` |
| `github` | GitHub link | 20px | `foreground` |
| `globe` | Portfolio link | 20px | `primary` |
| `edit` | Edit button | 16px | `foreground` |

**Usage Guidelines:**
- Consistent sizing: 16px (small), 20px (medium), 24px (large)
- Stroke width: 2px default
- Never use icons alone without text or aria-label
- Loading animations use `animate-spin` utility

---

## 6.4 Spacing & Layout

**Grid System:** 12-column responsive grid (Tailwind default)

**Container Max Widths:**
- Mobile: Full width (100vw - 32px padding)
- Tablet: 720px
- Desktop: 960px
- Wide: 1140px

**Spacing Scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-2` | 8px | Form field internal padding |
| `spacing-4` | 16px | Standard gap between fields, card padding (mobile) |
| `spacing-6` | 24px | Section spacing, card padding (desktop) |
| `spacing-8` | 32px | Large section gaps, wizard step spacing |
| `spacing-12` | 48px | Major section dividers |

---

## 6.5 Animation & Motion

**Motion Principles:**
- Purposeful (every animation serves a function)
- Subtle (200-400ms sweet spot)
- Respectful (honor `prefers-reduced-motion`)

**Timing Functions:**

| Name | Cubic Bezier | Usage |
|------|--------------|-------|
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering (most common) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State transitions |

**Duration Scale:**

| Duration | Value | Usage |
|----------|-------|-------|
| `fast` | 150ms | Button hover, focus ring |
| `base` | 300ms | Sheet open/close, toast enter/exit |
| `moderate` | 500ms | Progress bar fills |
| `slow` | 700ms | Loading states, skeleton shimmer |

**Key Animations:**

```css
/* Sheet slide-in from right (desktop) */
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Sheet slide-in from bottom (mobile) */
@keyframes slide-in-bottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

