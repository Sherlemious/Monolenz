## 2026-02-14 - Inconsistent Privacy Filters in Search
**Vulnerability:** The `searchProfiles` endpoint returned raw database entities including private fields (`linkedin_url`, `github_url`) because it directly returned the result of `findMany`.
**Learning:** List/Search endpoints often bypass service-level privacy filters applied in detail endpoints (`getProfileByIdentifier`), leading to data leaks.
**Prevention:** Always ensure list endpoints iterate over results and apply the same privacy/transform logic as detail endpoints. Use a shared DTO transformation method.
