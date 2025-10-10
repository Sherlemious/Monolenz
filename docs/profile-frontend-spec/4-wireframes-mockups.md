# 4. Wireframes & Mockups

## 4.1 Primary Design Files

**Recommended Design Tool:** Figma (shareable, supports component libraries, real-time collaboration)

**File Structure:**
```
Athaar Profile Management UI
├── 📄 Page: Onboarding Flow (4 frames)
├── 📄 Page: Profile View States (3 frames: empty, partial, complete)
├── 📄 Page: Edit Experience (sheet + dialog)
├── 📄 Page: Mobile Adaptations
└── 🎨 Components: Profile UI Kit (shared components)
```

**Design File Link:** *[To be created - placeholder for Figma project link]*

---

## 4.2 Key Screen Layouts

### Screen 1: Empty Profile State

**Purpose:** Welcome new users and guide them to create their first profile

**Key Elements:**
- Hero section with welcome heading and descriptive subtext
- Benefits list with icon + text cards
- Primary CTA: "Create Your Profile" button
- Empty state illustration

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│        [Dashboard Header/Nav]           │
├─────────────────────────────────────────┤
│                                         │
│          [Empty State Icon]             │
│                                         │
│        Welcome to Your Profile          │
│                                         │
│    Your profile helps others discover   │
│      and connect with you on Athaar     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎯 Stand out with a complete   │   │
│  │     professional profile        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  🔗 Share your work and         │   │
│  │     social links                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  📊 Track your profile          │   │
│  │     completeness                │   │
│  └─────────────────────────────────┘   │
│                                         │
│      [ Create Your Profile ]            │
│                                         │
└─────────────────────────────────────────┘
```

---

### Screen 2: Onboarding Wizard - Step 1 (Username)

**Purpose:** Focused username selection as first critical step

**Key Elements:**
- Progress indicator (Step 1 of 4)
- Username input with validation
- Character counter (0/50)
- Format hint text
- Next button (disabled until valid)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│        [Dashboard Header/Nav]           │
├─────────────────────────────────────────┤
│                                         │
│   Step 1 of 4    ●────○────○────○      │
│                                         │
│        Choose Your Username             │
│                                         │
│   This will be your unique identifier   │
│   on Athaar. Choose wisely - it can be  │
│   changed later.                        │
│                                         │
│   Username *                            │
│   ┌─────────────────────────────────┐  │
│   │ e.g., john_developer        [✓] │  │
│   └─────────────────────────────────┘  │
│                               15/50     │
│   3-50 characters: letters, numbers,    │
│   underscores, and hyphens only         │
│                                         │
│                                         │
│                                         │
│                  [ Next: Basic Info ]   │
│                                         │
└─────────────────────────────────────────┘
```

---

### Screen 3: Profile View - Complete Profile

**Purpose:** Display user's profile with all information and completeness indicator

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│        [Dashboard Header/Nav]           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  [Avatar]                        │  │
│  │            john_developer  [Edit]│  │
│  │                                  │  │
│  │  Passionate developer building   │  │
│  │  amazing web experiences with    │  │
│  │  React and TypeScript            │  │
│  │                                  │  │
│  │  [in] [gh] [🌐]                 │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Profile Completeness                   │
│  ┌──────────────────────────────────┐  │
│  │ ████████████████████████░░ 83%   │  │
│  │                                  │  │
│  │ ✓ Username                       │  │
│  │ ✓ Bio                            │  │
│  │ ✓ Profile Picture                │  │
│  │ ✓ LinkedIn                       │  │
│  │ ✓ GitHub                         │  │
│  │ ✗ Portfolio  → Add to complete   │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

### Screen 4: Edit Profile Sheet (Modal)

**Purpose:** Focused editing experience as overlay

**Layout Structure (Desktop):**
```
┌────────────────┬────────────────────────┐
│                │ Edit Profile        [X]│
│                ├────────────────────────┤
│                │                        │
│  Profile View  │ Username *             │
│  (Dimmed)      │ ┌────────────────────┐ │
│                │ │ john_developer     │ │
│                │ └────────────────────┘ │
│                │                  14/50 │
│                │                        │
│                │ Bio                    │
│                │ ┌────────────────────┐ │
│                │ │ Passionate...      │ │
│                │ │                    │ │
│                │ └────────────────────┘ │
│                │                 120/500│
│                │                        │
│                │ [... more fields ...]  │
│                │                        │
│                ├────────────────────────┤
│                │ [ Cancel ] [ Save ]    │
└────────────────┴────────────────────────┘
```

---

### Screen 5: Username Change Confirmation Dialog

**Purpose:** Protect users from unintended username changes

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │           ⚠️                      │  │
│  │                                   │  │
│  │     Confirm Username Change       │  │
│  │                                   │  │
│  │  Changing your username from      │  │
│  │  'john_developer' to 'johndoe'    │  │
│  │  may affect your profile URL and  │  │
│  │  how others find you. This action │  │
│  │  cannot be easily undone.         │  │
│  │                                   │  │
│  │  Are you sure you want to         │  │
│  │  continue?                        │  │
│  │                                   │  │
│  │  [ Cancel ] [ Yes, Change ]       │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

