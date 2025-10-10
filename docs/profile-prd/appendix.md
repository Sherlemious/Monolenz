# Appendix

## Key References

- **Architecture Document**: `docs/profile-integration-architecture.md` (Winston, 2025-10-07)
- **Backend API**: Fully implemented, no changes required
- **Shared Types Package**: `@monolenz/types` (Zod validation schemas)
- **Existing Hook**: `apps/web/lib/hooks/useProfile.ts` (optimistic updates)

## Development Notes

- **Component Deletion**: Old placeholder components (`ProfileHeader`, `ProfileAvatar`, `ProfileBasicInfo`, `ProfileCompleteness`) will be deleted AFTER new components are fully tested (Story 1.4 completion)
- **API Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: Automatic via Supabase client + `createBrowserApiClient()` wrapper
- **Validation**: Shared Zod schemas ensure consistency between frontend and backend

---

**END OF PRD**

