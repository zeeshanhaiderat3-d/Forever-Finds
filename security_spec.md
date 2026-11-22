# Forever Finds — Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are explicitly denied (`allow read, write: if false`).
2. **Admin-Only Writes**: Only authenticated, email-verified administrators (`zeeshanhaiderat3@gmail.com` or an existing UID in `/admins/{uid}`) can create, update, or delete `/products/{productId}`, `/admins/{adminId}`, or `/import_logs/{logId}`.
3. **Public Catalog Read Safety**: Visitors may read `/products/{productId}` only when `resource.data.status == 'published'` (or if the reader is an admin), preventing blind scraping of non-published states or admin-only collections.
4. **No Self-Assigned Admin Privilege**: A non-admin user cannot create their own `/admins/{uid}` document.
5. **Strict Key & Size Boundaries**: Every write enforces `keys().hasAll(...)` and `keys().hasOnly(...)` matching `firebase-blueprint.json`, with explicit `.size()` checks on every string and regex validation on document IDs (`^[a-zA-Z0-9_\-]+$`) and URLs (`^https?://.+`).
6. **Temporal & Identity Integrity**: `createdAt` and `updatedAt` must equal `request.time` on create; `createdAt` and `importedBy` are immutable on update; `importedBy` must equal `request.auth.uid` on create.

## 2. "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Product Create**: Anonymous request creating `/products/test-1`.
2. **Non-Admin Authenticated Product Create**: Signed-in non-admin user attempting to create `/products/test-2`.
3. **Unverified Admin Email Spoof**: Signed-in user with `email == 'zeeshanhaiderat3@gmail.com'` but `email_verified == false`.
4. **Shadow Field Injection on Product**: Admin creating `/products/test-3` with an extra field `isAdminOverride: true`.
5. **Invalid Document ID Poisoning**: Admin creating `/products/bad$id/..` or a 200-character ID.
6. **JavaScript Protocol XSS URL**: Admin creating `/products/test-4` with `affiliateUrl: "javascript:alert(1)"`.
7. **Invalid Category Enum**: Admin creating `/products/test-5` with `category: "unverified-category"`.
8. **Oversized String Resource Poisoning**: Admin creating `/products/test-6` with a 5,000-character `description`.
9. **Spoofed Server Timestamp**: Admin creating `/products/test-7` with a backdated `createdAt` != `request.time`.
10. **Spoofed `importedBy` UID**: Admin creating `/products/test-8` with `importedBy: "other-uid"`.
11. **Self-Assigned Admin Escalation**: Non-admin authenticated user writing `/admins/<their_uid>` with `role: "admin"`.
12. **Public Read of Import Logs / Admin List**: Unauthenticated or non-admin user reading `/import_logs/log-1` or listing `/admins`.
