# CI/CD Pipeline Flow Diagrams

This document contains visual flow diagrams for the Athaar CI/CD pipeline based on the comprehensive analysis.

## Table of Contents

1. [Overall Pipeline Overview](#overall-pipeline-overview)
2. [CI Workflow (Build & Test)](#ci-workflow-build--test)
3. [Staging Deployment (Blue/Green)](#staging-deployment-bluegreen)
4. [Production Deployment (Blue/Green)](#production-deployment-bluegreen)
5. [Rollback Process](#rollback-process)
6. [Scheduled Jobs](#scheduled-jobs)

---

## Overall Pipeline Overview

```mermaid
graph TB
    Start([Code Change]) --> Trigger{Event Type}

    Trigger -->|Push to dev<br/>PR to dev/main| CI[CI: Build & Test]
    Trigger -->|Push to stage| Staging[Deploy to Staging]
    Trigger -->|Push to main| Production[Deploy to Production]
    Trigger -->|Daily Schedule<br/>Manual| Audit[Security Audit]
    Trigger -->|All Pushes/PRs| Format[Code Formatting]

    CI --> PathFilter{Path Filter<br/>dorny/paths-filter}
    PathFilter -->|apps/web changed| WebCI[Build Web]
    PathFilter -->|apps/api changed| APICI[Build API]
    PathFilter -->|Both changed| BothCI[Build Both]

    WebCI --> WebTests[Lint, Type-Check, Build, Docker]
    APICI --> APITests[Lint, Type-Check, Build, Docker]
    BothCI --> WebTests
    BothCI --> APITests

    WebTests --> CICache[Cache Artifacts]
    APITests --> CICache
    CICache --> CIResult{All Pass?}
    CIResult -->|Yes| MergeOK[✅ Ready to Merge]
    CIResult -->|No| CIFail[❌ CI Failed]

    Staging --> StagingBG[Blue/Green Deployment]
    Production --> ProdBG[Blue/Green Deployment]

    Audit --> AuditResult{Audit Results}
    AuditResult -->|High Severity| AuditFail[❌ Blocking]
    AuditResult -->|Low/Medium| AuditPass[✅ Informational]

    Format --> FormatResult{Formatting OK?}
    FormatResult -->|No| FormatFail[❌ Auto-fix Required]
    FormatResult -->|Yes| FormatPass[✅ Pass]

    style CI fill:#e1f5ff
    style Staging fill:#fff4e1
    style Production fill:#ffe1e1
    style CIFail fill:#ffcccc
    style AuditFail fill:#ffcccc
    style FormatFail fill:#ffcccc
    style MergeOK fill:#ccffcc
```

---

## CI Workflow (Build & Test)

```mermaid
graph LR
    Start([Push to dev<br/>or PR]) --> Checkout[Checkout Code]
    Checkout --> Setup[Setup Node.js<br/>pnpm cache]

    Setup --> PathDetect{Detect Changed<br/>Paths}
    PathDetect -->|apps/web| WebMatrix[Matrix: Web Only]
    PathDetect -->|apps/api| APIMatrix[Matrix: API Only]
    PathDetect -->|Both| BothMatrix[Matrix: Both]

    WebMatrix --> WebLint[Lint]
    WebMatrix --> WebType[Type Check]
    WebMatrix --> WebBuild[Build]
    WebMatrix --> WebTest[Test<br/>⚠️ Missing Script]
    WebMatrix --> WebDocker[Docker Build]

    APIMatrix --> APILint[Lint]
    APIMatrix --> APIType[Type Check]
    APIMatrix --> APIBuild[Build]
    APIMatrix --> APITest[Test<br/>⚠️ Missing Script]
    APIMatrix --> APIDocker[Docker Build]

    BothMatrix --> WebLint
    BothMatrix --> APILint

    WebLint --> WebType
    WebType --> WebBuild
    WebBuild --> WebTest
    WebTest --> WebDocker

    APILint --> APIType
    APIType --> APIBuild
    APIBuild --> APITest
    APITest --> APIDocker

    WebDocker --> Cache[Cache Artifacts<br/>pnpm, node_modules, dist, .next]
    APIDocker --> Cache

    Cache --> Result{All Pass?}
    Result -->|Yes| Success[✅ CI Success<br/>~3-8 minutes]
    Result -->|No| Failure[❌ CI Failure<br/>Block Merge]

    style WebTest fill:#fff4e1
    style APITest fill:#fff4e1
    style Failure fill:#ffcccc
    style Success fill:#ccffcc
```

---

## Staging Deployment (Blue/Green)

```mermaid
graph TB
    Start([Push to stage]) --> Checkout[Checkout Code]
    Checkout --> Auth[Authenticate GCP]
    Auth --> PathFilter{Path Filter}

    PathFilter -->|apps/web| WebDeploy[Deploy Web]
    PathFilter -->|apps/api| APIDeploy[Deploy API]
    PathFilter -->|Both| BothDeploy[Deploy Both]

    WebDeploy --> WebBuild[Build Docker Image<br/>gcr.io/monolenz-web:$SHA<br/>--build-arg STAGING]
    APIDeploy --> APIBuild[Build Docker Image<br/>gcr.io/monolenz-api:$SHA<br/>--build-arg STAGING]

    WebBuild --> WebDeployBG[Deploy to Cloud Run<br/>--no-traffic<br/>Tag: candidate]
    APIBuild --> APIDeployBG[Deploy to Cloud Run<br/>--no-traffic<br/>Tag: candidate]

    WebDeployBG --> WebHealth[Health Check<br/>curl /health]
    APIDeployBG --> APIHealth[Health Check<br/>curl /health]

    WebHealth --> WebHealthResult{200 OK?}
    APIHealth --> APIHealthResult{200 OK?}

    WebHealthResult -->|Yes| WebSwitch[Switch 100% Traffic<br/>to New Revision]
    WebHealthResult -->|No| WebFail[❌ Deployment Failed<br/>Old Revision Still Live]

    APIHealthResult -->|Yes| APISwitch[Switch 100% Traffic<br/>to New Revision]
    APIHealthResult -->|No| APIFail[❌ Deployment Failed<br/>Old Revision Still Live]

    WebSwitch --> WebCleanup[Delete Old Revisions]
    APISwitch --> APICleanup[Delete Old Revisions]

    WebCleanup --> WebSuccess[✅ Staging Deployed]
    APICleanup --> APISuccess[✅ Staging Deployed]

    WebFail --> WebRollback[Manual Rollback Available]
    APIFail --> APIRollback[Manual Rollback Available]

    style WebFail fill:#ffcccc
    style APIFail fill:#ffcccc
    style WebSuccess fill:#ccffcc
    style APISuccess fill:#ccffcc
    style WebDeployBG fill:#e1f5ff
    style APIDeployBG fill:#e1f5ff
```

---

## Production Deployment (Blue/Green)

```mermaid
graph TB
    Start([Push to main]) --> Checkout[Checkout Code]
    Checkout --> Auth[Authenticate GCP]
    Auth --> PathFilter{Path Filter}

    PathFilter -->|apps/web| WebDeploy[Deploy Web]
    PathFilter -->|apps/api| APIDeploy[Deploy API]
    PathFilter -->|Both| BothDeploy[Deploy Both]

    WebDeploy --> WebBuild[Build Docker Image<br/>gcr.io/monolenz-web:$SHA<br/>--build-arg PRODUCTION]
    APIDeploy --> APIBuild[Build Docker Image<br/>gcr.io/monolenz-api:$SHA<br/>--build-arg PRODUCTION]

    WebBuild --> WebDeployBG[Deploy to Cloud Run<br/>--no-traffic<br/>Tag: candidate<br/>⚠️ PRODUCTION]
    APIBuild --> APIDeployBG[Deploy to Cloud Run<br/>--no-traffic<br/>Tag: candidate<br/>⚠️ PRODUCTION]

    WebDeployBG --> WebHealth[Health Check<br/>curl /health<br/>⚠️ Critical Gate]
    APIDeployBG --> APIHealth[Health Check<br/>curl /health<br/>⚠️ Critical Gate]

    WebHealth --> WebHealthResult{200 OK?}
    APIHealth --> APIHealthResult{200 OK?}

    WebHealthResult -->|Yes| WebSwitch[Switch 100% Traffic<br/>to New Revision<br/>🚀 LIVE]
    WebHealthResult -->|No| WebFail[❌ Deployment Failed<br/>Zero User Impact<br/>Old Revision Still Live]

    APIHealthResult -->|Yes| APISwitch[Switch 100% Traffic<br/>to New Revision<br/>🚀 LIVE]
    APIHealthResult -->|No| APIFail[❌ Deployment Failed<br/>Zero User Impact<br/>Old Revision Still Live]

    WebSwitch --> WebCleanup[Delete Old Revisions]
    APISwitch --> APICleanup[Delete Old Revisions]

    WebCleanup --> WebSuccess[✅ Production Deployed<br/>Users Now on New Code]
    APICleanup --> APISuccess[✅ Production Deployed<br/>Users Now on New Code]

    WebFail --> WebRollback[One-Click Rollback<br/>Available Immediately]
    APIFail --> APIRollback[One-Click Rollback<br/>Available Immediately]

    style WebFail fill:#ffcccc
    style APIFail fill:#ffcccc
    style WebSuccess fill:#ccffcc
    style APISuccess fill:#ccffcc
    style WebDeployBG fill:#ffe1e1
    style APIDeployBG fill:#ffe1e1
    style WebHealth fill:#fff4e1
    style APIHealth fill:#fff4e1
```

---

## Rollback Process

```mermaid
graph TB
    Start([Manual Trigger<br/>rollback.yml]) --> Select{Select Rollback<br/>Target}

    Select -->|Previous Revision| PrevRev[Rollback to<br/>Previous Revision]
    Select -->|Specific Tag| TagRev[Rollback to<br/>Specific Tag]
    Select -->|Revision ID| IDRev[Rollback to<br/>Revision ID]

    PrevRev --> Switch[Switch 100% Traffic<br/>to Selected Revision]
    TagRev --> Switch
    IDRev --> Switch

    Switch --> Verify[Verify Traffic<br/>Switched Successfully]
    Verify --> Success[✅ Rollback Complete<br/>Users on Previous Version]

    Success --> Monitor[Monitor Application<br/>Metrics & Logs]

    style Start fill:#fff4e1
    style Switch fill:#ffe1e1
    style Success fill:#ccffcc
    style Monitor fill:#e1f5ff
```

---

## Scheduled Jobs

```mermaid
graph LR
    Schedule([Daily Schedule<br/>0 2 * * *]) --> Audit[Security Audit<br/>pnpm audit]

    Audit --> Check{Check Results}
    Check -->|High Severity| Block[❌ Blocking<br/>Fail Pipeline]
    Check -->|Medium/Low| Warn[⚠️ Informational<br/>Log Only]
    Check -->|None| Pass[✅ No Issues]

    Manual([Manual Trigger]) --> Audit

    style Block fill:#ffcccc
    style Warn fill:#fff4e1
    style Pass fill:#ccffcc
```

---

## Key Pipeline Characteristics

### Confidence Levels

| Stage          | What We're Confident About                                                                   | What We're NOT Confident About                       |
| -------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **CI**         | ✅ Code follows linting rules<br/>✅ Code compiles (types correct)<br/>✅ Application builds | ❌ Business logic works (no unit tests)              |
| **Staging**    | ✅ Application starts up<br/>✅ Health endpoint responds                                     | ❌ Business logic works<br/>❌ Integration scenarios |
| **Production** | ✅ Application starts up<br/>✅ Health endpoint responds<br/>✅ Zero downtime deployment     | ❌ Business logic works<br/>❌ Edge cases            |

### Deployment Safety Features

- ✅ **Blue/Green Deployment**: New revision deployed with zero traffic initially
- ✅ **Health Check Gate**: Traffic only switched after successful health check
- ✅ **Automatic Rollback**: Failed deployments never receive traffic
- ✅ **One-Click Rollback**: Manual rollback workflow available
- ✅ **Zero Blast Radius**: Failed deployments have zero user impact

### Critical Gaps

- ⚠️ **Missing Unit Tests**: Test scripts not defined in package.json
- ⚠️ **No Integration Tests**: End-to-end scenarios not validated
- ⚠️ **Limited Observability**: Basic metrics only (New Relic for API, Cloud Run defaults)
- ⚠️ **No Notification System**: Failures only visible in GitHub Actions

---

## Pipeline Metrics

| Metric                  | Value         | Notes                                |
| ----------------------- | ------------- | ------------------------------------ |
| **CI Duration**         | ~3-8 minutes  | Depends on cache hits                |
| **Deployment Duration** | ~5-10 minutes | Includes build, deploy, health check |
| **Rollback Time**       | < 1 minute    | One-click rollback                   |
| **MTTR**                | Low           | Fast rollback capability             |
| **Cost per Run**        | Low           | Standard GitHub Actions minutes      |

---

## Environment Configuration

### Staging

- **Build Args**: `NEXT_PUBLIC_API_URL` (staging URL)
- **Runtime**: Cloud Run with staging secrets
- **Purpose**: Pre-production validation

### Production

- **Build Args**: `NEXT_PUBLIC_API_URL` (production URL)
- **Runtime**: Cloud Run with production secrets
- **Purpose**: Live user traffic

---

_Last Updated: Based on comprehensive pipeline analysis_
