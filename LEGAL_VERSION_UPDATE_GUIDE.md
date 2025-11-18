# Legal Document Version Update Guide

## Overview

This guide explains how to update legal documents and automatically trigger re-acceptance from all users when documents are updated.

## Document Version System

All legal documents have version numbers based on the last update date (format: YYYY-MM-DD).

Current versions are managed in `/src/lib/legalVersions.ts`:

```typescript
export const LEGAL_DOCUMENT_VERSIONS = {
  RISK_DISCLOSURE: '2025-11-18',
  TERMS_OF_SERVICE: '2025-11-18',
  PRIVACY_POLICY: '2025-11-18'
}
```

## How to Update a Document

### Step 1: Update the Document Content

1. Navigate to the appropriate document component:
   - Risk Disclosure: `/src/components/legal/RiskDisclosureModal.tsx`
   - Terms of Service: `/src/components/legal/TermsOfService.tsx`
   - Privacy Policy: `/src/components/legal/PrivacyPolicy.tsx`

2. Update the content with your changes

### Step 2: Update the Version Number

1. Open `/src/lib/legalVersions.ts`

2. Update the appropriate version constant with today's date:

```typescript
export const LEGAL_DOCUMENT_VERSIONS = {
  RISK_DISCLOSURE: '2025-11-19',  // Updated from '2025-11-18'
  TERMS_OF_SERVICE: '2025-11-18',
  PRIVACY_POLICY: '2025-11-18'
}
```

### Step 3: Deploy

Once you deploy with the new version:

1. **All users who previously accepted the old version will see the banner again**
2. **They must scroll through and re-accept the updated document**
3. **The banner will disappear only after they accept the new version**

## What Happens When You Update a Version

### User Experience:

1. User logs in after document update
2. Red warning banner appears at bottom of screen (even if they accepted before)
3. User must click banner to open the document
4. User must scroll to 98% of the document
5. User must check both acknowledgment checkboxes
6. User clicks "Accept & Continue"
7. Banner disappears permanently (until next update)

### Technical Details:

- Old localStorage keys are automatically cleared
- New acceptance is logged with:
  - New version number
  - Timestamp
  - User agent
  - Session ID
- Audit trail maintains history of all acceptances

## Testing Document Updates Locally

To test the version update flow without changing the actual document:

1. Open browser DevTools → Console
2. Run: `localStorage.clear()`
3. Refresh the page
4. You'll see the banner as a new user would

Or to simulate a version update:

1. Change version from `'2025-11-18'` to `'2025-11-19'` in `/src/lib/legalVersions.ts`
2. Refresh the page
3. Banner will appear even if you previously accepted

## Audit Trail

All acceptances are stored in two places for legal protection:

1. **KV Storage** (persistent, user-specific):
   - Key: `risk-disclosure-acknowledgment`
   - Contains: version, timestamp, user agent, session ID

2. **Audit Log** (KV Storage, cumulative):
   - Key: `risk-disclosure-audit-log`
   - Contains: array of all historical acceptances

3. **localStorage** (fast UI updates):
   - Key: `risk_accepted_2025-11-18` (version-specific)
   - Value: `'true'`

## Best Practices

### When to Update Version Numbers:

✅ **DO update when:**
- Adding new risk disclosures
- Changing legal liability language
- Adding/removing sections
- Clarifying ambiguous terms
- Regulatory requirements change

❌ **DON'T update for:**
- Fixing typos
- Formatting changes
- Minor wording improvements (unless legally significant)

### Communication Strategy:

When updating a document:
1. Consider adding a toast notification explaining what changed
2. Log the change in your change log
3. Consider email notification for major changes
4. Document the reason for the update internally

## Monitoring Acceptance Rates

You can track how many users have accepted the new version by checking the audit logs in KV storage.

Future enhancement: Add an admin dashboard to view acceptance metrics.

## Emergency Rollback

If you need to rollback a version update:

1. Revert the version number in `/src/lib/legalVersions.ts`
2. Redeploy
3. Users who already accepted the new version will keep their acceptance
4. Users who haven't accepted will see the old version

## Questions?

For legal questions about document content, consult your attorney.
For technical questions about the version system, refer to this guide or check the code in `/src/lib/legalVersions.ts`.
