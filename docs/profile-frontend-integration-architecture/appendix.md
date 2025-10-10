# Appendix

## A. Component Props Reference

```typescript
// EmptyProfileState.tsx
interface EmptyProfileStateProps {
  onCreateClick: () => void;
}

// ProfileOnboardingWizard.tsx
interface ProfileOnboardingWizardProps {
  onComplete: (data: ProfileCreateData) => Promise<void>;
  onCancel?: () => void;
}

// ProfileView.tsx
interface ProfileViewProps {
  profile: BasicProfile;
  onEditClick: () => void;
}

// ProfileCard.tsx
interface ProfileCardProps {
  profile: BasicProfile;
  onEditClick: () => void;
}

// ProfileEditSheet.tsx
interface ProfileEditSheetProps {
  profile: BasicProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BasicProfileUpdate) => Promise<void>;
}

// UsernameChangeDialog.tsx
interface UsernameChangeDialogProps {
  open: boolean;
  oldUsername: string;
  newUsername: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// CompletenessIndicator.tsx
interface CompletenessIndicatorProps {
  profile: BasicProfile;
  variant?: 'expanded' | 'compact';
}
```

## B. File Creation Checklist

**New Files to Create**:
```
✅ components/profile/EmptyProfileState.tsx
✅ components/profile/ProfileOnboardingWizard.tsx
  ├── components/profile/steps/UsernameStep.tsx
  ├── components/profile/steps/BasicInfoStep.tsx
  ├── components/profile/steps/SocialLinksStep.tsx
  └── components/profile/steps/ReviewStep.tsx
✅ components/profile/ProfileView.tsx
✅ components/profile/ProfileCard.tsx
✅ components/profile/ProfileEditSheet.tsx
✅ components/profile/UsernameChangeDialog.tsx
✅ components/profile/CompletenessIndicator.tsx
✅ lib/utils/error-handler.ts
✅ lib/utils/validation.ts
```

**Files to Update**:
```
✏️  app/(app)/profile/page.tsx (orchestration logic)
✏️  lib/api/profile.ts (add createProfile method)
✏️  components/profile/ProfileSkeleton.tsx (minor layout updates)
```

**Files to Delete** (After Story 1.4 complete):
```
❌ components/profile/ProfileHeader.tsx
❌ components/profile/ProfileAvatar.tsx
❌ components/profile/ProfileBasicInfo.tsx
❌ components/profile/ProfileCompleteness.tsx
```

## C. Environment Variables

**Required** (already configured):
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (.env)
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## D. Key Integration Points Summary

| Layer | Component | Integration Point | Status |
|-------|-----------|------------------|--------|
| **UI** | ProfileOnboardingWizard | Uses profileSchemas.createForm | ✅ Shared schema |
| **State** | useProfile hook | Implements optimistic updates | ✅ Already built |
| **API** | profileApi.createProfile() | POST /api/v1/profiles | ⚠️ Add method |
| **Auth** | createBrowserApiClient() | Auto JWT injection | ✅ Working |
| **Backend** | Profile API endpoints | Express.js routes | ✅ No changes |
| **Database** | profiles table | PostgreSQL schema | ✅ No changes |

---

