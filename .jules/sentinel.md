## 2024-05-22 - IDOR in Profile Versions
**Vulnerability:** `listBlocksForVersion` endpoint accepted `identifier` in path but completely ignored it, trusting `versionId` blindly. This allowed accessing blocks of any version (potentially drafts/private) by guessing the ID.
**Learning:** Always validate that dependent resources (Version) belong to the parent resource (Profile) specified in the URL. Do not rely on loose IDs.
**Prevention:** In nested routes (`/parent/:parentId/child/:childId`), always verify that `child.parentId === parentId`.
