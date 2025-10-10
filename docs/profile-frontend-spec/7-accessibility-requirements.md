# 7. Accessibility Requirements

## 7.1 Compliance Target

**Standard:** WCAG 2.1 Level AA

**Scope:** All profile management UI components and flows

**Verification:** Manual testing + automated tools (axe DevTools, Lighthouse)

---

## 7.2 Key Requirements

### Visual Accessibility

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Focus Indicators:**
- 2px solid, high contrast (use `--ring` color)
- Never remove without alternative
- All interactive elements must show focus

**Text Sizing:**
- 16px minimum on mobile (prevents iOS auto-zoom)
- Interface usable at 200% zoom
- Use relative units (rem) where possible

---

### Interaction Accessibility

**Keyboard Navigation:**
- Logical tab order matching visual layout
- Enter submits forms
- ESC closes modals/sheets
- Focus trap in modals (Tab cycles within)
- Focus return when sheet closes

**Screen Reader Support:**
- All interactive elements have accessible names
- ARIA live regions for dynamic content
- Error messages associated via aria-describedby
- Form labels for all inputs

**Touch Targets:**
- 44x44px minimum (WCAG 2.5.5)
- 8px minimum spacing between targets
- Full-width buttons on mobile where appropriate

---

### Content Accessibility

**Alternative Text:**
- Avatar images: `alt="[Username]'s profile picture"`
- Default avatar: `alt="Default avatar"`
- Platform icons: `aria-hidden="true"` (label provides context)

**Heading Structure:**
- Logical hierarchy (no skipped levels)
- Single H1 per page (dashboard provides)
- H2 for sections, H3 for modals

**Form Labels:**
- Visible labels for all inputs
- Required indicators (asterisk or text)
- Helper text associated via aria-describedby

---

## 7.3 Testing Strategy

**Automated Testing:**
- Lighthouse CI: 95/100 minimum score
- axe DevTools: Zero critical violations
- ESLint: `eslint-plugin-jsx-a11y`

**Manual Testing:**
- Keyboard-only navigation (all flows)
- Screen reader testing (VoiceOver/NVDA)
- 200% zoom testing
- Color blindness simulation

**Compliance Checklist:**
- [ ] All images have alt text
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets requirements
- [ ] Form fields have labels
- [ ] Error messages announced
- [ ] Heading hierarchy logical
- [ ] Modal focus traps work
- [ ] ESC closes modals
- [ ] Interface usable at 200% zoom
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Touch targets 44x44px minimum

---

