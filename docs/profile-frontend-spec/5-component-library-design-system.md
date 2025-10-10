# 5. Component Library / Design System

## 5.1 Design System Approach

**Strategy:** Leverage existing Radix UI + Tailwind CSS foundation with profile-specific component extensions

Athaar already uses Radix UI primitives with Tailwind CSS styling. Rather than creating an entirely new design system:

1. **Extend existing primitives** - Create profile-specific compositions
2. **Maintain consistency** - Follow established patterns from auth forms
3. **Document variants** - Define profile-specific variants
4. **Ensure accessibility** - Leverage Radix UI's built-in ARIA attributes

**Existing Foundation:**
- Component Library: Radix UI (`components/ui/`)
- Styling System: Tailwind CSS v4.1.11
- Color Palette: CSS variables (primary, secondary, destructive, muted, success)
- Typography: Existing heading/body scale

**New Profile Components:**
Located in `apps/web/components/profile/`:
- ProfileCard, ProfileEditSheet, ProfileOnboardingWizard
- EmptyProfileState, CompletenessIndicator, UsernameChangeDialog

---

## 5.2 Core Components

### Component 1: Button (Existing - Profile Usage)

**Variants:**
- `default` - Main actions (Create Profile, Save Changes)
- `secondary` - Cancel actions, Back navigation
- `outline` - Edit Profile button
- `ghost` - Subtle actions, icon buttons

**States:** Default, Hover, Focus, Active, Disabled, Loading

**Usage Guidelines:**
- Primary actions use `default` variant (max one per screen section)
- Loading state maintains button text + spinner
- Minimum touch target: 44px height on mobile

---

### Component 2: Input (Existing)

**Variants:** `default`, `error`, `success`

**States:** Default, Focus, Error, Success, Disabled, Loading

**Usage Guidelines:**
- Always pair with Label component
- Error messages below input via aria-describedby
- Character counters right-aligned below input

---

### Component 3: Sheet (Existing - Edit Usage)

**Variants:**
- `right` (desktop) - 480px wide
- `bottom` (mobile) - 80% viewport height

**Usage Guidelines:**
- Focus trap: Tab cycles through sheet only
- ESC key closes (with unsaved check)
- Backdrop click closes (with unsaved check)

---

### Component 4: AlertDialog (Username Confirmation)

**Usage Guidelines:**
- Use for critical confirmations only
- Warning icon for cautionary actions
- Action buttons must be specific ("Yes, Change Username")
- Cancel is safer default (focused first)

---

### Component 5: Progress (Completeness Indicator)

**Usage Guidelines:**
- Animate fill level changes (500ms smooth transition)
- Show percentage text alongside bar
- Success color when 100%, primary for partial
- Always accompany with text explanation

---

### Component 6: ProfileCard (New Composition)

**Variants:** `view`, `preview`

**Key Sub-components:**
- Avatar, Username heading, Bio text, Social link buttons, Edit button

**Usage Guidelines:**
- Avatar loads lazily with fallback
- Social links only render if URLs exist
- Bio truncates after 3 lines with ellipsis

---

### Component 7: CompletenessIndicator (New)

**Variants:** `expanded`, `compact`

**Calculation:** 
- Username (required) + 5 optional fields = 6 total
- Each filled field = 16.67%

**Usage Guidelines:**
- Missing field suggestions are clickable → open edit sheet
- Use encouraging language ("Add X to improve")

---

### Component 8: ProfileOnboardingWizard (New)

**States:** Step 1-4, Submitting

**Usage Guidelines:**
- Linear progression (can't skip steps)
- Step data preserved when navigating backward
- Error on submit navigates to step with error

---

### Component 9: Toast Notifications (Existing - Sonner)

**Variants:** `success`, `error`, `info`

**Usage Guidelines:**
- Auto-dismiss after 4 seconds (unless action button)
- Max 3 toasts visible at once
- Position: Top-right desktop, top-center mobile

---

## 5.3 Color CSS Variables (Explicit)

| Variable | Usage in Profile UI |
|----------|---------------------|
| `--primary` | Primary buttons, focus rings, active states |
| `--primary-foreground` | Text on primary buttons |
| `--secondary` | Secondary buttons, subtle backgrounds |
| `--secondary-foreground` | Text on secondary buttons |
| `--destructive` | Error states, validation errors |
| `--destructive-foreground` | Text in error messages |
| `--success` (hsl(142, 76%, 36%)) | Valid inputs, 100% completeness, checkmarks |
| `--success-foreground` (hsl(0, 0%, 100%)) | Text on success elements |
| `--warning` (hsl(38, 92%, 50%)) | Warning icon in username dialog |
| `--warning-foreground` (hsl(48, 96%, 89%)) | Text on warning elements |
| `--muted` | Placeholder text, disabled states, skeletons |
| `--muted-foreground` | Helper text, character counters |
| `--border` | Input borders, card borders, dividers |
| `--input` | Input field borders (default) |
| `--ring` | Focus rings (keyboard navigation) |
| `--background` | Page background |
| `--foreground` | Primary text color |

**Social Platform Colors:**
- LinkedIn: `#0A66C2`
- GitHub: `#181717` (light mode), `#FFFFFF` (dark mode)
- Portfolio: `var(--primary)`

---

