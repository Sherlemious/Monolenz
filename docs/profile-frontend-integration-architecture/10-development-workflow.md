# 10. Development Workflow

## 10.1 Story Implementation Sequence

**Phase 1: Foundation** (Stories 1.1, 1.2)
1. Empty state component
2. Onboarding wizard Step 1 (username)
3. API client `createProfile()` method

**Phase 2: Onboarding** (Story 1.3)
4. Wizard Steps 2, 3, 4
5. Form validation integration
6. Error handling for onboarding

**Phase 3: Profile View** (Story 1.4)
7. ProfileCard component
8. CompletenessIndicator component
9. ProfileView composition
10. Delete old placeholder components

**Phase 4: Editing** (Stories 1.5, 1.6)
11. ProfileEditSheet component
12. Form pre-population
13. Username change confirmation dialog
14. Optimistic update integration

**Phase 5: Polish** (Stories 1.7, 1.8)
15. Comprehensive error handling
16. Mobile responsiveness
17. Accessibility audit
18. Performance optimization

## 10.2 Testing Strategy

**Component Testing**:
```typescript
// ProfileOnboardingWizard.test.tsx
describe('ProfileOnboardingWizard', () => {
  it('validates username format', async () => {
    render(<ProfileOnboardingWizard onComplete={jest.fn()} />);
    
    const input = screen.getByLabelText('Username');
    await userEvent.type(input, 'ab');  // Too short
    await userEvent.tab();  // Trigger blur
    
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });
  
  it('advances to step 2 on valid username', async () => {
    render(<ProfileOnboardingWizard onComplete={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText('Username'), 'validuser');
    await userEvent.click(screen.getByText('Next: Basic Info'));
    
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  });
});
```

**Integration Testing**:
```typescript
// profile-page.integration.test.tsx
describe('Profile Page Integration', () => {
  it('creates profile and displays it', async () => {
    server.use(
      rest.get('/api/v1/profiles/me', (req, res, ctx) => {
        return res(ctx.status(404));  // No profile
      }),
      rest.post('/api/v1/profiles', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: mockProfile }));
      })
    );
    
    render(<ProfilePage />);
    
    // Empty state
    expect(screen.getByText('Create Your Profile')).toBeInTheDocument();
    
    // Start wizard
    await userEvent.click(screen.getByText('Create Your Profile'));
    
    // Fill wizard
    await userEvent.type(screen.getByLabelText('Username'), 'newuser');
    await userEvent.click(screen.getByText('Next: Basic Info'));
    // ... complete wizard
    
    await userEvent.click(screen.getByText('Complete Profile'));
    
    // Profile view
    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });
  });
});
```

## 10.3 Code Quality Checklist

**Before PR**:
- [ ] TypeScript: No `any` types, all props typed
- [ ] ESLint: Zero warnings
- [ ] Accessibility: Lighthouse score ≥ 95
- [ ] Component tests: All critical paths covered
- [ ] Error handling: All API errors handled
- [ ] Mobile: Tested on 375px width
- [ ] Keyboard: Tab order logical, ESC closes modals
- [ ] Screen reader: VoiceOver/NVDA tested

---

