// Challenge content. All data is fictional. Add a challenge by appending an object to `challenges`.
// Answers live in client-side code, so this is for self-study, not formal assessment.
import { textToBase64 } from '../lib/crypto'
import type { ReportDraft } from '../lib/store'

export type Question =
  | { id: string; type: 'text' | 'number'; label: string; hint?: string; answers: string[]; explanation: string }
  | { id: string; type: 'choice'; label: string; options: string[]; answer: number; explanation: string }

export interface Challenge {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate'
  minutes: number
  topic: string
  objective: string
  scenario: string[]
  data: { label: string; value: string; code?: boolean }[]
  questions: Question[]
  hints: [string, string]
  solution: string[]
  lab?: { tab: string; label: string }
  /** Prefills the report form when the learner chooses "Write a Finding". */
  finding?: Partial<ReportDraft>
  /** Report-style challenge: completed by checklist and self-review instead of answer checking. */
  selfReview?: string[]
}

export const FILE_ORIGINAL = 'CryptoShield Tools v1.2.0 | installer build 4471 | publisher: Example Labs (fictional)'
export const FILE_SUPPLIED = 'CryptoShield Tools v1.2.0 | installer build 4417 | publisher: Example Labs (fictional)'
export const FILE_TRUSTED_DIGEST = '2157820c1890bfc4692d93885cc023ea7b4aef01dcf694015c6142cb6611167d'

const BASE64_SECRET = 'FICTIONAL staging API token: demo-token-12345'

export const challenges: Challenge[] = [
  {
    id: 'decode-the-shift',
    title: 'Decode the Shift',
    difficulty: 'Beginner',
    minutes: 5,
    topic: 'Vulnerability Assessment',
    objective: 'Break a Caesar cipher by finding its shift.',
    scenario: [
      'During a practice assessment you find a note in a fictional application\'s configuration. The developer says it is "encrypted". It looks like a simple letter shift.',
    ],
    data: [{ label: 'Ciphertext', value: 'KHOOR ZRUOG', code: true }],
    questions: [
      { id: 'shift', type: 'number', label: 'What shift was used to encrypt it? (0–25)', answers: ['3'], explanation: 'Each letter was moved 3 places forward, so moving 3 places back reveals the message.' },
      { id: 'plain', type: 'text', label: 'What is the plaintext?', answers: ['HELLO WORLD'], explanation: 'K→H, H→E, O→L, O→L, R→O, then Z→W, R→O, U→R, O→L, G→D.' },
    ],
    hints: [
      'There are only 26 possible shifts. The lab has a "Show All 26 Shifts" button.',
      'Look for the row that reads as English. The repeated OO in KHOOR is a double letter in the plaintext.',
    ],
    solution: [
      'Trying every shift shows that shift 3 gives readable text: HELLO WORLD.',
      'Because all 26 keys can be tried in seconds, the Caesar cipher provides no real protection. A finding would describe this as obfuscation, not encryption.',
    ],
    lab: { tab: 'caesar', label: 'Open the Caesar lab' },
  },
  {
    id: 'follow-the-keyword',
    title: 'Follow the Keyword',
    difficulty: 'Beginner',
    minutes: 6,
    topic: 'Risk Identification',
    objective: 'Decrypt a Vigenère message and explain how the keyword repeats.',
    scenario: ['A fictional team shares a message using a keyword cipher. You have been given both the ciphertext and the keyword.'],
    data: [
      { label: 'Ciphertext', value: 'LXFOPVEFRNHR', code: true },
      { label: 'Keyword', value: 'LEMON', code: true },
    ],
    questions: [
      { id: 'plain', type: 'text', label: 'What is the plaintext?', answers: ['ATTACKATDAWN', 'ATTACK AT DAWN'], explanation: 'Each ciphertext letter is shifted back by its keyword letter: L−L=A, X−E=T, F−M=T, O−O=A, P−N=C, and so on.' },
      {
        id: 'repeat',
        type: 'choice',
        label: 'The message has 12 letters but the keyword has 5. Which keyword letters are used?',
        options: ['LEMON, then nothing', 'LEMONLEMONLE: the keyword repeats', 'LEMONNOMELLE: the keyword reverses', 'LLLLLLLLLLLL: only the first letter'],
        answer: 1,
        explanation: 'The keyword repeats from the start until every letter has a shift.',
      },
    ],
    hints: [
      'Use the Vigenère lab with the Decrypt action. The step table shows which keyword letter is used for each position.',
      'Positions 1, 6 and 11 all use the keyword letter L. That repetition is the weakness.',
    ],
    solution: [
      'Decrypting LXFOPVEFRNHR with LEMON gives ATTACKATDAWN. The keyword stream is LEMONLEMONLE.',
      'Because the keyword repeats every 5 letters, positions 1, 6, 11 share one shift, positions 2, 7, 12 share another, and so on. Each group is just a Caesar cipher, which is why repeated-key Vigenère is not suitable for modern security.',
    ],
    lab: { tab: 'vigenere', label: 'Open the Vigenère lab' },
  },
  {
    id: 'encoding-is-not-protection',
    title: 'Encoding Is Not Protection',
    difficulty: 'Beginner',
    minutes: 6,
    topic: 'Sensitive Data Protection',
    objective: 'Show that Base64 can be reversed by anyone, and explain why it gives no secrecy.',
    scenario: [
      'A fictional web application returns a field called "protected_value" in a public API response. A developer comment says the value is "secured with Base64".',
    ],
    data: [{ label: 'protected_value', value: textToBase64(BASE64_SECRET), code: true }],
    questions: [
      { id: 'decoded', type: 'text', label: 'What is the decoded text?', hint: 'Paste the full decoded text.', answers: [BASE64_SECRET], explanation: 'Decoding needed no key and no password.' },
      {
        id: 'why',
        type: 'choice',
        label: 'Why does Base64 provide no secrecy?',
        options: [
          'Its key is too short',
          'It is an encoding with no key: anyone can reverse it',
          'It is an old encryption algorithm',
          'It only fails when the data is short',
        ],
        answer: 1,
        explanation: 'Base64 only changes how bytes are represented. There is no secret involved, so there is nothing to protect the data.',
      },
    ],
    hints: ['Open the Base64 lab, paste the value, and choose Decode.', 'Ask yourself: what secret did you need in order to decode it?'],
    solution: [
      `The value decodes to "${BASE64_SECRET}".`,
      'Base64 is an encoding, not encryption. A real fix would be to stop sending the token to clients that do not need it, and to protect it with access control and, where it must be stored, real encryption with a managed key.',
    ],
    lab: { tab: 'base64', label: 'Open the Base64 lab' },
    finding: {
      title: 'Sensitive token exposed with Base64 encoding only',
      component: 'Public API response field "protected_value" (fictional application)',
      evidence: 'The field "protected_value" was decoded with a standard Base64 decoder and no key. It contains a fictional staging API token.',
    },
  },
  {
    id: 'safe-password-storage',
    title: 'Choose Safe Password Storage',
    difficulty: 'Intermediate',
    minutes: 7,
    topic: 'Authentication and Authorization',
    objective: 'Compare four ways of storing passwords and justify the best choice.',
    scenario: [
      'A fictional team is designing the "users" table for a new application. Four options are proposed. Assume an attacker might one day copy the database.',
    ],
    data: [
      { label: 'Option A', value: 'Store the password as typed (plaintext).' },
      { label: 'Option B', value: 'Store the password encoded with Base64.' },
      { label: 'Option C', value: 'Store a plain SHA-256 hash of the password.' },
      { label: 'Option D', value: 'Store an Argon2id hash with a unique random salt for each user.' },
    ],
    questions: [
      { id: 'best', type: 'choice', label: 'Which option is the best choice?', options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: 3, explanation: 'Argon2id is a dedicated password-hashing function, and a unique salt makes every stored hash different.' },
      {
        id: 'reason',
        type: 'choice',
        label: 'Why is it better than plain SHA-256?',
        options: [
          'SHA-256 digests can be decrypted with a key',
          'SHA-256 is fast, so stolen hashes can be guessed at very high speed; Argon2id is deliberately slow and memory-hard',
          'Argon2id output is shorter and saves storage',
          'SHA-256 cannot hash long passwords',
        ],
        answer: 1,
        explanation: 'Fast general-purpose hashes help attackers test guesses. Password hashing should make each guess costly, and salts stop precomputed tables and reveal no shared passwords.',
      },
    ],
    hints: [
      'Two of the options can be reversed directly. Rule those out first.',
      'For the remaining two, think about how many password guesses per second an attacker could test against a stolen database.',
    ],
    solution: [
      'Option D is best. Plaintext (A) and Base64 (B) expose every password immediately.',
      'Plain SHA-256 (C) is one-way, but it is designed to be fast and unsalted hashes are identical for identical passwords. An attacker can test enormous numbers of guesses and use precomputed tables.',
      'Argon2id is tunable to be slow and memory-hard, and a per-user salt (which is stored openly, and is not a key) makes each hash unique.',
    ],
    finding: {
      title: 'Passwords stored with a fast, unsalted hash',
      component: 'User account storage, "users" table (fictional application)',
    },
  },
  {
    id: 'exposed-secret-key',
    title: 'The Exposed Secret Key',
    difficulty: 'Intermediate',
    minutes: 8,
    topic: 'Application Security',
    objective: 'Recognise a server secret in client-delivered code and choose a fix that fits the architecture.',
    scenario: [
      'ShopLite is a fictional single-page web shop. It already has its own backend server, which the browser calls for the product list. You review the JavaScript that is delivered to every visitor.',
    ],
    data: [
      {
        label: 'checkout.js (sent to every browser)',
        code: true,
        value:
          'const PAYMENT_API_SECRET = "sk_demo_FICTIONAL_4f9a2c";\n\nasync function charge(cart) {\n  return fetch("https://payments.example/charge", {\n    method: "POST",\n    headers: { Authorization: "Bearer " + PAYMENT_API_SECRET },\n    body: JSON.stringify(cart),\n  });\n}',
      },
    ],
    questions: [
      {
        id: 'exposure',
        type: 'choice',
        label: 'What is the security problem?',
        options: [
          'The function is asynchronous',
          'A shared server secret is hardcoded in code that every visitor can read',
          'The request uses the POST method',
          'The cart is sent as JSON',
        ],
        answer: 1,
        explanation: 'Anyone can open the browser developer tools, read the secret, and call the payment API as the shop.',
      },
      {
        id: 'fix',
        type: 'choice',
        label: 'Which remediation suits this architecture?',
        options: [
          'Move the secret into a frontend build-time environment variable',
          'Encode the secret with Base64 before using it',
          'Minify and obfuscate checkout.js',
          'Rotate the secret, keep it only on the backend, and have the browser call a backend endpoint that validates the request and then calls the payment API',
        ],
        answer: 3,
        explanation: 'The secret must never reach the browser. The backend holds it, checks each request, and makes the payment call itself.',
      },
    ],
    hints: [
      'Who receives checkout.js? What can they do with everything inside it?',
      'Frontend environment variables are copied into the built JavaScript. Ask where a value must live so that visitors never receive it.',
    ],
    solution: [
      'The payment API secret is delivered to every browser. A server secret cannot remain secret if it is distributed to every visitor, however it is packaged.',
      'Build-time environment variables, Base64 and obfuscation all still ship the secret to the client. The existing secret must be treated as compromised and rotated (replaced).',
      'The fix is to keep the new secret in server-side configuration or a secret store, add a backend endpoint that validates the cart and the user, and let only the backend call the payment API.',
    ],
    finding: {
      title: 'Payment API secret hardcoded in client-side JavaScript',
      component: 'checkout.js, delivered to all visitors (fictional ShopLite application)',
      evidence: 'checkout.js contains the constant PAYMENT_API_SECRET and sends it in the Authorization header from the browser. (Do not copy secret values into a real report.)',
    },
  },
  {
    id: 'has-the-file-changed',
    title: 'Has the File Changed?',
    difficulty: 'Beginner',
    minutes: 6,
    topic: 'Log Analysis',
    objective: 'Verify a file against a trusted SHA-256 digest and explain what the result does and does not prove.',
    scenario: [
      'A fictional publisher lists the expected SHA-256 digest of a small release file on its official, trusted page. You received a copy of the file from a colleague by chat. Check whether your copy matches.',
    ],
    data: [
      { label: 'Contents of the file you received (one line, no line break at the end)', value: FILE_SUPPLIED, code: true },
      { label: 'Trusted expected SHA-256 digest', value: FILE_TRUSTED_DIGEST, code: true },
    ],
    questions: [
      { id: 'match', type: 'choice', label: 'Does your copy match the trusted digest?', options: ['Match', 'Does Not Match'], answer: 1, explanation: 'The computed digest is different, so this copy is not identical to the published file.' },
      {
        id: 'limit',
        type: 'choice',
        label: 'If the digests had matched, what would that prove?',
        options: [
          'Who created the file',
          'That the file contains no malware',
          'That your copy is identical to the file the trusted digest describes',
          'That the file is encrypted',
        ],
        answer: 2,
        explanation: 'A hash detects differences against a trusted reference. A hash alone does not prove who created the file.',
      },
    ],
    hints: [
      'Copy the file contents into the SHA-256 lab, hash it, and paste the trusted digest into the "Expected digest" field.',
      'Even a single changed character produces a completely different digest. You do not need to find the change to answer.',
    ],
    solution: [
      'The received copy says "build 4417" while the published file says "build 4471". Two swapped digits give a completely different SHA-256 digest, so the result is Does Not Match.',
      'Limits: the check only works because the expected digest came from a trusted source. If an attacker could change both the file and the digest, the check would pass. A hash also does not identify the author; that needs a digital signature.',
    ],
    lab: { tab: 'sha256', label: 'Open the SHA-256 lab' },
  },
  {
    id: 'detect-tampered-message',
    title: 'Detect the Tampered Message',
    difficulty: 'Intermediate',
    minutes: 8,
    topic: 'Application Security',
    objective: 'Observe how AES-GCM reacts when encrypted data is modified.',
    scenario: [
      'In the AES-GCM lab, generate a key, encrypt any short message, and then use "Tamper with a Copy". The lab changes one ciphertext byte in a copy of your payload and tries to decrypt it with the correct key.',
    ],
    data: [],
    questions: [
      {
        id: 'what',
        type: 'choice',
        label: 'What happens when the tampered copy is decrypted?',
        options: [
          'The plaintext appears with one wrong character',
          'Decryption fails and no plaintext is shown',
          'The plaintext appears with a warning',
          'A new key is generated automatically',
        ],
        answer: 1,
        explanation: 'The lab reports a decryption failure and shows no plaintext at all.',
      },
      {
        id: 'why',
        type: 'choice',
        label: 'Why does this happen?',
        options: [
          'The IV was reused',
          'The key expired',
          'The authentication tag no longer matches the ciphertext, so the data is rejected',
          'Base64 cannot represent the changed byte',
        ],
        answer: 2,
        explanation: 'AES-GCM checks the authentication tag before releasing plaintext. Modified data fails that check.',
      },
    ],
    hints: [
      'Run the experiment in the lab first, then answer from what you observed.',
      'AES-GCM produces a tag along with the ciphertext. Think about what the tag is checked against.',
    ],
    solution: [
      'Authentication fails and the plaintext is not accepted. AES-GCM verifies the 128-bit authentication tag using the shared key before returning anything.',
      'The same error appears for a wrong key, so the message cannot tell you which cause occurred. And the tag shows the data came from a holder of the shared key; it does not prove a specific real-world identity.',
    ],
    lab: { tab: 'aes', label: 'Open the AES-GCM lab' },
  },
  {
    id: 'write-the-finding',
    title: 'Write the Security Finding',
    difficulty: 'Intermediate',
    minutes: 15,
    topic: 'Security Reporting',
    objective: 'Write a structured finding whose severity is justified by the scenario.',
    scenario: [
      'NoteNest is a fictional note-taking web application. During a review you learn that the text of every note is stored in plaintext in the "notes" database table.',
      'Read the exposure conditions below. Then write a finding. Your severity rating should follow from these conditions, not only from the fact that encryption is missing.',
    ],
    data: [
      { label: 'Data sensitivity', value: 'Users often store personal reminders, and some store health details and recovery codes.' },
      { label: 'Database access', value: 'The database accepts connections from the internal network only. Three administrators have direct access.' },
      { label: 'Backups', value: 'A nightly backup of the full database is copied, unencrypted, to a storage bucket that all 40 staff accounts can read.' },
      { label: 'Support dashboard', value: 'Any support agent can open any user\'s notes in full. Views are not logged.' },
      { label: 'Known incidents', value: 'There is no evidence that anyone has misused this access.' },
    ],
    questions: [],
    hints: [
      'Start with who can read the notes today, and whether they need to. List each path: database, backups, support dashboard.',
      'For severity, weigh the sensitivity of the notes and the number of people with access against the fact that access is internal and no misuse is known.',
    ],
    solution: [],
    finding: {
      title: 'Sensitive notes stored in plaintext',
      component: 'NoteNest "notes" table, nightly backups, and support dashboard (fictional application)',
      steps: '1. Open the "Write the Security Finding" challenge.\n2. Read the scenario and the exposure conditions.\n3. ',
    },
    selfReview: [
      'My evidence states what was observed, without guessing.',
      'My impact section names who could read the notes and under which conditions.',
      'My severity justification uses the exposure conditions (backups, support access, internal-only database), not just "no encryption".',
      'My remediation is specific, and it covers access control as well as encryption.',
      'I compared my report with the sample report and noted any differences.',
    ],
  },
]

/** The single example report shown on the Reports page and used as the model answer for the last challenge. */
export const sampleReport: ReportDraft = {
  title: 'Sensitive notes stored in plaintext and readable by all staff',
  component: 'NoteNest "notes" table, nightly backups, and support dashboard (fictional application)',
  summary:
    'NoteNest stores the text of every note in plaintext. Because unencrypted backups are readable by all 40 staff accounts and the support dashboard shows any note to any agent without logging, far more people can read user notes than need to.',
  evidence:
    'The scenario states that note text is stored in plaintext in the "notes" table; that a nightly, unencrypted full backup is copied to a bucket readable by all 40 staff accounts; and that any support agent can open any user\'s notes with no view logging. No misuse has been observed.',
  steps:
    '1. Open the "Write the Security Finding" challenge.\n2. Read the "Backups" condition: all staff accounts can read the unencrypted backup.\n3. Read the "Support dashboard" condition: any agent can view any note, and views are not logged.\n4. Note that the "notes" table holds plaintext, so both paths expose readable note text.',
  impact:
    'Any of 40 staff accounts, or an attacker who takes over one of them, could read every user\'s notes, including health details and recovery codes. Recovery codes could be used to take over other accounts. Because views are not logged, misuse could go unnoticed.',
  severity: 'High',
  justification:
    'The data is sensitive and the readable audience is broad (all staff), with no logging to detect misuse. It is not rated Critical because access is limited to internal accounts, the database is not reachable from the internet, and there is no evidence of misuse. If backups were restricted to the three administrators and support views were logged, Medium would be reasonable.',
  remediation:
    '1. Restrict the backup bucket to the accounts that need it (least privilege) and encrypt backups.\n2. Encrypt note text with authenticated encryption such as AES-GCM, with keys held in a key management service that backup readers and support agents cannot use.\n3. Limit the support dashboard to notes a user has explicitly shared, and log every view (without logging note contents).\n4. Remember that encryption does not replace authorization: keep access checks on every path.',
  verification:
    '1. Confirm that a normal staff account can no longer read the backup bucket.\n2. Inspect a new backup and the "notes" table and confirm note text is not readable.\n3. Confirm that a support agent cannot open an unshared note, and that an allowed view creates a log entry without note contents.',
}
