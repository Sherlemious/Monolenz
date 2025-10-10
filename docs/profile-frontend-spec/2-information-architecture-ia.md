# 2. Information Architecture (IA)

## 2.1 Site Map / Screen Inventory

```mermaid
graph TD
    A[Authenticated App] --> B[Profile Page /profile]
    
    B --> B1{Profile State}
    B1 -->|No Profile| C[Empty State View]
    B1 -->|Profile Exists| D[Profile View Mode]
    
    C --> E[Onboarding Wizard]
    E --> E1[Step 1: Username]
    E --> E2[Step 2: Basic Info]
    E --> E3[Step 3: Social Links]
    E --> E4[Step 4: Review]
    E4 --> D
    
    D --> F[Edit Profile Sheet]
    F --> G{Username Changed?}
    G -->|Yes| H[Username Confirmation Dialog]
    G -->|No| I[Save & Update]
    H -->|Confirm| I
    H -->|Cancel| F
    I --> D
    
    D --> J[Completeness Indicator]
    D --> K[Profile Display Card]
    
    style B fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fce4ec
    style H fill:#ffebee
```

---

## 2.2 Navigation Structure

**Primary Navigation:**  
Profile management lives within the `(app)` authenticated route group. Users access `/profile` from the existing dashboard navigation/header. The profile page is a destination, not a hub - users come here with clear intent (view/edit profile).

**Secondary Navigation:**  
Within the profile page, navigation is task-based rather than hierarchical:
- Empty state → "Create Your Profile" CTA
- Profile view → "Edit Profile" button
- Onboarding wizard → Step-based progression (Back/Next buttons with visual step indicator "Step 2 of 4")
- Edit sheet → Modal overlay (no navigation, just Save/Cancel actions)

**Breadcrumb Strategy:**  
Not required for profile management. The page is a single-level destination within the authenticated app. Users can return to dashboard via existing header navigation. Breadcrumbs would add visual noise without functional benefit.

---

