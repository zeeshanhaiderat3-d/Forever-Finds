import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('Firestore Security Rules Hardening Verification', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesText = fs.readFileSync(rulesPath, 'utf-8');

  it('enforces global default-deny catch-all at top of ruleset', () => {
    expect(rulesText).toContain("rules_version = '2';");
    expect(rulesText).toContain('match /{document=**} {\n      allow read, write: if false;\n    }');
  });

  it('requires verified admin identity on all product, admin, and import_log writes', () => {
    expect(rulesText).toContain('request.auth.token.email_verified == true');
    expect(rulesText).toContain("request.auth.token.email == 'zeeshanhaiderat3@gmail.com'");
    expect(rulesText).toContain('exists(/databases/$(database)/documents/admins/$(request.auth.uid))');
  });

  it('enforces strict schema keys, size bounds, ID regex, and HTTP/HTTPS URL checks', () => {
    expect(rulesText).toContain('data.keys().hasAll([');
    expect(rulesText).toContain('data.keys().hasOnly([');
    expect(rulesText).toContain("id.matches('^[a-zA-Z0-9_\\\\-]+$')");
    expect(rulesText).toContain("url.matches('^https?://.+')");
    expect(rulesText).toContain('incoming().diff(existing()).affectedKeys().hasOnly([');
  });

  it('restricts public list queries to published status and blocks public reads of admin/import_logs', () => {
    expect(rulesText).toContain("allow list: if existing().status == 'published';");
    expect(rulesText).toMatch(/match \/admins\/\{adminId\}[\s\S]*allow get: if isAdmin\(\)/);
    expect(rulesText).toMatch(/match \/import_logs\/\{logId\}[\s\S]*allow get: if isAdmin\(\)/);
  });
});
