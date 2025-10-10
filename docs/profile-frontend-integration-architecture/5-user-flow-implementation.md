# 5. User Flow Implementation

## 5.1 Flow 1: Profile Creation (Onboarding)

**UX Spec Reference**: Section 3.1

**Technical Implementation**:

```typescript
// ProfileOnboardingWizard.tsx
export function ProfileOnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<Partial<ProfileCreateData>>({});
  
  // Step 1: Username
  const validateUsername = async (username: string) => {
    // Client validation (Zod)
    const result = profileSchemas.createForm.shape.username.safeParse(username);
    if (!result.success) return result.error.errors[0].message;
    
    // Server validation (availability)
    const { available } = await profileApi.checkUsername(username);
    if (!available) return 'Username is already taken';
    
    return null;  // Valid
  };
  
  const handleNext = async () => {
    if (step === 4) {
      // Final submit
      try {
        await onComplete(data as ProfileCreateData);
      } catch (error) {
        if (error.statusCode === 409) {
          // Username conflict - navigate to Step 1
          setStep(1);
          toast.error('Username taken. Please choose another.');
        } else if (error.statusCode === 422) {
          // Validation error - navigate to affected step
          const firstError = error.errors[0];
          const errorStep = getStepForField(firstError.field);
          setStep(errorStep);
          // Show inline error
        }
      }
    } else {
      setStep((prev) => (prev + 1) as any);
    }
  };
  
  return (
    <div>
      {/* Progress indicator */}
      <div>Step {step} of 4</div>
      
      {/* Step components */}
      {step === 1 && <UsernameStep data={data} onChange={setData} />}
      {step === 2 && <BasicInfoStep data={data} onChange={setData} />}
      {step === 3 && <SocialLinksStep data={data} onChange={setData} />}
      {step === 4 && <ReviewStep data={data} />}
      
      {/* Navigation */}
      <div>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        <Button onClick={handleNext}>
          {step === 4 ? 'Complete Profile' : `Next: ${getNextStepName(step)}`}
        </Button>
      </div>
    </div>
  );
}
```

**Error Handling** (UX Spec 3.1 Edge Cases):
- **409 Conflict**: Navigate to Step 1, focus username field
- **422 Validation**: Navigate to step with error, show inline
- **Network Error**: Show retry, maintain wizard state
- **Token Expired**: Redirect to login, lose progress

---

## 5.2 Flow 2: Profile Editing

**UX Spec Reference**: Section 3.3

**Technical Implementation**:

```typescript
// ProfileEditSheet.tsx
export function ProfileEditSheet({ profile, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  
  const handleClose = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Discard?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  const handleSave = async () => {
    // Validate client-side
    const result = profileSchemas.updateForm.safeParse(formData);
    if (!result.success) {
      // Show validation errors
      return;
    }
    
    // Check if username changed
    if (formData.username !== profile.username) {
      setShowUsernameConfirm(true);
      return;
    }
    
    // Save directly
    await saveProfile();
  };
  
  const saveProfile = async () => {
    try {
      await onSave(formData);  // Optimistic update in parent
      // Sheet closes on success
    } catch (error) {
      // Error handling - sheet stays open
      if (error.statusCode === 409) {
        setErrors({ username: 'Username already taken' });
      }
    }
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent>
          {/* Form fields */}
          {/* ... */}
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetContent>
      </Sheet>
      
      <UsernameChangeDialog
        open={showUsernameConfirm}
        oldUsername={profile.username}
        newUsername={formData.username}
        onConfirm={saveProfile}
        onCancel={() => setShowUsernameConfirm(false)}
      />
    </>
  );
}
```

**Optimistic Update Flow**:
1. User clicks "Save Changes"
2. `onSave(formData)` called in parent
3. Parent calls `updateProfile(formData)` (useProfile hook)
4. Hook updates UI immediately (optimistic)
5. Hook makes API call
6. On success: UI already updated ✅
7. On error: Hook rolls back, sheet reopens with error

---

## 5.3 Flow 3: Username Change Confirmation

**UX Spec Reference**: Section 3.4

**Technical Implementation**:

```typescript
// UsernameChangeDialog.tsx
export function UsernameChangeDialog({ 
  open, 
  oldUsername, 
  newUsername, 
  onConfirm, 
  onCancel 
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <AlertTriangle className="w-12 h-12 text-warning" />
            Confirm Username Change
          </AlertDialogTitle>
          <AlertDialogDescription>
            Changing your username from <strong>'{oldUsername}'</strong> to{' '}
            <strong>'{newUsername}'</strong> may affect your profile URL and how 
            others find you. This action cannot be easily undone.
            
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-warning hover:bg-warning/90"
          >
            Yes, Change Username
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Interaction Flow**:
1. User changes username in edit form
2. Clicks "Save Changes"
3. System detects `formData.username !== profile.username`
4. Shows confirmation dialog
5. User clicks "Cancel" → Dialog closes, form remains open
6. User clicks "Yes, Change" → Proceeds with save (optimistic update)

---

