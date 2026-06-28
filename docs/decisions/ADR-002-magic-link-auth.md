# ADR-002: Passwordless Magic Link Authentication

## Status
Accepted

## Context
The project spec explicitly requires passwordless authentication. Three options were evaluated: (1) OAuth (Google/GitHub) via `next-auth`, (2) OTP codes sent by SMS/email, (3) JWT magic links sent by email. The primary constraint is that winners must provide bank account details — a high-trust action requiring identity confidence without storing passwords (which add breach risk). A secondary constraint is that this is a solo-developer project and integrating OAuth providers adds redirect URIs, OAuth app registration, and callback complexity disproportionate to the scope.

## Decision
Implement email-based magic links using JWT tokens with a 15-minute expiration. The flow: user submits email → server generates `jwt.sign({ email, type: 'magic-link' }, JWT_SECRET, { expiresIn: '15m' })` → stores the token in the `magicLinks` collection with `used: false` → sends the token as a query param in the email link → on click, server verifies JWT, checks `used === false`, marks it `used: true`, and returns a 7-day session JWT.

The `used` flag in MongoDB is the single-use enforcement mechanism; the JWT expiration is the time-bound enforcement. Both checks are required.

## Consequences

**Positive:**
- No passwords to store, hash, or rotate — eliminates credential breach risk entirely.
- Users never forget a password; friction-free for infrequent users (lottery players may log in once per draw cycle).
- OWASP-compliant: 15-minute TTL meets the authentication cheat sheet recommendation for one-time tokens.
- No third-party OAuth dependency — works with any email address without requiring users to have a Google/GitHub account.

**Negative:**
- Requires a working SMTP service (MailHog in dev, real SMTP in production); if email delivery fails, users cannot log in.
- Email accounts are a single point of compromise — if someone's email is hacked, their lottery account is too. Mitigated by the 15-minute TTL.
- Rate limiting on `/api/auth/request-magiclink` is essential (currently implemented at 3 requests/hour per email) to prevent email bombing.
