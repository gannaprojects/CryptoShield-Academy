// Lesson content. Add a lesson by appending an object to `lessons`; the Learn page renders whatever is here.

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number // index into options
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  minutes: number
  objective: string
  explanation: string[]
  example: { title: string; text: string; code?: string }
  misconception: { myth: string; reality: string }
  training: { topic: string; text: string }
  quiz: QuizQuestion[]
  lab?: { tab: string; label: string }
  link?: { href: string; label: string }
}

export const lessons: Lesson[] = [
  {
    id: 'basics',
    title: 'Encryption, Hashing, and Encoding',
    minutes: 6,
    objective: 'Tell apart three ideas that are often confused: encryption, hashing, and encoding.',
    explanation: [
      'Encryption protects confidentiality, which means keeping information secret from people who should not read it. It turns readable data (plaintext) into unreadable data (ciphertext) using a key. Someone with the appropriate key can reverse it and get the plaintext back.',
      'Hashing turns any input into a short, fixed-size value called a digest. It is one-way: a hash function is not designed to recover the original input, and there is no key that "unhashes" a digest. Hashing is not encryption.',
      'Encoding only changes how data is represented, so that systems can store or transmit it. There is no key and no secret. Anyone can reverse it. Base64 is a common encoding, and Base64 is not encryption.',
    ],
    example: {
      title: 'The word "hello" three ways',
      text: 'The Base64 line can be reversed by anyone. The SHA-256 digest cannot be reversed, and is the same every time. The encrypted line needs the key, and looks different on every encryption.',
      code: 'Encoded (Base64):   aGVsbG8=\nHashed (SHA-256):   2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\nEncrypted (AES-GCM): random-looking bytes that only the key holder can turn back into "hello"',
    },
    misconception: {
      myth: '"We Base64-encoded the token, so it is protected."',
      reality: 'Base64 uses no key. Anyone who sees the value can decode it in seconds. Treat encoded data as if it were plain text.',
    },
    training: {
      topic: 'Sensitive Data Protection',
      text: 'Protecting sensitive data starts with choosing the right tool. This lesson extends that training topic by showing which tool gives secrecy (encryption), which gives a fingerprint (hashing), and which gives neither (encoding).',
    },
    quiz: [
      {
        question: 'A developer stores API tokens as Base64 text. What protection does that give?',
        options: ['Strong confidentiality', 'No secrecy: anyone can decode it', 'Integrity checking', 'Protection as long as the code is private'],
        answer: 1,
        explanation: 'Base64 is an encoding. It changes representation only and can be reversed without any key.',
      },
      {
        question: 'Which statement about hashing is correct?',
        options: [
          'A hash can be decrypted with the right key',
          'Hashing is a kind of encoding',
          'Hashing is one-way and is not designed to recover the input',
          'Hashing keeps data confidential in transit',
        ],
        answer: 2,
        explanation: 'A hash function has no decryption key. It produces a fixed-size digest and is not designed to be reversed.',
      },
    ],
    lab: { tab: 'base64', label: 'Try Base64 in the Lab' },
  },
  {
    id: 'caesar',
    title: 'Caesar Cipher',
    minutes: 6,
    objective: 'Encrypt and decrypt with a Caesar shift, and explain why it is easy to break.',
    explanation: [
      'The Caesar cipher replaces each letter with the letter a fixed number of places later in the alphabet. That number is the key, called the shift.',
      'Number the letters A = 0, B = 1, up to Z = 25. Encryption is E(x) = (x + k) mod 26 and decryption is D(x) = (x − k + 26) mod 26. "mod 26" means wrap around: after Z comes A again.',
      'There are only 26 possible shifts, and one of them (0) changes nothing. An attacker can simply try them all. A set of possible keys is called a key space, and this one is tiny. Caesar is a historical teaching tool, not suitable for protecting real sensitive information.',
    ],
    example: {
      title: 'Shift of 3',
      text: 'H is 7. Adding 3 gives 10, which is K. W is 22; adding 3 gives 25, which is Z. Spaces are left unchanged.',
      code: 'Plaintext:  HELLO WORLD\nShift:      3\nCiphertext: KHOOR ZRUOG',
    },
    misconception: {
      myth: '"If I keep the shift number secret, the message is safe."',
      reality: 'With only 26 shifts, trying every one takes seconds, even by hand. Secrecy of such a small key gives no real protection.',
    },
    training: {
      topic: 'Vulnerability Assessment',
      text: 'Assessing a system includes recognising weak protection when you see it. This lesson extends that skill: a tiny key space is a weakness you can identify and demonstrate.',
    },
    quiz: [
      {
        question: 'Using a shift of 3, what does the letter Y become?',
        options: ['A', 'B', 'V', 'Z'],
        answer: 1,
        explanation: 'Y is 24. (24 + 3) mod 26 = 1, which is B. The alphabet wraps around.',
      },
      {
        question: 'Why is the Caesar cipher easy to break?',
        options: ['It uses numbers', 'It only has 26 possible keys', 'It needs a computer', 'It changes the message length'],
        answer: 1,
        explanation: 'An attacker can try all 26 shifts and read the one that makes sense.',
      },
    ],
    lab: { tab: 'caesar', label: 'Try the Caesar Cipher in the Lab' },
  },
  {
    id: 'vigenere',
    title: 'Vigenère Cipher',
    minutes: 7,
    objective: 'Use a keyword to apply different shifts, and explain why a repeating key is still weak.',
    explanation: [
      'The Vigenère cipher uses a keyword instead of a single shift. Each keyword letter is a Caesar shift: A = 0, B = 1, up to Z = 25.',
      'The keyword is written under the message and repeated until it covers every letter. Each message letter is shifted by the keyword letter below it. So the same plaintext letter can become different ciphertext letters.',
      'This hides simple patterns better than Caesar. But the keyword repeats, and that repetition leaks information: letters that share a keyword position all use the same shift, and can be analysed as separate Caesar ciphers. Repeated-key Vigenère is a historical teaching tool, not appropriate for modern security.',
    ],
    example: {
      title: 'Keyword LEMON',
      text: 'The first A is shifted by L (11) and becomes L. The next T is shifted by E (4) and becomes X. After N, the keyword starts again at L.',
      code: 'Plaintext:  ATTACKATDAWN\nKeyword:    LEMONLEMONLE\nCiphertext: LXFOPVEFRNHR',
    },
    misconception: {
      myth: '"A long keyword makes Vigenère as strong as modern encryption."',
      reality: 'Any repeating keyword creates patterns that classical analysis can exploit. Modern ciphers are designed and reviewed against far stronger attacks.',
    },
    training: {
      topic: 'Risk Identification',
      text: 'Identifying risk means asking "what pattern could an attacker use?". This lesson extends that question to cryptography: repetition in a key is a risk even when the output looks random.',
    },
    quiz: [
      {
        question: 'In the example, the message has 12 letters and the keyword LEMON has 5. What happens?',
        options: ['Only 5 letters are encrypted', 'The keyword repeats: LEMONLEMONLE', 'The message is cut to 5 letters', 'The remaining letters use shift 0'],
        answer: 1,
        explanation: 'The keyword is repeated until every letter of the message has a keyword letter.',
      },
      {
        question: 'How does Vigenère differ from Caesar?',
        options: [
          'It uses a different shift for different positions',
          'It never reuses a shift',
          'It cannot be decrypted',
          'It also hides the message length',
        ],
        answer: 0,
        explanation: 'Each keyword letter is its own Caesar shift, so the shift changes from position to position, then repeats.',
      },
    ],
    lab: { tab: 'vigenere', label: 'Try the Vigenère Cipher in the Lab' },
  },
  {
    id: 'aes-gcm',
    title: 'Symmetric Encryption and AES-GCM',
    minutes: 8,
    objective: 'Describe what AES-GCM provides, and what the key, IV, and authentication tag are for.',
    explanation: [
      'Symmetric encryption uses the same secret key to encrypt and decrypt. AES is the widely used modern symmetric cipher. GCM is a way of using AES that adds a built-in tamper check.',
      'Each encryption needs an IV (initialization vector, sometimes called a nonce): a value that must be different for every message encrypted with the same key. The IV is not secret and is stored next to the ciphertext. Reusing an IV with the same key breaks the security of AES-GCM.',
      'AES-GCM also produces an authentication tag. During decryption the tag is checked first. If the ciphertext was changed, or the wrong key is used, decryption fails and no plaintext is released.',
      'This shows the data was produced by someone holding the shared key and was not modified. It does not, by itself, establish a sender\'s real-world identity: anyone with the key could have created the message.',
    ],
    example: {
      title: 'An encrypted payload',
      text: 'The payload carries the IV and the ciphertext (with the tag attached). The key is never included; it must be kept separately.',
      code: '{\n  "version": 1,\n  "algorithm": "AES-256-GCM",\n  "iv": "<12 random bytes, Base64>",\n  "ciphertext": "<encrypted bytes + 16-byte tag, Base64>"\n}',
    },
    misconception: {
      myth: '"The data is encrypted, so we do not need access checks."',
      reality: 'Encryption does not replace authorization (deciding who is allowed to do what). If the application decrypts data for any user who asks, the encryption protects nothing from that user.',
    },
    training: {
      topic: 'Application Security',
      text: 'Application security asks how sensitive data is protected at rest and in transit. This lesson extends that topic with a concrete, modern example of authenticated encryption.',
    },
    quiz: [
      {
        question: 'One byte of an AES-GCM ciphertext is changed. What happens when it is decrypted with the correct key?',
        options: [
          'One character of the plaintext is wrong',
          'Decryption fails and no plaintext is returned',
          'The plaintext is returned with a warning',
          'The key is automatically changed',
        ],
        answer: 1,
        explanation: 'The authentication tag no longer matches, so the whole decryption is rejected.',
      },
      {
        question: 'Which statement about the IV is correct?',
        options: [
          'It must be kept as secret as the key',
          'It can be reused to save space',
          'It must be unique for every encryption under the same key',
          'It proves who sent the message',
        ],
        answer: 2,
        explanation: 'The IV is public but must never repeat for the same key. This lab generates a fresh random IV every time.',
      },
    ],
    lab: { tab: 'aes', label: 'Try AES-GCM in the Lab' },
  },
  {
    id: 'passwords',
    title: 'Password Storage and Salts',
    minutes: 8,
    objective: 'Explain why passwords need a dedicated password-hashing function and what a salt does.',
    explanation: [
      'An application should never be able to read its users\' passwords. So passwords are not stored in plaintext, and not with reversible encryption either: if the key leaks, every password leaks.',
      'Passwords are stored as hashes. But general-purpose hash functions such as SHA-256 are designed to be fast, and that helps an attacker who steals the database: they can test billions of guesses per second.',
      'Dedicated password-hashing functions, such as Argon2id, are deliberately slow and memory-hungry, and their cost can be tuned. Each guess becomes expensive for the attacker while a single login stays fast enough.',
      'A salt is a random value generated for each password and stored next to the hash. It makes identical passwords produce different hashes and defeats precomputed lookup tables. A salt is not a secret and is not an encryption key.',
    ],
    example: {
      title: 'What a stored Argon2id record looks like',
      text: 'This is a format illustration, not a real hash. The record contains the algorithm, its cost settings, the salt, and the hash, so the server can verify a login later. Password-hashing libraries generate the salt and this string for you.',
      code: '$argon2id$v=19$m=19456,t=2,p=1$<random salt, Base64>$<hash, Base64>\n\nm = memory in KiB, t = iterations, p = parallelism',
    },
    misconception: {
      myth: '"The salt must be hidden, like a key."',
      reality: 'Salts are stored in the open beside the hash. Their job is uniqueness, not secrecy. The protection comes from the slow password-hashing function.',
    },
    training: {
      topic: 'Authentication and Authorization',
      text: 'Authentication depends on verifying passwords safely. This lesson extends that training topic by looking at what should be stored on the server after a user chooses a password.',
    },
    quiz: [
      {
        question: 'Which is the best way to store user passwords?',
        options: ['Encrypt them with AES', 'Hash them with plain SHA-256', 'Encode them with Base64', 'Hash them with Argon2id, with a unique salt each'],
        answer: 3,
        explanation: 'A dedicated, tunable password-hashing function with per-password salts is the recommended approach.',
      },
      {
        question: 'Why is plain SHA-256 a poor choice for passwords?',
        options: [
          'It is too slow for logins',
          'It is fast, so attackers can test guesses very quickly',
          'It can be reversed with a key',
          'Its digests are too short to store',
        ],
        answer: 1,
        explanation: 'Speed is good for file checksums but bad for password storage. Password hashing should be deliberately expensive.',
      },
    ],
  },
  {
    id: 'integrity',
    title: 'File Integrity with SHA-256',
    minutes: 6,
    objective: 'Use a SHA-256 digest to check whether a file matches a trusted reference, and state what that does not prove.',
    explanation: [
      'Integrity means data has not been changed. SHA-256 produces a 256-bit digest, usually written as 64 hexadecimal characters. Change one character of the input and the digest changes completely.',
      'To check a download, you compute its digest and compare it with the expected digest published by the source. If they differ, the file is not the one the publisher described.',
      'The comparison is only as good as the reference. The expected digest must come from a trusted source through a trusted channel. If an attacker can replace both the file and the digest shown next to it, the check passes for a malicious file.',
      'A hash alone does not prove who created a file, because anyone can compute a hash. Proving origin needs something tied to an identity, such as a digital signature. Hashing also does not encrypt a file: the contents stay readable.',
    ],
    example: {
      title: 'A well-known test value',
      text: 'The three-letter text "abc" always produces this digest. You can confirm it in the lab.',
      code: 'Input:   abc\nSHA-256: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    },
    misconception: {
      myth: '"The hash matches, so the file is safe and came from the real publisher."',
      reality: 'A match only shows the file is identical to whatever the expected digest describes. Trust depends on where that expected digest came from.',
    },
    training: {
      topic: 'Log Analysis',
      text: 'Investigations rely on evidence that has not been altered. This lesson extends that topic: digests are a common way to show that a log export or evidence file is unchanged since it was collected.',
    },
    quiz: [
      {
        question: 'Your computed digest matches the expected digest. What do you know?',
        options: [
          'Who created the file',
          'The file is free of malware',
          'The file is identical to the one the expected digest describes',
          'The file is encrypted',
        ],
        answer: 2,
        explanation: 'A match shows the content is the same as the reference. It says nothing about authorship or safety by itself.',
      },
      {
        question: 'Where should the expected digest come from?',
        options: ['Any search result', 'A trusted source, over a trusted channel', 'The file itself', 'It does not matter'],
        answer: 1,
        explanation: 'If the reference can be replaced by an attacker, the comparison is meaningless.',
      },
    ],
    lab: { tab: 'sha256', label: 'Try SHA-256 in the Lab' },
  },
  {
    id: 'keys',
    title: 'Key Management and Least Privilege',
    minutes: 7,
    objective: 'Explain why protecting keys matters more than choosing the algorithm, and apply least privilege to key access.',
    explanation: [
      'Strong encryption is only as strong as the protection of its key. Key management means how keys are created, stored, used, rotated (replaced), and retired.',
      'Keys and other secrets must not be hardcoded in source code, and must never be shipped inside code that runs in a browser or mobile app. Anything delivered to the client can be read by the user, including values placed there by a build tool.',
      'Server-side secrets belong on the server, in a dedicated secret store or key management service, and are loaded at runtime. The browser asks the server to do the sensitive work; the server checks who is asking before it does.',
      'Least privilege means every person and service gets only the access it needs. A service that only decrypts should not be able to export or delete keys. Access to keys should be logged, but the logs must never contain the keys, passwords, or plaintext themselves.',
    ],
    example: {
      title: 'Narrow access',
      text: 'A reporting service needs to read encrypted records. It is given permission to use one key for decryption only. It cannot read the raw key, create keys, or use other keys. If that service is compromised, the damage is limited.',
    },
    misconception: {
      myth: '"We moved the API secret into a frontend environment variable, so it is hidden now."',
      reality: 'Frontend build-time variables are copied into the JavaScript sent to every visitor. The secret is still public. It must stay on a server.',
    },
    training: {
      topic: 'Cloud Security and Least Privilege',
      text: 'Cloud platforms control access to keys with identity and permission policies. This lesson extends the least-privilege principle from the training to cryptographic keys and secrets.',
    },
    quiz: [
      {
        question: 'A secret used to call a payment API is found in the JavaScript sent to browsers. What is the correct fix?',
        options: [
          'Minify the JavaScript',
          'Move it to a frontend build-time environment variable',
          'Encode it with Base64',
          'Rotate it, keep it on the server, and have the browser call your backend',
        ],
        answer: 3,
        explanation: 'A secret given to every browser is not a secret. It must be replaced and used only from server-side code.',
      },
      {
        question: 'Which is a good example of least privilege?',
        options: [
          'Every developer can export production keys',
          'A service can use one key for decryption only',
          'One key is shared by all applications',
          'Keys are written to logs for debugging',
        ],
        answer: 1,
        explanation: 'Access is limited to exactly the operation and the key the service needs.',
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Writing a Vulnerability Report',
    minutes: 7,
    objective: 'Write a short finding that states evidence, impact, severity, and remediation clearly.',
    explanation: [
      'A vulnerability report (also called a finding) turns a technical observation into something a team can act on. A good finding is specific, reproducible, and honest about what was and was not shown.',
      'Evidence is what you observed. Reproduction steps let someone else see it too. Impact explains what could go wrong and for whom. Remediation says what to change, and verification says how to confirm the fix.',
      'Severity is a judgement about risk, and it depends on the scenario: how sensitive the data is, who can reach it, and how easy the problem is to exploit. "Data is not encrypted" is not automatically Critical. The same weakness can be Low in one system and High in another.',
      'Write for a reader who was not there. Use plain language, define terms, avoid blame, and never paste real secrets or personal data into a report.',
    ],
    example: {
      title: 'Weak versus useful',
      text: 'The second version names the component, the evidence, the conditions, and the fix.',
      code: 'Weak:   "The app is insecure because notes are not encrypted."\n\nUseful: "The notes table stores note text in plaintext. Database backups are\n         copied nightly to a storage bucket readable by all staff accounts, so\n         any staff member can read every user\'s notes. Encrypt the note text\n         with a key the backup readers cannot access, and restrict the bucket."',
    },
    misconception: {
      myth: '"A higher severity makes the report more convincing."',
      reality: 'Overstated severity reduces trust. A justified rating, tied to exposure conditions, is what makes a finding credible.',
    },
    training: {
      topic: 'Security Reporting',
      text: 'The training emphasised documenting findings clearly. This lesson applies that reporting structure to cryptography-related weaknesses, and connects to the experience of preparing OWASP Top 10 educational material.',
    },
    quiz: [
      {
        question: 'What should a severity rating be based on?',
        options: [
          'How technical the finding sounds',
          'Whether encryption is missing',
          'The scenario: data sensitivity, who can reach it, and ease of exploitation',
          'The length of the report',
        ],
        answer: 2,
        explanation: 'Severity depends on exposure conditions, not only on the absence of a control.',
      },
      {
        question: 'Which item belongs in the "Evidence" section?',
        options: ['Your opinion of the developers', 'What you observed that shows the problem exists', 'A guess about other bugs', 'A real user password you found'],
        answer: 1,
        explanation: 'Evidence is the observation itself. Never include real secrets or personal data.',
      },
    ],
    link: { href: '#/reports', label: 'Open the Reports page' },
  },
]
