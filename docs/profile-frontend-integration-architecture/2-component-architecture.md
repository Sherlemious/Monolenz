# 2. Component Architecture

## 2.1 Component Hierarchy

```
apps/web/
├── app/(app)/profile/
│   └── page.tsx                          # ORCHESTRATOR COMPONENT
│       ├── State: mode ('empty' | 'onboarding' | 'view' | 'editing')
│       ├── Hook: useProfile()
│       └── Renders appropriate component based on state
│
├── components/profile/                    # PROFILE-SPECIFIC COMPONENTS
│   │
│   ├── EmptyProfileState.tsx             # NEW - Story 1.1
│   │   ├── Props: { onCreateClick: () => void }
│   │   └── Renders: Welcome message, benefits, CTA
│   │
│   ├── ProfileOnboardingWizard.tsx       # NEW - Stories 1.2, 1.3
│   │   ├── Props: { onComplete: (data) => Promise<void> }
│   │   ├── State: currentStep (1-4), formData, errors
│   │   └── Children:
│   │       ├── steps/UsernameStep.tsx
│   │       ├── steps/BasicInfoStep.tsx
│   │       ├── steps/SocialLinksStep.tsx
│   │       └── steps/ReviewStep.tsx
│   │
│   ├── ProfileView.tsx                   # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile }
│   │   └── Children:
│   │       ├── ProfileCard.tsx
│   │       └── CompletenessIndicator.tsx
│   │
│   ├── ProfileCard.tsx                   # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile, onEditClick: () => void }
│   │   ├── Renders: Avatar, username, bio, social links
│   │   └── Uses: ProfileAvatar (composition)
│   │
│   ├── ProfileEditSheet.tsx              # NEW - Story 1.5
│   │   ├── Component: Radix Sheet (modal)
│   │   ├── Props: { profile: BasicProfile, isOpen, onClose, onSave }
│   │   ├── State: formData, errors, isDirty, isSubmitting
│   │   └── Children:
│   │       ├── ProfileEditForm
│   │       └── UsernameChangeDialog (conditional)
│   │
│   ├── UsernameChangeDialog.tsx          # NEW - Story 1.6
│   │   ├── Component: Radix AlertDialog
│   │   ├── Props: { oldUsername, newUsername, onConfirm, onCancel }
│   │   └── Renders: Warning message, Cancel/Confirm buttons
│   │
│   ├── CompletenessIndicator.tsx         # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile, variant: 'expanded' | 'compact' }
│   │   ├── Calculates: Percentage based on filled fields
│   │   └── Renders: Progress bar, field checklist
│   │
│   └── ProfileSkeleton.tsx               # EXISTING - Minor updates
│       ├── Renders: Shimmer placeholders
│       └── Matches: ProfileCard layout
│
└── lib/
    ├── hooks/
    │   └── useProfile.ts                 # EXISTING - Reuse as-is
    │
    ├── api/
    │   ├── client.ts                     # EXISTING - Token provider
    │   └── profile.ts                    # EXISTING - Add createProfile()
    │
    └── utils/
        ├── profile-helpers.ts            # EXISTING - Completeness calc
        └── validation.ts                 # NEW - Client-side Zod helpers
```

## 2.2 Component Specifications

### 2.2.1 ProfileOnboardingWizard

**Location**: `components/profile/ProfileOnboardingWizard.tsx`

**Purpose**: Multi-step profile creation wizard (FR13)

**Props**:
```typescript
interface ProfileOnboardingWizardProps {
  onComplete: (data: ProfileCreateData) => Promise<void>;
  onCancel?: () => void;
}
```

**State**:
```typescript
const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
const [formData, setFormData] = useState<Partial<ProfileCreateData>>({});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Step Flow**:
1. **Step 1**: Username (required, validates format, checks availability)
2. **Step 2**: Bio + Profile Picture URL (optional, validates URLs)
3. **Step 3**: Social Links (optional, validates URLs)
4. **Step 4**: Review + Submit (shows preview, calls onComplete)

**Validation Strategy**:
- Validate current step on "Next" click
- Maintain wizard state across back/forward navigation
- Show inline errors immediately
- Final validation before submit

**Integration with UX Spec**:
- Section 3.1 (Flow 1: Profile Creation)
- Section 4.2 (Screen 2: Onboarding Wizard)
- Progress indicator: "Step X of 4"
- Mobile: Full-width layout, bottom sheet behavior

---

### 2.2.2 ProfileEditSheet

**Location**: `components/profile/ProfileEditSheet.tsx`

**Purpose**: Modal form for editing existing profile (FR3)

**Props**:
```typescript
interface ProfileEditSheetProps {
  profile: BasicProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BasicProfileUpdate) => Promise<void>;
}
```

**State**:
```typescript
const [formData, setFormData] = useState<BasicProfileUpdate>(profile);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isDirty, setIsDirty] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
```

**Behavior**:
- Pre-populate all fields from `profile` prop
- Track changes with `isDirty` flag
- Warn on close if unsaved changes exist (AC6)
- Username change triggers confirmation dialog (Story 1.6)
- Optimistic update on save (via `onSave` callback)

**Radix Sheet Configuration**:
```typescript
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent 
    side="right"           // Desktop
    className="sm:bottom"  // Mobile: bottom sheet
  >
    {/* Form content */}
  </SheetContent>
</Sheet>
```

**Mobile Responsiveness** (UX Spec Section 8.2):
- Desktop (≥768px): Slide from right, 480px width
- Mobile (<768px): Slide from bottom, 85vh height

---

### 2.2.3 CompletenessIndicator

**Location**: `components/profile/CompletenessIndicator.tsx`

**Purpose**: Visual progress tracking (FR11)

**Calculation Logic** (from PRD AC3):
```typescript
function calculateCompleteness(profile: BasicProfile): number {
  const fields = [
    'username',           // Always filled (required)
    'bio',
    'profile_picture_url',
    'linkedin_url',
    'github_url',
    'portfolio_url'
  ];
  
  const filledCount = fields.filter(field => 
    profile[field] && profile[field].trim() !== ''
  ).length;
  
  return Math.round((filledCount / fields.length) * 100);
}
```

**Rendering**:
```typescript
<div>
  <Progress value={percentage} className="h-2" />
  <p>{percentage}% Complete</p>
  
  {/* Missing fields */}
  {missingFields.map(field => (
    <div key={field}>
      ✗ {fieldName} → Add to complete
    </div>
  ))}
</div>
```

**Variants**:
- `expanded`: Full checklist with progress bar
- `compact`: Progress bar + percentage only

---

