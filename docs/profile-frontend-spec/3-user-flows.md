# 3. User Flows

## 3.1 Flow 1: Profile Creation (First-Time User Onboarding)

**User Goal:** Create initial profile to establish identity on Athaar platform

**Entry Points:** 
- User navigates to `/profile` after signup/login
- API returns 404 (no profile exists)
- Empty state "Create Your Profile" CTA clicked

**Success Criteria:** 
- Profile created with valid username and saved to database
- User sees profile view with completeness indicator
- Success toast notification displayed

### Flow Diagram

```mermaid
graph TD
    Start([User visits /profile]) --> Check{Profile exists?}
    Check -->|No - 404| Empty[Show Empty State]
    Check -->|Yes| ViewFlow[Go to View Flow]
    
    Empty --> CTA[User clicks Create Your Profile]
    CTA --> Step1[Step 1: Username]
    
    Step1 --> Valid1{Username valid?}
    Valid1 -->|No| Error1[Show inline error]
    Error1 --> Step1
    Valid1 -->|Yes| Next1[Click Next]
    
    Next1 --> Step2[Step 2: Basic Info]
    Step2 --> Bio[Enter bio optional]
    Step2 --> PicURL[Enter picture URL optional]
    Step2 --> Back2{Click Back?}
    Back2 -->|Yes| Step1
    Back2 -->|No| Valid2{Valid URLs?}
    Valid2 -->|No| Error2[Show URL errors]
    Error2 --> Step2
    Valid2 -->|Yes| Next2[Click Next]
    
    Next2 --> Step3[Step 3: Social Links]
    Step3 --> Social[Enter LinkedIn/GitHub/Portfolio optional]
    Step3 --> Back3{Click Back?}
    Back3 -->|Yes| Step2
    Back3 -->|No| Valid3{Valid URLs?}
    Valid3 -->|No| Error3[Show URL errors]
    Error3 --> Step3
    Valid3 -->|Yes| Next3[Click Next]
    
    Next3 --> Step4[Step 4: Review]
    Step4 --> Preview[Show profile preview]
    Step4 --> Back4{Click Back?}
    Back4 -->|Yes| Step3
    Back4 -->|No| Complete[Click Complete Profile]
    
    Complete --> Loading[Show loading state]
    Loading --> Submit[POST /api/v1/profiles]
    Submit --> Success{API Response}
    
    Success -->|200 OK| Toast1[Show success toast]
    Toast1 --> Refetch[Refetch profile data]
    Refetch --> Done([Profile View Mode])
    
    Success -->|409 Conflict| Conflict[Username taken error]
    Conflict --> ToastErr1[Show error toast]
    ToastErr1 --> BackStep1[Return to Step 1]
    BackStep1 --> FocusUser[Focus username field]
    FocusUser --> Step1
    
    Success -->|422 Validation| ValErr[Parse field errors]
    ValErr --> HighStep[Navigate to step with error]
    HighStep --> ShowErr[Show inline errors]
    ShowErr --> Step1
    
    Success -->|401 Unauth| Auth{Email confirmed?}
    Auth -->|No| ToastEmail[Toast: Confirm your email]
    ToastEmail --> Step4
    Auth -->|Yes| Redirect[Redirect to login]
    
    Success -->|500/Network| NetErr[Show error toast with retry]
    NetErr --> Retry{User retries?}
    Retry -->|Yes| Submit
    Retry -->|No| Step4
    
    style Empty fill:#fff3e0
    style Done fill:#e8f5e9
    style Conflict fill:#ffebee
    style ValErr fill:#ffebee
    style NetErr fill:#ffebee
```

### Edge Cases & Error Handling:

- **Wizard abandonment:** User navigates away mid-flow → Wizard state resets on return (no persistence across sessions)
- **Session timeout during wizard:** Token expires before completion → Show auth error, redirect to login, lose wizard progress
- **Network interruption:** API call fails → Show retry option, maintain wizard state, don't reset form data
- **Username conflict at final step:** 409 error → Navigate back to Step 1, focus username field, preserve other entered data
- **Validation mismatch:** Backend rejects data that passed client validation → Highlight affected step in wizard, show specific errors
- **Partial form data:** User completes Step 1-2, closes browser → Next visit starts fresh wizard (no localStorage persistence in MVP)

---

## 3.2 Flow 2: Profile Viewing

**User Goal:** View complete profile information and assess completeness

**Entry Points:**
- Profile exists in database
- After successful profile creation
- After successful profile update
- Direct navigation to `/profile`

**Success Criteria:**
- All profile fields displayed correctly
- Completeness percentage calculated and shown
- Social links functional and open in new tabs
- Edit button accessible

### Flow Diagram

```mermaid
graph TD
    Start([User visits /profile]) --> Fetch[GET /api/v1/profiles/me]
    Fetch --> Loading[Show ProfileSkeleton]
    
    Loading --> Response{API Response}
    
    Response -->|200 OK| HasData{Profile has data?}
    Response -->|404| EmptyFlow[Go to Empty State Flow]
    Response -->|401| AuthErr[Redirect to login]
    Response -->|500/Network| ErrToast[Show error toast with retry]
    
    HasData -->|Complete profile| ShowFull[Display Profile Card]
    HasData -->|Partial data| ShowPartial[Display with placeholders]
    
    ShowFull --> Calc1[Calculate completeness 100%]
    ShowPartial --> Calc2[Calculate completeness %]
    
    Calc1 --> Display1[Show Profile View]
    Calc2 --> Display2[Show Profile View + encouragement]
    
    Display1 --> Actions1[Edit Profile button visible]
    Display2 --> Actions2[Edit Profile button visible]
    
    Actions1 --> Wait1([User interaction])
    Actions2 --> Wait2([User interaction])
    
    Wait1 --> EditClick1{Edit clicked?}
    Wait2 --> EditClick2{Edit clicked?}
    
    EditClick1 -->|Yes| EditFlow[Go to Edit Flow]
    EditClick2 -->|Yes| EditFlow
    
    style EmptyFlow fill:#fff3e0
    style ShowFull fill:#e8f5e9
    style ShowPartial fill:#fff9c4
    style ErrToast fill:#ffebee
```

### Edge Cases & Error Handling:

- **Empty optional fields:** Display "No bio added" placeholders in muted text (not blank/broken UI)
- **Invalid cached data:** After page load, if profile data seems stale → Provide manual refresh option
- **Broken image URLs:** Profile picture fails to load → Show default avatar placeholder, don't break layout
- **Social link domain validation:** User entered valid URL format but wrong domain → Display as-is (backend doesn't validate domains)
- **Very long bio/username:** Content exceeds typical display area → Truncate with "Read more" or ensure scrollable container
- **Completeness calculation error:** Missing fields in calculation logic → Default to showing raw data without percentage

---

## 3.3 Flow 3: Profile Editing

**User Goal:** Update profile information quickly and confidently

**Entry Points:**
- User clicks "Edit Profile" button from Profile View
- After error in previous edit attempt (sheet reopens)

**Success Criteria:**
- Changes saved successfully to database
- Optimistic UI update provides immediate feedback
- Validation errors shown inline before submission
- Sheet closes after successful save

### Flow Diagram

```mermaid
graph TD
    Start([User clicks Edit Profile]) --> OpenSheet[Open ProfileEditSheet]
    OpenSheet --> Prepop[Pre-populate all fields with current values]
    
    Prepop --> Form[User edits form fields]
    Form --> Modify{Fields modified?}
    
    Modify -->|No changes| Actions1[Only Cancel available]
    Modify -->|Changes made| Actions2[Save & Cancel available]
    
    Actions1 --> Cancel1{User clicks Cancel/X?}
    Cancel1 -->|Yes| Close1[Close sheet]
    Close1 --> View1([Return to Profile View])
    
    Actions2 --> ClientVal[Validate on blur]
    ClientVal --> ShowInline[Show inline errors if invalid]
    ShowInline --> Actions3[User corrects or proceeds]
    
    Actions3 --> SaveClick{User clicks Save?}
    SaveClick -->|No| CancelCheck{Clicks Cancel/X?}
    CancelCheck -->|Yes| Warn[Show unsaved changes warning]
    Warn --> WarnChoice{User choice?}
    WarnChoice -->|Discard| Close2[Close sheet]
    Close2 --> View2([Return to Profile View])
    WarnChoice -->|Keep editing| Actions3
    
    SaveClick -->|Yes| FinalVal[Final client validation]
    FinalVal --> ValResult{Valid?}
    ValResult -->|No| HighErr[Highlight errors in form]
    HighErr --> Actions3
    
    ValResult -->|Yes| UsernameCheck{Username changed?}
    UsernameCheck -->|No| DirectSave[Proceed to save]
    UsernameCheck -->|Yes| ConfirmDialog[Show Username Confirmation Dialog]
    
    ConfirmDialog --> DialogChoice{User choice?}
    DialogChoice -->|Cancel| BackForm[Return to edit form]
    BackForm --> Actions3
    DialogChoice -->|Confirm| DirectSave
    
    DirectSave --> Optimistic[Optimistic UI update]
    Optimistic --> CloseSheet[Close edit sheet]
    CloseSheet --> ShowNew[Show updated profile view]
    ShowNew --> API[PUT /api/v1/profiles/me]
    
    API --> APIResponse{Response}
    
    APIResponse -->|200 OK| Confirm[Confirm with server data]
    Confirm --> Success[Show success toast]
    Success --> Done([Profile View - Updated])
    
    APIResponse -->|409 Conflict| Rollback1[Rollback optimistic update]
    Rollback1 --> ConflictToast[Toast: Username taken]
    ConflictToast --> Reopen1[Reopen edit sheet]
    Reopen1 --> FocusUN[Focus username field]
    FocusUN --> ShowConflict[Show inline error]
    ShowConflict --> Actions3
    
    APIResponse -->|422 Validation| Rollback2[Rollback optimistic update]
    Rollback2 --> ParseErr[Parse field errors]
    ParseErr --> Reopen2[Reopen edit sheet]
    Reopen2 --> ShowFieldErr[Show inline errors]
    ShowFieldErr --> Actions3
    
    APIResponse -->|401| Rollback3[Rollback optimistic update]
    Rollback3 --> AuthCheck{Email confirmed?}
    AuthCheck -->|No| EmailToast[Toast: Confirm email]
    EmailToast --> View3([Return to Profile View])
    AuthCheck -->|Yes| LoginRedir[Redirect to login]
    
    APIResponse -->|500/Network| Rollback4[Rollback optimistic update]
    Rollback4 --> NetToast[Toast: Error with retry]
    NetToast --> RetryOpt{User retries?}
    RetryOpt -->|Yes| API
    RetryOpt -->|No| View4([Return to Profile View])
    
    style OpenSheet fill:#fce4ec
    style Optimistic fill:#e1f5fe
    style Done fill:#e8f5e9
    style Rollback1 fill:#ffebee
    style Rollback2 fill:#ffebee
    style Rollback3 fill:#ffebee
    style Rollback4 fill:#ffebee
```

### Edge Cases & Error Handling:

- **Mid-edit session timeout:** Token expires while form open → On save, show auth error, don't lose form data
- **Concurrent edits:** User has profile open in two tabs, edits in both → Last write wins (no conflict detection in MVP)
- **Invalid URL formats:** User enters URL without https:// → Client validation catches, shows format helper
- **Extremely long inputs:** User pastes 10,000 character bio → Character counter prevents submission
- **Whitespace-only inputs:** User enters spaces in bio → Transform to undefined, treated as empty
- **Sheet close during API call:** User closes sheet while save in progress → Allow close, continue API call, show toast on completion

---

## 3.4 Flow 4: Username Change Confirmation

**User Goal:** Safely change username with full understanding of implications

**Entry Points:**
- User modifies username field in edit form and clicks Save

**Success Criteria:**
- User makes informed decision about username change
- Canceling returns to edit form without data loss
- Confirming proceeds with save and appropriate error handling

### Flow Diagram

```mermaid
graph TD
    Start([Username changed in edit form]) --> DetectChange[System detects username change]
    DetectChange --> ShowDialog[Show Username Confirmation Dialog]
    
    ShowDialog --> Content[Display warning message with old/new usernames]
    Content --> Buttons[Show Cancel & Confirm buttons]
    
    Buttons --> UserAction{User action?}
    
    UserAction -->|ESC key| CancelFlow
    UserAction -->|Click Cancel| CancelFlow[Close dialog]
    UserAction -->|Click outside| CancelFlow
    UserAction -->|Click Confirm| ConfirmFlow[Proceed with save]
    
    CancelFlow --> Focus[Return focus to edit sheet]
    Focus --> Keep[Username field still editable]
    Keep --> Wait([User can re-edit])
    
    ConfirmFlow --> Continue[Continue to save flow]
    Continue --> API[API call with new username]
    
    API --> Result{Result}
    Result -->|Success| Done([Profile updated])
    Result -->|409 Conflict| Conflict[Username taken error]
    Conflict --> Reopen[Reopen edit sheet]
    Reopen --> ShowErr[Show error on username field]
    ShowErr --> Wait
    
    style ShowDialog fill:#fff3e0
    style ConfirmFlow fill:#e1f5fe
    style Conflict fill:#ffebee
```

### Edge Cases & Error Handling:

- **Username unchanged but whitespace differs:** Normalize before comparison, don't trigger dialog if functionally same
- **Case-only change:** "johndoe" to "JohnDoe" → Still considered a change (database is case-sensitive), show confirmation
- **Rapid dialog dismissal:** User immediately hits ESC → Allow instant dismiss, no confirmation timeout
- **Multiple username changes:** User changes, cancels, changes again → Dialog shows latest old→new comparison each time

---

