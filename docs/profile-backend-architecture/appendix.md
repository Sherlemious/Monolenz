# Appendix

## Common Issues & Solutions

### Issue 1: "Profile not found" on first login

**Cause**: New users don't have profile automatically created

**Solution**: Implement profile creation flow in UI

**Temporary Workaround**: Manually create profile via API POST request

---

### Issue 2: CORS errors in browser console

**Cause**: API not allowing frontend origin

**Solution**: Check CORS configuration in API:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

### Issue 3: "Authentication required" errors

**Cause**: Token not being sent or expired

**Debug Steps**:
1. Check browser console for token
2. Verify Supabase session exists
3. Check token expiration
4. Try re-logging in

**Check Session**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

---

### Issue 4: Validation errors on form submission

**Cause**: Client-side and server-side validation mismatch

**Solution**: Both use same Zod schemas from `@monolenz/types/validation`

**Verify**: Check that shared package is up-to-date in both apps

---

## Useful Commands

### Database

```bash
# View database structure
cd apps/api
pnpm prisma studio

# Reset database (DANGER)
pnpm prisma db push --force-reset

# View database logs (Supabase)
# Use Supabase dashboard
```

### Debugging

```bash
# Frontend
cd apps/web
# Check environment
pnpm next info

# Backend
cd apps/api
# Check TypeScript errors
pnpm type-check

# Run with debugging
DEBUG=* pnpm dev
```

---

## Next Steps for Implementation

### Immediate Priorities

1. **Implement Profile Creation Flow**
   - Empty state component
   - Create profile form
   - Initial profile setup wizard

2. **Implement Profile Edit Form** (PROF-002)
   - Edit sheet/modal component
   - Form validation
   - Username availability check
   - Image URL preview
   - Save/cancel actions

3. **Handle Null Profile State**
   - Graceful error handling
   - Create profile CTA
   - Loading states

4. **Add Profile Completeness Logic**
   - Calculate completion percentage
   - Show missing fields
   - Encourage profile completion

### Future Enhancements

5. **Image Upload**
   - Supabase Storage integration
   - Image cropper
   - Avatar generator

6. **Profile Visibility Settings**
   - Public/private toggle
   - Field-level privacy

7. **Profile Analytics**
   - View count
   - Link clicks
   - Profile completeness tracking

---

## Reference Links

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Zod Docs**: https://zod.dev
- **Radix UI**: https://www.radix-ui.com

---

