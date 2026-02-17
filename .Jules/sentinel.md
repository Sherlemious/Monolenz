## 2026-02-16 - IDOR in Profile Block Versions
**Vulnerability:** Block versions could be accessed via `GET /api/v1/profiles/:identifier/versions/:versionId/blocks` by knowing the `versionId`, ignoring the `identifier`.
**Learning:** Services often trust that the resource ID (versionId) implies ownership or context, but when URLs imply hierarchy (`/profiles/:id/versions/:id`), the relationship must be explicitly validated.
**Prevention:** Always validate that child resources (versions) belong to the parent resource (profile) specified in the URL or context, especially in hierarchical routes.
