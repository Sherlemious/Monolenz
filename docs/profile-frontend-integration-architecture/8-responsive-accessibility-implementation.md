# 8. Responsive & Accessibility Implementation

## 8.1 Responsive Breakpoints

**Tailwind Breakpoints** (UX Spec Section 8.1):
```typescript
// tailwind.config.js (existing)
{
  screens: {
    'sm': '640px',   // Not used for profile
    'md': '768px',   // Tablet - Sheet direction change
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Wide desktop
  }
}
```

**Profile-Specific Breakpoints**:
- **Mobile**: < 768px (bottom sheets, stacked layout)
- **Desktop**: ≥ 768px (side sheets, side-by-side layout)

## 8.2 Responsive Component Behavior

**ProfileEditSheet**:
```typescript
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent
    side="right"                        // Desktop default
    className="
      md:max-w-[480px]                  // Desktop: fixed width
      max-md:bottom-0                   // Mobile: bottom sheet
      max-md:h-[85vh]                   // Mobile: 85% height
      max-md:rounded-t-lg               // Mobile: rounded top corners
    "
  >
    {/* Form content */}
  </SheetContent>
</Sheet>
```

**ProfileOnboardingWizard** (Mobile Layout):
```typescript
<div className="
  max-w-[480px] mx-auto px-4        // Centered, mobile padding
  md:px-6                            // Desktop padding
">
  {/* Progress indicator */}
  <div className="
    flex items-center justify-center  // Mobile: centered dots
    md:justify-between                // Desktop: full stepper
  ">
    <StepIndicator step={currentStep} />
  </div>
  
  {/* Form fields */}
  <div className="space-y-4 md:space-y-6">
    {/* Inputs */}
  </div>
  
  {/* Navigation buttons */}
  <div className="
    flex flex-col gap-3               // Mobile: stacked
    md:flex-row md:justify-between    // Desktop: inline
  ">
    <Button variant="secondary">Back</Button>
    <Button>Next</Button>
  </div>
</div>
```

## 8.3 Accessibility Implementation

**ARIA Attributes**:
```typescript
// Form fields with errors
<div>
  <Label htmlFor="username">Username *</Label>
  <Input
    id="username"
    aria-required="true"
    aria-invalid={!!errors.username}
    aria-describedby={errors.username ? "username-error" : undefined}
  />
  {errors.username && (
    <p id="username-error" className="text-destructive text-sm" role="alert">
      {errors.username}
    </p>
  )}
</div>

// Progress indicator
<div role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4}>
  Step {currentStep} of 4
</div>

// Loading states
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
  {isSubmitting ? (
    <span className="sr-only">Saving profile...</span>
  ) : (
    'Save Changes'
  )}
</Button>
```

**Keyboard Navigation**:
- Tab order: Inputs → Buttons (logical flow)
- Enter: Submit form (in all steps)
- ESC: Close sheet/dialog
- Focus trap: Radix UI handles automatically

**Screen Reader Support**:
- All inputs have labels (visible or aria-label)
- Error messages announced via `role="alert"`
- Loading states announced via `sr-only` text
- Form submission status announced

**WCAG 2.1 AA Compliance** (UX Spec Section 7):
- Color contrast: 4.5:1 for normal text ✅
- Focus indicators: 2px ring ✅
- Touch targets: 44x44px minimum ✅
- Keyboard accessible: All interactive elements ✅

---

