# CryptoShield Academy

A student educational website that connects cryptography with summer training in Penetration Testing and Application Security. Learners read short lessons, experiment in a browser-based crypto lab, solve guided challenges on fictional data, and write short vulnerability reports.

> This is an independent student project. It is **not** an official National Telecommunication Institute (NTI) website and is not endorsed by NTI. It is a learning tool, **not** a production-grade secure vault.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm test         # unit tests for the cryptographic functions and content data
npm run build    # type-check and build static files into dist/
npm run preview  # serve the built site locally
```

The build output in `dist/` is fully static and can be hosted on any static host. Serve it over **HTTPS** (or `localhost`): the AES-GCM and SHA-256 labs use the Web Crypto API, which browsers only expose in a secure context. In other contexts those two labs show an explanation instead of failing.

Note: the npm scripts call the tools through `node node_modules/...` instead of the usual short names, because the `&` in this folder's name breaks npm's command shims on Windows.

## What is included

| Section | Contents |
| --- | --- |
| Home | Overview, learning path, connection to the training, "Continue Learning" card once progress exists |
| Learn | 8 lessons, each with an objective, explanation, example, misconception, training connection, knowledge check, and completion button |
| Crypto Lab | Caesar, Vigenère, AES-GCM, SHA-256 (text and files up to 10 MB), Base64 |
| Challenges | 8 challenges with hints, answer checking, explanations, and solutions |
| Reports | Create, edit, preview, delete, download as Markdown, print / save as PDF, plus one example report |
| My Progress | Counts, points, badges, recommended next step, reset |
| About | Training-to-cryptography mapping, limits, OWASP references |

## Architecture

React 19 + TypeScript + Tailwind CSS 4, built with Vite. There is no backend.

```
src/
  lib/crypto.ts        All cryptographic logic (pure functions, no UI)
  lib/crypto.test.ts   Vitest checks for the verified examples and failure cases
  lib/store.ts         Progress + report persistence (localStorage) and scoring rules
  data/lessons.ts      Lesson content as structured data
  data/challenges.ts   Challenge content, answers, and the sample report
  components/ui.tsx    Shared accessible pieces: tabs, dialog, callouts, fields, copy button
  pages/               One file per page
  App.tsx              Layout, navigation, and a small hash router (#/learn/caesar)
```

**Adding content:** append an object to `lessons` or `challenges`. The pages render whatever is in those arrays. (The "of 8 / of 80" totals shown on Home and My Progress are written as text and would need updating.)

**Cryptography choices**

- AES-GCM and SHA-256 use the browser's Web Crypto API. Keys are 256-bit, every encryption gets a fresh random 12-byte IV from `crypto.getRandomValues`, and the tag is 128 bits. `Math.random` is not used anywhere.
- The encrypted payload is versioned JSON (`version`, `algorithm`, `iv`, `ciphertext`); the key is never part of it.
- A failed decryption returns no plaintext and one neutral message, because a wrong key and modified data are indistinguishable.
- Caesar and Vigenère are implemented by hand because they are the teaching subject. They are labelled as historical and insecure everywhere they appear.
- Password hashing is explained with a labelled format illustration only. No password storage is implemented.

**Privacy**

- Saved in `localStorage`: completed lesson ids, challenge statuses, and report drafts. Nothing else.
- Never saved: lab inputs, plaintext, keys, or digests. They live in page memory and disappear on refresh.
- No analytics, no network requests with user data, no logging of lab content. The Inter font is bundled, not loaded from a third party.

## Scoring

- 10 points per challenge, awarded once when solved; maximum 80. Points are derived from statuses, so repeated submissions cannot add more.
- Hints are free. Revealing a solution before solving marks the challenge "Reviewed" (no points).
- The report-writing challenge is not auto-graded. Credit requires a saved report with every field filled in, plus a self-review checklist against the sample report.

## Limitations

- **Not tamper-resistant.** Answers ship in the client code and progress sits in `localStorage`, so anyone can read the answers or edit their score. The scoring is for self-study and is not suitable for formal examinations.
- Progress is per browser and per device. There are no accounts and no sync; clearing browser data removes progress and report drafts.
- Free-text answers are matched exactly (ignoring case and extra spaces). Concept questions are multiple choice; free-text reports are never semantically graded.
- The Vigenère step table shows the first 40 letters; the SHA-256 file lab reads the whole file into memory (10 MB limit).
- English only. Light theme only, by design.
- Automated tests cover the cryptographic functions and content data. The UI flows (persistence, reports, confirmations, mobile layout, keyboard tabs) were verified manually in a browser, not with automated UI tests. Printing was checked only as far as triggering the browser's print dialog.

## Connection to the training

The project is inspired by topics from summer training at NTI. The training topics are the starting point; the cryptography is the author's extension of them, not a record of algorithms taught in the course.

| Training topic | How it appears here |
| --- | --- |
| Vulnerability Assessment | Identify insecure cryptographic practices (weak ciphers, encoding used as protection) |
| Application Security | Protect sensitive information (authenticated encryption, exposed client-side secrets) |
| Authentication | Understand password storage (Argon2id and salts versus fast hashes) |
| Cloud Security | Understand key access and least privilege |
| Log Analysis | Useful security events, integrity of evidence, and not logging secrets |
| Reporting | Document evidence, impact, and remediation |
| Security Awareness | Explain technical concepts clearly, including common misconceptions |

The lesson, practice, then written-finding format builds on the experience of producing OWASP Top 10 training material for a freelance client.

## References

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
