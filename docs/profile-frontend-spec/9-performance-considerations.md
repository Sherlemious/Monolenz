# 9. Performance Considerations

## 9.1 Performance Goals

| Metric | Target | Notes |
|--------|--------|-------|
| **Page Load** | < 2s | API call + render on 4G |
| **Interaction Response** | < 100ms | Optimistic updates |
| **Animation FPS** | 60fps | All animations smooth |
| **Bundle Size** | < 50KB gzipped | Profile-specific components |

---

## 9.2 Design Strategies

### 1. Skeleton Loading States
- Show layout placeholders immediately
- Match exact dimensions of loaded content
- Eliminates flash of unstyled content
- Minimum 300ms display time

### 2. Optimistic UI Updates
- Update UI instantly on user action
- API call in background
- Rollback on error with clear messaging
- Zero perceived latency for successful operations

### 3. Lazy Loading Heavy Components
- Edit sheet loads only when needed
- Wizard eager-loaded (primary flow)
- ~30KB saved on initial page load
- Acceptable +100-200ms on first edit

### 4. Image Optimization
- Lazy load avatars (`loading="lazy"`)
- Default avatar is SVG (tiny size)
- Broken URLs fallback to placeholder
- Explicit dimensions prevent layout shift

### 5. Debounced API Calls
- Username availability check: 500ms debounce
- Prevents API spam (1 call instead of 7 while typing)
- Reduces server load by ~80%

### 6. Form Validation Timing
- Validate on blur, not every keystroke
- Character counter updates in real-time (cheap)
- Final validation on submit

### 7. CSS Animations (GPU-Accelerated)
- Use transforms, not layout properties
- 60fps smooth on all devices
- Zero JavaScript execution during animation

### 8. Modal/Sheet Rendering
- Sheet always in DOM (display: none when closed)
- Opens in 300ms (animation only, no render)
- Minimal memory cost for better UX

---

## 9.3 Performance Monitoring

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Development Monitoring:**
```bash
# Lighthouse CI
npm run lighthouse -- --url=/profile

# Bundle analysis
npm run analyze
```

---

