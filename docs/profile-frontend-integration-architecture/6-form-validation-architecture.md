# 6. Form & Validation Architecture

## 6.1 Shared Validation Schemas

**Location**: `packages/types/src/validation/profile-schemas.ts` (EXISTING)

**Already Defined** (from architecture doc):
```typescript
export const profileSchemas = {
  create: profileDataSchema.required({ username: true }),
  update: profileDataSchema.partial(),
  
  // Form schemas (handle empty strings)
  createForm: profileDataSchema.extend({
    bio: z.string().transform(val => val.trim() || undefined).optional(),
    // ... other fields with same transform
  }).required({ username: true }),
  
  updateForm: profileDataSchema.extend({
    bio: z.string().transform(val => val.trim() || undefined).optional(),
    // ... other fields
  }).partial(),
};
```

**No Changes Required** ✅

## 6.2 Client-Side Validation Strategy

**When to Validate**:
- **On Blur**: Validate individual fields (show inline errors)
- **On Submit**: Validate entire form (prevent submission if invalid)
- **Real-time**: Character counters, username availability

**Implementation Pattern**:
```typescript
// In form component
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: any) => {
  const schema = profileSchemas.createForm.shape[field];
  const result = schema.safeParse(value);
  
  if (result.success) {
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  } else {
    setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    return false;
  }
};

// In input component
<Input
  value={formData.username}
  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
  onBlur={() => validateField('username', formData.username)}
  error={errors.username}
/>
```

## 6.3 Character Counters

**Implementation**:
```typescript
// Bio field (500 char max)
const bioLength = formData.bio?.length || 0;
const bioMaxLength = 500;

<div className="relative">
  <Textarea
    value={formData.bio}
    onChange={(e) => {
      if (e.target.value.length <= bioMaxLength) {
        setFormData({ ...formData, bio: e.target.value });
      }
    }}
    maxLength={bioMaxLength}
  />
  <span className="text-sm text-muted-foreground">
    {bioLength}/{bioMaxLength}
  </span>
</div>
```

**Character Limits** (from validation schemas):
- Username: 50 chars
- Bio: 500 chars
- URLs: 500 chars (enforced by database)

---

