# 3. User Interface Enhancement Goals

## 3.1 Integration with Existing UI

The profile management UI will integrate into the existing Athaar application structure as follows:

**Route Structure**:
- Profile lives at `/profile` within the `(app)` authenticated route group
- Uses existing `apps/web/app/(app)/dashboard/layout.tsx` for navigation/header
- Maintains consistency with other authenticated pages

**Design System Integration**:
- **Component Library**: Radix UI primitives (already in use)
- **Styling**: Tailwind CSS v4.1.11 (current version)
- **Typography**: Follow existing heading/body text patterns
- **Color Palette**: Use existing CSS variables for primary, secondary, destructive, muted colors
- **Spacing**: Maintain existing spacing scale (p-4, gap-6, etc.)
- **Animation**: Leverage existing animation classes (fade-in, slide-in)

**Component Patterns to Follow**:
- **Forms**: Radix UI Label + Input pattern seen in auth forms (`LoginForm.tsx`, `SignupForm.tsx`)
- **Buttons**: Radix UI Button with variants (default, outline, ghost, destructive)
- **Modals**: Radix UI Sheet for slide-out panels (edit profile form)
- **Dialogs**: Radix UI AlertDialog for confirmations (username change)
- **Loading**: Skeleton components for loading states (like existing `ProfileSkeleton.tsx`)
- **Toast Notifications**: Sonner (already in package.json) for success/error messages

**Navigation Integration**:
- Profile accessible from existing header/navigation
- Maintain existing authenticated layout wrapper
- Breadcrumb/back navigation if applicable

---

## 3.2 Modified/New Screens and Views

### 3.2.1 Profile Page - Empty State (New Users)
- **Path**: `/profile`
- **State**: User authenticated but no profile exists (404 from API)
- **Components**:
  - Welcome message
  - Benefits of completing profile
  - "Get Started" CTA button
  - Illustration or empty state graphic

### 3.2.2 Profile Page - Onboarding Wizard (New)
- **Path**: `/profile` (same page, wizard state)
- **Triggered**: When user clicks "Get Started" from empty state
- **Components**:
  - **Step 1: Username**
    - Username input field
    - Character count (3-50)
    - Format helper text
    - "Next" button (disabled until valid username)
  - **Step 2: Basic Info**
    - Bio textarea (500 char max with counter)
    - Profile picture URL input (optional)
    - URL preview/validation
    - "Back" and "Next" buttons
  - **Step 3: Social Links**
    - LinkedIn URL input (optional)
    - GitHub URL input (optional)
    - Portfolio URL input (optional)
    - URL validation and helper text
    - "Back" and "Next" buttons
  - **Step 4: Review**
    - Summary of all entered information
    - Profile preview (how it will appear)
    - "Back" and "Complete Profile" buttons
  - Progress indicator across all steps

### 3.2.3 Profile Page - View Mode (Existing Profile)
- **Path**: `/profile`
- **State**: User has complete profile
- **Components** (All NEW, replace old):
  - **Profile Card** (replaces ProfileHeader):
    - Avatar display (from profile_picture_url or default)
    - Username (large, prominent)
    - Bio (if exists)
    - Social link icons/buttons (LinkedIn, GitHub, Portfolio)
    - Profile completeness indicator with percentage
    - "Edit Profile" button
  - **Completeness Section**:
    - Visual progress bar
    - List of complete/incomplete sections
    - Encouragement to complete missing fields
  - **Future**: Placeholder for blocks/versions (not in this scope)

### 3.2.4 Profile Page - Edit Sheet (Modal)
- **Triggered**: Click "Edit Profile" button
- **Component**: Radix UI Sheet (slide-out from right)
- **Contains**:
  - Sheet header: "Edit Profile" + Close button
  - Form with all profile fields (pre-populated):
    - Username
    - Bio (textarea with counter)
    - Profile picture URL
    - LinkedIn URL
    - GitHub URL
    - Portfolio URL
  - Inline validation errors
  - Loading state on submit
  - "Cancel" and "Save Changes" buttons
  - Unsaved changes warning on close (if modified)

### 3.2.5 Username Change Confirmation Dialog
- **Triggered**: When username field is modified in edit form and user clicks "Save"
- **Component**: Radix UI AlertDialog
- **Content**:
  - Warning icon
  - Title: "Confirm Username Change"
  - Message: "Changing your username from '[old]' to '[new]' may affect your profile URL and how others find you. This action cannot be easily undone. Are you sure you want to continue?"
  - "Cancel" button (secondary)
  - "Yes, Change Username" button (primary, slightly warning style)

### 3.2.6 Error States
- **Network Error**: Toast notification with retry option
- **Validation Error**: Inline field errors (red text below inputs)
- **Conflict Error** (username taken): Inline error + message
- **Authentication Error**: Redirect to login with message

### 3.2.7 Loading States
- **Initial Load**: Full page skeleton (similar to existing ProfileSkeleton)
- **Form Submission**: Button loading spinner + disabled state
- **Optimistic Update**: Immediate UI update, show subtle loading on avatar/card

---

## 3.3 UI Consistency Requirements

**Visual Consistency**:
1. All new components must match existing button styles (hover states, focus rings, disabled states)
2. Form inputs must have consistent height, padding, border-radius as auth forms
3. Error states must use existing destructive color variant
4. Success states must use existing success/green color variant
5. Modal/sheet backgrounds must match existing overlay styles

**Interaction Consistency**:
1. Form validation triggers on blur and on submit (not on every keystroke)
2. Loading states disable interactive elements (buttons, inputs)
3. Toast notifications appear top-right with 4-second auto-dismiss (existing Sonner config)
4. Dialogs can be dismissed with ESC key or clicking outside (standard Radix behavior)
5. Focus management: When sheet opens, focus first input; when closes, return focus to trigger button

**Accessibility Consistency**:
1. All form inputs must have associated labels (visible or aria-label)
2. Error messages must be associated with inputs via aria-describedby
3. Loading states must announce to screen readers
4. Keyboard navigation must work for entire flow (Tab, Enter, ESC)
5. Color contrast must meet WCAG AA standards (existing theme complies)

**Mobile Responsiveness**:
1. Onboarding wizard must work on mobile (320px+) with adjusted layout
2. Edit sheet must slide from bottom on mobile (<768px), right on desktop
3. Form inputs must be touch-friendly (min 44px height)
4. Text must remain readable without zooming (min 16px font size on mobile)

---

