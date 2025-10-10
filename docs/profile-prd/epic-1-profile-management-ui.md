# Epic 1: Profile Management UI

**Epic Goal**: Enable complete profile lifecycle management through an intuitive, responsive UI that integrates seamlessly with the existing Athaar backend API, allowing users to create, view, edit, and manage their profiles while maintaining existing system integrity.

**Integration Requirements**: 
- Integrate with existing profile API endpoints (POST, GET, PUT) without backend modifications
- Use existing `useProfile` hook for state management and optimistic updates
- Follow established Radix UI + Tailwind CSS patterns
- Maintain compatibility with existing authentication flow (Supabase JWT)
- Delete old placeholder components only after new components are fully tested

---

## Story 1.1: Empty Profile State & Error Handling

**As a** new user who has just signed up,  
**I want** to see a welcoming empty state when I have no profile,  
**so that** I understand I need to create a profile and feel guided to do so.

### Acceptance Criteria

**AC1**: When a user navigates to `/profile` and the API returns 404 (no profile exists), the page displays an `EmptyProfileState` component with:
- Welcome heading: "Welcome to Your Profile"
- Descriptive text explaining benefits of completing a profile
- Clear call-to-action button: "Create Your Profile"
- Optional illustration or empty state graphic

**AC2**: When the "Create Your Profile" button is clicked, the page transitions to show the onboarding wizard (Step 1 visible).

**AC3**: When API returns authentication error (401), the user is redirected to `/login` with a message: "Your session has expired. Please log in again."

**AC4**: When API returns network error or 500 server error, a toast notification displays: "Unable to load profile. Please try again." with a "Retry" button that refetches profile data.

**AC5**: All error states maintain the existing dashboard layout (header/navigation visible).

### Integration Verification

**IV1**: Verify existing `useProfile` hook correctly handles 404 response and sets error state without breaking page render.

**IV2**: Verify existing Supabase authentication redirect logic works when token is invalid/expired.

**IV3**: Verify toast notifications use existing Sonner configuration and appear in correct position (top-right).

---

## Story 1.2: Onboarding Wizard - Step 1 (Username)

**As a** new user starting profile creation,  
**I want** to choose my username in a focused, simple first step,  
**so that** I can establish my identity without being overwhelmed.

### Acceptance Criteria

**AC1**: When the onboarding wizard is active, Step 1 displays:
- Progress indicator: "Step 1 of 4"
- Section heading: "Choose Your Username"
- Helper text: "This will be your unique identifier on Athaar. Choose wisely - it can be changed later."
- Username input field with placeholder "e.g., john_developer"
- Character counter showing "0/50"
- Format hint below input: "3-50 characters: letters, numbers, underscores, and hyphens only"

**AC2**: Username input validates format in real-time:
- Shows red error text if less than 3 characters: "Username must be at least 3 characters"
- Shows red error text if more than 50 characters: "Username must be less than 50 characters"
- Shows red error text if contains invalid characters: "Only letters, numbers, underscores, and hyphens allowed"
- Shows green checkmark icon when format is valid

**AC3**: "Next" button at bottom is:
- Disabled (grayed out) when username is empty or format is invalid
- Enabled (primary style) when username format is valid
- Shows text "Next: Basic Info"

**AC4**: Clicking "Next" button when enabled saves username to wizard state and advances to Step 2.

**AC5**: Back button is not shown on Step 1 (first step).

### Integration Verification

**IV1**: Verify username validation uses the shared Zod schema from `@monolenz/types/validation/profile-schemas.ts` (specifically the username portion).

**IV2**: Verify wizard state (username value) persists when user navigates back from Step 2 to Step 1.

**IV3**: Verify username is normalized (trimmed, lowercased if needed) according to existing backend business rules.

---

## Story 1.3: Onboarding Wizard - Steps 2, 3, 4 (Basic Info, Social Links, Review)

**As a** new user completing profile creation,  
**I want** to add my bio, profile picture, and social links in organized steps,  
**so that** I can build a complete profile without confusion.

### Acceptance Criteria

**AC1 - Step 2: Basic Info**
- Progress indicator: "Step 2 of 4"
- Section heading: "Tell Us About Yourself"
- Bio textarea with:
  - Label: "Bio (optional)"
  - Placeholder: "Share a bit about yourself..."
  - Character counter: "0/500"
  - Max 500 characters enforced
- Profile picture URL input with:
  - Label: "Profile Picture URL (optional)"
  - Placeholder: "https://example.com/avatar.jpg"
  - URL format validation (shows error if invalid URL)
- "Back" button (returns to Step 1)
- "Next: Social Links" button (always enabled, fields optional)

**AC2 - Step 3: Social Links**
- Progress indicator: "Step 3 of 4"
- Section heading: "Connect Your Profiles"
- Three URL input fields (all optional):
  - LinkedIn URL with placeholder "https://linkedin.com/in/yourname"
  - GitHub URL with placeholder "https://github.com/yourname"
  - Portfolio URL with placeholder "https://yourportfolio.com"
- Each URL field validates format (shows error if invalid URL format)
- "Back" button (returns to Step 2)
- "Next: Review" button (enabled when no validation errors)

**AC3 - Step 4: Review & Complete**
- Progress indicator: "Step 4 of 4"
- Section heading: "Review Your Profile"
- Profile preview card displaying:
  - Avatar placeholder (or from profile_picture_url if provided)
  - Username (large, prominent)
  - Bio (if provided, or "No bio added" in muted text)
  - Social link icons (only visible links shown)
- "Back" button (returns to Step 3)
- "Complete Profile" button (primary, prominent)

**AC4**: Clicking "Complete Profile" button:
- Shows loading spinner on button
- Disables all form inputs
- Calls `POST /api/v1/profiles` with all wizard data
- On success: Shows success toast "Profile created successfully!" and transitions to profile view mode
- On error (409 - username taken): Shows error toast "Username '[username]' is already taken" with "Go Back" button that returns to Step 1
- On error (422 - validation): Shows specific field errors and highlights affected step
- On error (other): Shows generic error toast with retry option

**AC5**: All steps maintain wizard state - user can navigate back and forward without losing data until final submission.

### Integration Verification

**IV1**: Verify profile creation uses existing `profileApi.createProfile()` method from `apps/web/lib/api/profile.ts`.

**IV2**: Verify successful profile creation triggers `useProfile` hook to refetch and update profile state.

**IV3**: Verify username conflict (409) error is handled gracefully without breaking wizard flow.

**IV4**: Verify all URL fields validate using Zod URL schema from shared types package.

**IV5**: Verify wizard clears state after successful profile creation.

---

## Story 1.4: Profile View Component (Replace Old Components)

**As a** user with an existing profile,  
**I want** to see my complete profile information in a clean, organized layout,  
**so that** I can view my profile details and access editing functionality.

### Acceptance Criteria

**AC1**: When profile exists and loads successfully, the page displays new `ProfileView` component containing:
- `ProfileCard` component with:
  - Avatar (from profile_picture_url or default placeholder)
  - Username (large, bold heading)
  - Bio (if exists, or "No bio added" in muted text)
  - Social link buttons (only for links that exist):
    - LinkedIn icon button (opens in new tab)
    - GitHub icon button (opens in new tab)
    - Portfolio icon button (opens in new tab)
  - "Edit Profile" button (prominent, top-right or below info)

**AC2**: Profile displays `CompletenessIndicator` component showing:
- Progress bar (0-100%) based on filled fields
- Percentage text: "75% Complete"
- List of missing optional fields: "Add LinkedIn to improve your profile"
- Encouraging message when 100%: "Your profile is complete! 🎉"

**AC3**: Completeness calculation:
- Username: Required, always counts as filled
- Bio: 20% if filled
- Profile Picture URL: 20% if filled
- LinkedIn URL: 20% if filled
- GitHub URL: 20% if filled
- Portfolio URL: 20% if filled
- Total: 100% = all 6 fields filled

**AC4**: Loading state shows `ProfileSkeleton` component (existing, may need minor updates).

**AC5**: After this story is complete and tested, **old components are deleted**:
- Delete `ProfileHeader.tsx`
- Delete `ProfileAvatar.tsx`
- Delete `ProfileBasicInfo.tsx`
- Delete `ProfileCompleteness.tsx`

### Integration Verification

**IV1**: Verify profile data is fetched using existing `useProfile` hook with no modifications to the hook itself.

**IV2**: Verify social link URLs open in new tab with `target="_blank"` and `rel="noopener noreferrer"` for security.

**IV3**: Verify `CompletenessIndicator` calculation matches existing `calculateCompleteness` utility function (if exists) or uses same logic.

**IV4**: Verify new `ProfileCard` component follows exact same styling patterns as existing authenticated page components (same card style, padding, shadows).

**IV5**: Verify old component imports are removed from `page.tsx` without breaking page render.

---

## Story 1.5: Profile Edit Form (Sheet Modal)

**As a** user with an existing profile,  
**I want** to edit my profile details in a focused modal form,  
**so that** I can update my information without losing context of my current profile.

### Acceptance Criteria

**AC1**: Clicking "Edit Profile" button opens `ProfileEditSheet` (Radix UI Sheet) that:
- Slides in from right on desktop (>768px)
- Slides in from bottom on mobile (≤768px)
- Overlays the profile view with semi-transparent backdrop
- Traps focus inside sheet (ESC key closes, clicking backdrop closes)
- Returns focus to "Edit Profile" button when closed

**AC2**: Sheet header displays:
- Title: "Edit Profile"
- Close button (X icon, top-right)

**AC3**: Sheet body contains `ProfileEditForm` with all fields pre-populated from current profile:
- Username field (with current username value)
- Bio textarea (with current bio or empty)
- Profile Picture URL (with current URL or empty)
- LinkedIn URL (with current URL or empty)
- GitHub URL (with current URL or empty)
- Portfolio URL (with current URL or empty)

**AC4**: Form validation:
- Username: 3-50 characters, alphanumeric + underscore/hyphen (inline error on blur)
- Bio: Max 500 characters with counter (inline error at 501)
- URLs: Valid URL format (inline error on blur if invalid)
- All fields show validation state (error text in red below field)

**AC5**: Sheet footer contains:
- "Cancel" button (secondary style) - closes sheet without saving
- "Save Changes" button (primary style) - submits form

**AC6**: If user modifies any field and attempts to close sheet (X button or backdrop click), show inline confirmation: "You have unsaved changes. Are you sure you want to close?" with "Discard Changes" / "Keep Editing" options.

**AC7**: Form submission (clicking "Save Changes"):
- Validates all fields client-side
- If validation fails: Shows inline errors, keeps sheet open
- If validation passes: Proceeds to username check (Story 1.6) or saves immediately if username unchanged

### Integration Verification

**IV1**: Verify sheet uses existing `useProfile().updateProfile()` method for optimistic updates.

**IV2**: Verify form validation uses shared Zod schemas (`profileSchemas.updateForm`) from `@monolenz/types/validation`.

**IV3**: Verify sheet accessibility (keyboard navigation, focus trap, ARIA labels) follows Radix UI defaults.

**IV4**: Verify sheet overlay does not interfere with existing dashboard header/navigation.

**IV5**: Verify mobile responsiveness - sheet is usable on 320px width screens.

---

## Story 1.6: Username Change Confirmation Dialog

**As a** user attempting to change my username,  
**I want** to see a warning about the implications,  
**so that** I can make an informed decision before proceeding.

### Acceptance Criteria

**AC1**: When user changes username in edit form and clicks "Save Changes", the system:
- Detects username has changed (compares to original profile.username)
- If unchanged: Proceeds directly to save (optimistic update + API call)
- If changed: Shows `UsernameChangeDialog` (Radix UI AlertDialog) before saving

**AC2**: `UsernameChangeDialog` displays:
- Warning icon (⚠️ or similar)
- Title: "Confirm Username Change"
- Message: "Changing your username from '[old_username]' to '[new_username]' may affect your profile URL and how others find you. This action cannot be easily undone. Are you sure you want to continue?"
- Two buttons:
  - "Cancel" (secondary style) - closes dialog, returns to edit form
  - "Yes, Change Username" (primary style, slightly warning color) - proceeds with save

**AC3**: Clicking "Yes, Change Username":
- Closes confirmation dialog
- Closes edit sheet
- Performs optimistic update (updates UI immediately with new username)
- Calls `PUT /api/v1/profiles/me` with updated data
- On success: Shows success toast "Profile updated successfully!"
- On error (409 - username taken): Rolls back UI, shows error toast "Username '[new_username]' is already taken. Please choose another.", reopens edit sheet
- On error (other): Rolls back UI, shows error toast with retry option

**AC4**: Clicking "Cancel" in dialog:
- Closes dialog
- Returns focus to edit form (still open)
- Username field remains editable

**AC5**: Dialog can be dismissed with ESC key (same as clicking "Cancel").

### Integration Verification

**IV1**: Verify optimistic update uses existing `useProfile().updateProfile()` rollback mechanism on error.

**IV2**: Verify username conflict (409) error reopens edit sheet with error message clearly visible near username field.

**IV3**: Verify dialog does not appear if username is unchanged (even if other fields are modified).

**IV4**: Verify dialog follows existing Radix UI AlertDialog patterns (focus management, dismissal behavior).

**IV5**: Verify "Yes, Change Username" button styling provides subtle visual warning (border color or slight red tint) without being overly alarming.

---

## Story 1.7: Error Handling & Edge Cases

**As a** user interacting with the profile system,  
**I want** clear, actionable error messages for all failure scenarios,  
**so that** I understand what went wrong and how to resolve it.

### Acceptance Criteria

**AC1 - Network Errors**: When any API call fails due to network issues:
- Show toast notification: "Network error. Please check your connection."
- Provide "Retry" button in toast that re-attempts the failed operation
- Maintain existing UI state (don't clear forms or lose data)

**AC2 - Authentication Errors (401)**: When API returns 401 Unauthorized:
- If error message is "Email not confirmed": Show toast "Please confirm your email address to access your profile" (stay on page)
- If error message is "Invalid or expired token": Redirect to `/login` with message "Your session has expired. Please log in again."

**AC3 - Validation Errors (422)**: When API returns 422 Unprocessable Entity:
- Parse `errors` array from response
- Display field-specific errors inline (red text below each affected field)
- If in onboarding wizard: Highlight and navigate to step containing error
- If in edit form: Keep sheet open with errors visible
- Show toast: "Please correct the errors and try again"

**AC4 - Conflict Errors (409)**: When API returns 409 Conflict (username taken):
- Show toast: "Username '[username]' is already taken. Please choose another."
- If in onboarding wizard: Navigate back to Step 1 with username field focused
- If in edit form: Reopen edit sheet with username field focused and error displayed

**AC5 - Server Errors (500)**: When API returns 500 Internal Server Error:
- Show toast: "Something went wrong on our end. Please try again later."
- Provide "Retry" button in toast
- Log error to console for debugging

**AC6 - Empty Profile State**: When profile exists but all optional fields are empty:
- Display profile with placeholders ("No bio added", default avatar)
- Show completeness at minimum (16.67% for username only)
- Display encouraging message: "Complete your profile to stand out! Add a bio and profile picture."

**AC7 - Partial Form Submission**: When user starts onboarding, navigates away, then returns:
- Wizard state is reset (don't persist across sessions)
- User starts fresh from Step 1
- (Optional future enhancement: Save wizard progress to localStorage)

### Integration Verification

**IV1**: Verify all error toasts use existing Sonner configuration and auto-dismiss after 4 seconds (except those with action buttons).

**IV2**: Verify error messages match backend API error messages for consistency.

**IV3**: Verify optimistic update rollback works correctly for all error types (UI reverts to previous state).

**IV4**: Verify console.error logs include sufficient context for debugging (API endpoint, request data, error response).

**IV5**: Verify form state (wizard or edit form) is preserved during error handling (user doesn't lose entered data).

---

## Story 1.8: Mobile Responsiveness & Accessibility

**As a** user on mobile or using assistive technology,  
**I want** the profile system to work seamlessly on my device,  
**so that** I can manage my profile regardless of how I access Athaar.

### Acceptance Criteria

**AC1 - Mobile Onboarding Wizard (320px - 768px)**:
- All wizard steps display correctly on 320px width (smallest mobile)
- Input fields have minimum 44px touch target height
- Text is readable without zooming (minimum 16px font size)
- "Next" / "Back" buttons are full-width or prominently sized on mobile
- Progress indicator is visible and doesn't overlap content
- Step navigation works with touch gestures

**AC2 - Mobile Edit Sheet**:
- Sheet slides from bottom (not right) on screens ≤768px
- Sheet height is appropriate (70-90% viewport height)
- Form fields are stacked vertically with adequate spacing
- "Save Changes" / "Cancel" buttons are full-width on mobile
- Keyboard pushes sheet up (doesn't hide inputs)

**AC3 - Mobile Profile View**:
- Profile card layout stacks vertically on mobile (avatar → username → bio → links)
- Social link buttons are touch-friendly (minimum 44x44px)
- "Edit Profile" button is prominent and easily tappable
- Completeness indicator is visible without horizontal scroll

**AC4 - Keyboard Navigation**:
- Tab order follows logical flow (Step 1 field → Next button → ...)
- All interactive elements focusable via keyboard
- Focus visible indicators (outline or ring) on all inputs/buttons
- Enter key submits forms (in wizard steps and edit sheet)
- ESC key closes modals/sheets

**AC5 - Screen Reader Accessibility**:
- All form inputs have associated labels (visible or aria-label)
- Error messages associated with inputs via aria-describedby
- Progress indicator announces step (aria-live region): "Step 2 of 4"
- Loading states announce: "Saving profile..." (aria-live="polite")
- Success/error toasts are announced to screen readers

**AC6 - Color Contrast**:
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Error states use both color AND icon (not color alone)
- Links/buttons have sufficient contrast in all states (default, hover, focus, disabled)

**AC7 - Responsive Breakpoints**:
- Mobile: 320px - 767px (single column, bottom sheets)
- Tablet: 768px - 1023px (partial two-column, side sheets)
- Desktop: 1024px+ (full layout, side sheets)

### Integration Verification

**IV1**: Verify mobile responsiveness tested on:
- iPhone SE (375px width)
- Android (360px width)
- Tablet (768px width)

**IV2**: Verify keyboard navigation tested with Tab, Shift+Tab, Enter, ESC keys for all flows.

**IV3**: Verify screen reader compatibility tested with at least one tool (NVDA, JAWS, or VoiceOver).

**IV4**: Verify color contrast using automated tool (e.g., axe DevTools, Lighthouse).

**IV5**: Verify existing Radix UI components maintain accessibility defaults (focus trapping, ARIA attributes).

---

