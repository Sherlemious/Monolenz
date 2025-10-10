# 2. Requirements

## 2.1 Functional Requirements

**FR1**: Users must be able to **create their initial profile** when visiting the profile page for the first time, providing a username (required) and optional fields (bio, profile picture URL, LinkedIn URL, GitHub URL, portfolio URL).

**FR2**: Users must be able to **view their complete profile** including all fields (username, bio, profile picture, social links) with a visual indicator of profile completeness.

**FR3**: Users must be able to **edit their profile** by clicking an "Edit Profile" button, which opens a form (Radix UI Sheet) pre-populated with current values, allowing updates to any field.

**FR4**: The system must display **appropriate empty states** when no profile exists, guiding users to create their profile with clear call-to-action.

**FR5**: Users must receive **immediate visual feedback** for profile updates through optimistic UI updates, with automatic rollback on errors.

**FR6**: The system must display **inline validation errors** for invalid inputs (username format, URL format, bio length) before and after submission.

**FR7**: Users must be able to **cancel profile creation or editing** without saving changes, with unsaved changes discarded.

**FR8**: The system must handle **partial profile data** gracefully, showing which fields are missing and encouraging completion.

**FR9**: Users must see **loading states** (skeletons) while profile data is being fetched from the API.

**FR10**: The system must display **meaningful error messages** for all API failures (network errors, authentication errors, validation errors, conflicts).

**FR11**: Users must be able to **view their profile completeness** as a percentage with visual progress indicator showing which sections are complete/incomplete.

**FR12**: When users attempt to **change their username**, the system must display a **confirmation dialog** warning: *"Changing your username may affect your profile URL and how others find you. Are you sure?"* with Cancel/Confirm options.

**FR13**: The profile page must include an **integrated progressive multi-step onboarding wizard** for first-time users (no existing profile), with the following structure:
- **Step 1: Username** - Choose unique username with format validation
- **Step 2: Basic Info** - Add bio and profile picture URL
- **Step 3: Social Links** - Add LinkedIn, GitHub, Portfolio URLs (all optional)
- **Step 4: Review & Complete** - Review all information before submission
- Visual progress indicator showing current step (e.g., "Step 2 of 4")
- "Back" and "Next/Complete" navigation buttons
- Ability to save and continue later (if applicable)

---

## 2.2 Non-Functional Requirements

**NFR1**: The profile UI must maintain **existing authentication flow** using Supabase JWT tokens without modifications to the auth system.

**NFR2**: All form inputs must be **validated client-side** using the existing shared Zod schemas from `@monolenz/types/validation` before API submission.

**NFR3**: The UI must provide **optimistic updates** that update immediately on user action, with automatic rollback on API errors, maintaining the existing `useProfile` hook pattern.

**NFR4**: The profile edit form must be **mobile-responsive** and work seamlessly on screens from 320px to 1920px width.

**NFR5**: All user-facing text must be **clear and actionable**, avoiding technical jargon in error messages.

**NFR6**: The UI must follow **existing Radix UI + Tailwind CSS patterns** established in the codebase for visual consistency.

**NFR7**: Form submission must include **loading indicators** with disabled submit buttons to prevent duplicate submissions.

**NFR8**: The UI must handle **network failures gracefully** with retry options where appropriate.

**NFR9**: Profile creation and editing must complete within **2 seconds** under normal network conditions (excluding network latency).

---

## 2.3 Compatibility Requirements

**CR1 - Existing API Compatibility**: The frontend must integrate with the existing profile API endpoints (`GET /api/v1/profiles/me`, `PUT /api/v1/profiles/me`, `POST /api/v1/profiles`) without requiring any backend changes or API contract modifications.

**CR2 - Database Schema Compatibility**: The UI must respect existing database constraints (username uniqueness, 500-character URL limits, 50-character username limit, 500-character bio limit) and handle constraint violation errors appropriately.

**CR3 - UI/UX Consistency**: New profile forms and components must be **built from scratch** using Radix UI primitives (Button, Label, Input, Sheet, Dialog) and Tailwind CSS, following the established design patterns in the codebase. The existing placeholder components (`ProfileHeader`, `ProfileAvatar`, `ProfileBasicInfo`, `ProfileCompleteness`) will be **replaced** with new, production-ready components. **Deletion of old components will occur AFTER new components are fully implemented and tested.**

**CR4 - Integration Compatibility**: The profile UI must work seamlessly with existing navigation, dashboard layout (`apps/web/app/(app)/dashboard/layout.tsx`), and maintain consistency with other authenticated pages in the `(app)` route group.

**CR5 - Profile Visibility**: Profile visibility will default to existing backend behavior: profiles are public by default, showing username, bio, portfolio URL, and profile picture to all users. LinkedIn and GitHub URLs are only visible to the profile owner. No additional privacy settings will be added in this enhancement.

**CR6 - Validation Compatibility**: The frontend must use the same Zod validation schemas (`profileSchemas.createForm`, `profileSchemas.updateForm`) as the backend to ensure consistent validation rules and error messages across client and server.

---

