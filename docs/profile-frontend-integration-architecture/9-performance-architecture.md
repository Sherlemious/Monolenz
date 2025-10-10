# 9. Performance Architecture

## 9.1 Optimization Strategies

**1. Lazy Loading Components**:
```typescript
// app/(app)/profile/page.tsx
import { lazy, Suspense } from 'react';

const ProfileEditSheet = lazy(() => import('@/components/profile/ProfileEditSheet'));

// In component
{isEditSheetOpen && (
  <Suspense fallback={null}>
    <ProfileEditSheet {...props} />
  </Suspense>
)}
```
**Benefit**: ~30KB saved on initial page load

**2. Optimistic UI Updates** (Already Implemented):
- Zero perceived latency for successful operations
- Instant visual feedback
- Automatic rollback on error

**3. Debounced API Calls**:
```typescript
// Username availability check
const [username, setUsername] = useState('');
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

const checkAvailability = useMemo(
  () => debounce(async (value: string) => {
    if (value.length >= 3) {
      const result = await profileApi.checkUsername(value);
      setIsAvailable(result.available);
    }
  }, 500),
  []
);

useEffect(() => {
  checkAvailability(username);
}, [username]);
```
**Benefit**: Reduces API calls by ~80% during typing

**4. Skeleton Loading States**:
```typescript
// Prevents layout shift
if (loading) {
  return <ProfileSkeleton />;  // Matches ProfileCard dimensions
}
```

**5. Image Optimization**:
```typescript
// Avatar component
<img
  src={profile.profile_picture_url || '/default-avatar.svg'}
  alt={`${profile.username}'s avatar`}
  loading="lazy"
  width={120}
  height={120}
  onError={(e) => {
    e.currentTarget.src = '/default-avatar.svg';
  }}
/>
```

## 9.2 Performance Targets

**Core Web Vitals** (UX Spec Section 9.3):
- **LCP**: < 2.5s (Profile card appears)
- **FID**: < 100ms (Button click response)
- **CLS**: < 0.1 (Skeleton prevents layout shift)

**Bundle Size**:
- Profile page bundle: < 50KB gzipped
- Lazy-loaded edit sheet: ~30KB additional

**Interaction Response**:
- Optimistic update: < 50ms (instant)
- API roundtrip: < 500ms (4G network)
- Animation: 60fps (GPU-accelerated transforms)

---

