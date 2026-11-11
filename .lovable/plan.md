# Filing Centre — OSB e-filing as its own module

## Where it lives

```text
Client management -> supplies debtor answers and signatures
Estate (Forms panel) -> trigger, readiness, status, deadline closed
Filing Centre (new, firm-wide) -> map, check, assemble, submit, track, learn
Document management -> stores sealed evidence packs and OSB responses
```

A new "Filing Centre" entry in the left sidebar, with three pages:
1. **Queue** (operations manager's daily screen): all filings across estates by status, rejections to triage, upcoming filing deadlines firm-wide, OSB service status, batch runs.
2. **Filing detail**: readiness score, the four check layers, status timeline, XML view (hidden unless asked), evidence pack, amendment comparison.
3. **Schema & Mapping Studio**: schema versions per form, coverage bar per form/version, unmapped mandatory elements in red, change reports. Firms see it read-only; SecureFiles admins edit.

The estate Forms panel keeps its current flow (Generate, checks, Sign) and gains "Queue for OSB filing" plus the live filing status from the Filing Centre.

## Phase 1 (build now) — correct and provable filings
- **Filing record and status flow**: Drafted, Checked, Signed, Queued, Submitted, Acknowledged, Accepted / Rejected. Each step timestamped and attributed; nothing moves backwards except via a new amendment.
- **Schema registry and mapping**: each form + version (pre-2024 and 2024 kept side by side for Forms 31, 65, 78, 79 and the EIS) maps every schema element to a SecureFiles field, with source shown (portal answer, bank data, AI extraction with verification state, trustee entry). Choice elements (person vs corporation) set from the estate record; code lists (provinces, districts, liability types) converted with low-confidence values flagged, never guessed; repeating groups (assets, creditors) built from records.
- **XML generator** that writes elements in schema order from the mapping.
- **Four-layer checks** before signing: schema structure, cross-form consistency (e.g. Form 79 liabilities match the creditor list; Form 65 vs Form 79 income), BIA rules from the existing compliance rules, package completeness (e.g. initial consumer proposal must include Forms 47 and 48). Results roll up into one "ready to file" score with plain-language issues and a "Fix" link to the right screen.
- **Sealed evidence pack** per filing: exact XML, SHA-256 fingerprint, PDF, check report, schema and rule versions, signer, timestamps, OSB response. Saved to Documents and logged to the audit trail; read-only once sealed.
- **Amendments**: amending a filed form creates a new filing marked Amended with a side-by-side diff against the filed version.
- **Filing closes the deadline**: an accepted filing marks the estate deadline met, or late with a recorded reason.
- **Office-visit export**: one ZIP of all filings and evidence packs for an estate.

## Phase 2 — submission and operations
- Submission connector to the OSB e-filing service, outage-aware queue with automatic retry and deadline-risk alerts with outage evidence.
- Batch filing (monthly Form 65s, discharge reports): prepare and review together, each XML checked individually.
- Rejection triage: capture OSB error, link to the field, plain-language explanation, assign to owner.

## Phase 3 — system level
- Schema watch: scheduled check of the OSB vendor site, new versions stored with a field-level change report and an impact simulation across open estates.
- Anonymized rejection patterns turned into new pre-submission checks for all firms; conformance test suite and report.
- Import of previously filed OSB XML to rebuild estate records (migration).

## What I need from you before real submission works
- **The OSB e-filing schemas (XSD files) and vendor guide.** These are issued to registered software vendors; I couldn't confirm they're publicly downloadable. Until they're loaded, the Mapping Studio shows each form as "schema not loaded" and XML checks say so instead of passing.
- **OSB vendor credentials / test environment access** for Phase 2. Until then, filings stop at "Signed — ready to submit" and the trustee records the OSB acknowledgement manually, as today.

## Honesty rules kept
- Nothing shows "Accepted" or "Filed" without a recorded OSB response.
- A check that can't run (missing schema, missing data) shows "Not checked", never a pass.

## Technical details
- New tables (with grants + RLS via `is_estate_staff` for estate rows; schema/mapping tables readable by staff, writable by admins via `user_roles`): `osb_schema_versions`, `osb_schema_elements`, `osb_field_mappings`, `osb_filings`, `osb_filing_events` (append-only), `osb_filing_checks`, `osb_evidence_packs` (immutable via trigger).
- `src/lib/filing/` pure modules: `mapping.ts`, `xmlBuilder.ts`, `checks/` (schema, crossForm, rules, package), `readiness.ts`, `evidencePack.ts`, `diff.ts`, with vitest tests for each rule.
- Version choice reuses `formEngine.ts` (single source); Forms panel calls the Filing Centre instead of owning filing state.
- Sidebar entry + routes `/filing`, `/filing/:id`, `/filing/studio`; replace the unused static `EFilingPage`.
- AGENTS.md rule: filing state, XML and evidence come only from `src/lib/filing`.
