# Estate Documents: Forms built around "what do I do next"

This plan covers the estate's **Documents** section, mainly the Forms page (sections 4, 5 and 7 of your notes). The header, stage tracker, related estates and Administrators items (sections 1, 2, 3 and 6) come later, as a separate plan.

## What trustees see today
The Forms page is one flat list of 8 forms. Each form shows a status, a Passed/Blocked label, a "Parameters" button and a "Mark filed" button. Form versions aren't shown, forms aren't grouped by what needs doing, and filed copies don't link back into Documents.

## What changes

**1. Forms grouped by what to do next**
- **Due now:** forms needed at this estate's current stage, nearest deadline first.
- **Waiting on others:** forms held up by the debtor (an open portal task) or by creditors (proofs not yet received).
- **Filed:** newest first, showing who filed it, the filing status and a link to the saved copy.
- **Not applicable:** collapsed by default, with the reason each form was ruled out (for example, "Form 47 applies to consumer proposals only").

**2. Every row shows the same four things**
- The form number and plain name, plus the period it covers (for example, "Form 65 · October").
- The version and why: "Pre-2024 version, estate filed before September 16, 2024". The version is chosen from the filing date and never picked by hand.
- One status pill: Ready, Missing data (naming the field), Waiting on debtor, Waiting on creditor, Flagged, Signed, Filed, OSB accepted, or OSB rejected.
- One action that fits the status: Generate, Remind, Resolve, or Sign and file.

**3. Form detail panel** (opens when you click a row)
- The form version and why it applies.
- Where each piece of data came from: the estate record, the ledger, or the debtor's portal answers. Anything from AI extraction or bank data is marked **Unverified** until a person confirms it.
- Each check result in plain language, with a "Why" link to the rule.
- Three buttons: **Preview PDF**, **Resolve flag** and **Sign and file**. Sign and file explains why it can't proceed until every flag is fixed or acknowledged with a written reason. That reason is saved to the audit trail.
- After filing, the filed copy is saved to the estate's Documents automatically. No manual filing into folders.

**4. Documents pages tidied to match**
- **All Documents** shows each item's role: draft, signed, filed, OSB response or received.
- **Generated** is merged into Forms → Filed, so there's one place to find filed forms.

## Limits, shown honestly in the app
- **Filing with the OSB isn't connected.** "Sign and file" records the signature and filing in SecureFiles. OSB accepted/rejected stays blank, labelled "OSB response not connected", until a filing connection exists.
- **Checking the OSB's XML file format isn't available.** Its spot shows "Not available" rather than a made-up pass.
- **Stage and deadlines** come from the estate's dates already on file. If a date is missing, the form shows "Missing data: [date]" instead of guessing.

## Technical details
- New pure module `src/lib/forms/formEngine.ts`:
  - picks the version from the filing date against a 2024-09-16 cutover;
  - works out applicability by estate type, the stage from the estate's dates, the bucket, status and single next action, and the field provenance;
  - unit tests sit next to it in `__tests__`.
- Extend `FORM_CATALOGUE` with applicability, the period rule, the deadline rule and its citation.
- Saving to the database:
  - Store flag acknowledgements (form instance, flag, reason, user, time) in `estate_form_instances.validation_messages`; no new table is needed unless review shows one is required. Each acknowledgement is also logged with `logEstateEvent`.
  - On filing, write a `documents` row and link it through `estate_form_instances.document_id`.
- Rebuild `FormsTab.tsx` as grouped sections plus a side panel. Fold `GeneratedDocumentsTab` into it and drop the "Generated" page, redirecting old links to Forms.
- No existing estate or form data is changed.
- Record in `AGENTS.md`: form version, applicability and status come only from `formEngine`.
