# 8. Responsiveness Strategy

## 8.1 Breakpoints

| Breakpoint | Min Width | Max Width | Target Devices |
|------------|-----------|-----------|----------------|
| **Mobile** | 320px | 767px | iPhone SE, Android phones |
| **Tablet** | 768px | 1023px | iPad, Android tablets |
| **Desktop** | 1024px | 1439px | Laptops, desktops |
| **Wide** | 1440px | - | Large monitors (same as desktop) |

---

## 8.2 Adaptation Patterns

### Layout Changes

**Profile Card:**
- Mobile: Avatar centered, 80px; username centered; social icon-only; edit full-width
- Tablet: Avatar left 100px; username left-aligned; social icon+label; edit top-right
- Desktop: Avatar left 120px; username 32px font; social with hover; edit top-right

**Onboarding Wizard:**
- Mobile: Full-width, dots only progress, buttons stacked
- Tablet: 600px centered, connected dots, buttons inline
- Desktop: 480px centered, full stepper, buttons inline

**Completeness Indicator:**
- Mobile: Collapsed by default (tap to expand)
- Desktop: Always expanded

---

### Navigation Changes

**Edit Sheet:**
- Mobile: Slides from bottom, 85% viewport height, swipe-down dismiss
- Desktop: Slides from right, 480px width, ESC dismiss

**Wizard Navigation:**
- Mobile: Full-width buttons stacked (Back top, Next bottom sticky)
- Desktop: Inline buttons (Back left, Next right)

---

### Interaction Changes

**Touch vs. Mouse:**
- Mobile: 44x44px targets, no hover, tap feedback, swipe gestures, long-press tooltips
- Desktop: Standard sizes, hover enabled, click feedback, keyboard shortcuts, hover tooltips

**Input Methods:**
- Mobile: Virtual keyboard optimization, `inputmode` attributes, autofill support
- Desktop: Physical keyboard, Tab order, Enter/ESC, copy/paste

---

## 8.3 Responsive Testing Checklist

**Devices:**
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13 (390x844)
- [ ] iPad (768x1024)
- [ ] Laptop 13" (1280x800)
- [ ] Desktop 1080p (1920x1080)

**Orientations:**
- [ ] Mobile portrait (optimized)
- [ ] Mobile landscape (usable)
- [ ] Tablet portrait/landscape

**Edge Cases:**
- [ ] 320px width minimum
- [ ] Browser zoom at 200%
- [ ] Split-screen view (iPad)

---

