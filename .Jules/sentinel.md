## 2026-02-18 - Excessive Data Exposure in BaseService
**Vulnerability:** The default `BaseService.findMany` implementation returns raw database records without applying privacy filters defined in child service classes (e.g., `ProfileService.applyPrivacyFilters`).
**Learning:** Generic CRUD implementations in base classes can bypass domain-specific security rules if not explicitly overridden.
**Prevention:** Always override `findMany` (and other read methods) in child services that handle sensitive data to apply privacy filters. Alternatively, implement a `transformResult` hook in the base class.
