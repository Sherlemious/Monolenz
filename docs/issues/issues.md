# Project Issues & Known Limitations

## OpenAPI Spec Generation - Automated Approach Blocked

**Status:** Blocked  
**Priority:** High  
**Created:** 2025-10-04  

### Problem

Attempted to implement automated OpenAPI specification generation from Zod schemas using `@asteasolutions/zod-to-openapi`, but encountered monorepo architecture conflicts.

### What We Tried

1. Install `@asteasolutions/zod-to-openapi` in both `packages/types` and `apps/api`
2. Extend Zod schemas with `.openapi()` metadata in `packages/types/src/validation/`
3. Create generator script in `apps/api/src/scripts/generate-openapi.ts` to produce `docs/api/openapi.yaml`

### The Issue

**Root Cause:** Multiple Zod Instances in Monorepo

```
packages/types/node_modules/zod  (Instance A)
apps/api/node_modules/zod        (Instance B)
```

- Schemas are created using Zod Instance A (in `packages/types`)
- Generator script runs with Zod Instance B (in `apps/api`)
- `zod-to-openapi` uses an internal registry to track schema metadata
- The registries are per-Zod-instance and don't communicate
- When generator tries to process imported schemas, it looks in the wrong registry

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'parent')
at $ZodRegistry.get (/node_modules/@asteasolutions/zod-to-openapi/dist/index.cjs:128:31)
```

### Why This Matters (Or Doesn't)

**Low Priority because:**
- ✅ Manual `docs/api/openapi.yaml` exists and is accurate
- ✅ Zod validation works perfectly for runtime validation (the important part)
- ✅ API is relatively stable, not changing constantly
- ✅ OpenAPI spec is primarily documentation, not critical functionality

### Possible Solutions (Future)

1. **Manual Maintenance (Current Approach)**
   - Keep `docs/api/openapi.yaml` as manually maintained documentation
   - Update when API changes
   - Simplest, no dependencies to fight

2. **Custom Generator Without zod-to-openapi**
   - Write custom script that reads Zod schemas directly
   - Generate OpenAPI by inspecting Zod schema structure
   - More complex but avoids library dependency issues

3. **Monorepo Zod Consolidation**
   - Force single Zod instance across entire monorepo
   - Complex, might break other things
   - Use pnpm workspace hoisting configuration

4. **Alternative Library**
   - Try `@anatine/zod-openapi` or similar
   - May have same monorepo issues

5. **Runtime Generation**
   - Generate OpenAPI spec at API startup from live schemas
   - Serve at `/api/openapi.json` endpoint
   - More overhead, but always fresh

### Current Workaround

Using manually maintained `docs/api/openapi.yaml` that was initially generated and verified against actual routes/controllers. Update this file when:
- New endpoints are added
- Request/response schemas change
- Validation rules change

### References

- OpenAPI Spec Location: `docs/api/openapi.yaml`
- Validation Schemas: `packages/types/src/validation/`
- API Routes: `apps/api/src/routes/v1/`
- Controllers: `apps/api/src/controllers/`

### Decision

**For now:** Manual maintenance is acceptable. Revisit automated generation if:
- API becomes highly dynamic with frequent changes
- Multiple developers need synchronized API documentation
- Client SDK generation becomes critical

