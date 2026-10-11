import { useRef, useState, type ReactNode } from 'react'
import { Callout, CopyButton, Icon, Output, Tabs, TextField } from '../components/ui'
import { challenges } from '../data/challenges'
import { lessons } from '../data/lessons'
import {
  aesDecrypt,
  aesEncrypt,
  base64ToText,
  caesar,
  exportAesKey,
  generateAesKey,
  importAesKey,
  isLetter,
  normalizeDigest,
  sha256Hex,
  tamperPayload,
  textToBase64,
  vigenere,
  webCryptoAvailable,
  type VigenereStep,
} from '../lib/crypto'

const TABS = [
  { id: 'caesar', label: 'Caesar Cipher' },
  { id: 'vigenere', label: 'Vigenère Cipher' },
  { id: 'aes', label: 'AES-GCM' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'base64', label: 'Base64' },
]
const PANELS: Record<string, () => ReactNode> = { caesar: CaesarLab, vigenere: VigenereLab, aes: AesLab, sha256: Sha256Lab, base64: Base64Lab }

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.')

export default function Lab({ tab }: { tab?: string }) {
  const active = TABS.some((t) => t.id === tab) ? tab! : 'caesar'
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Crypto Lab</h1>
        <p className="muted mt-2 max-w-2xl">
          Experiment safely. Everything runs in your browser: nothing you type here is sent to a server or saved. Refreshing the page clears all lab inputs and keys.
        </p>
      </header>
      <Tabs label="Lab tools" tabs={TABS} active={active} onChange={(id) => (location.hash = `#/lab/${id}`)} />
      {/* Every panel stays mounted so keys and inputs survive tab switches (in memory only). */}
      {TABS.map((t) => {
        const Panel = PANELS[t.id]
        return (
          <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={t.id !== active} tabIndex={0} className="space-y-5">
            <Panel />
          </div>
        )
      })}
    </div>
  )
}

function Related({ lesson, challenge }: { lesson: string; challenge: string }) {
  const l = lessons.find((x) => x.id === lesson)!
  const c = challenges.find((x) => x.id === challenge)!
  return (
    <div className="card flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a href={`#/learn/${l.id}`} className="btn">
        <Icon name="book" className="h-4 w-4" /> Lesson: {l.title}
      </a>
      <a href={`#/challenges/${c.id}`} className="btn">
        <Icon name="flag" className="h-4 w-4" /> Challenge: {c.title}
      </a>
    </div>
  )
}

const Actions = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-2">{children}</div>

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
type Mode = 'Encrypt' | 'Decrypt'

// ---------- Caesar ----------

function CaesarLab() {
  const [text, setText] = useState('')
  const [shift, setShift] = useState(3)
  const [result, setResult] = useState<{ mode: Mode; input: string; shift: number; output: string } | null>(null)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  const run = (mode: Mode) => {
    if (!text.trim()) return setError('Enter some text first.')
    setError('')
    setResult({ mode, input: text, shift, output: caesar(text, mode === 'Encrypt' ? shift : -shift) })
  }
  const steps = result ? Array.from(result.input).filter(isLetter).slice(0, 6) : []

  return (
    <>
      <section className="card space-y-4">
        <h2 className="h2">Caesar Cipher</h2>
        <p className="muted text-sm">
          Each English letter is moved a fixed number of places along the alphabet. Number the letters A = 0, B = 1, … Z = 25. Encrypt with <code>E(x) = (x + k) mod 26</code> and decrypt with <code>D(x) = (x − k + 26) mod 26</code>, where k is the shift.
        </p>
        <Callout tone="warning" title="Educational only. This is not secure modern encryption.">
          <p>There are only 26 possible shifts, so anyone can try them all. Never use it to protect real information.</p>
        </Callout>
        <TextField label="Plaintext or ciphertext" value={text} onChange={setText} multiline error={error} hint="Only A–Z and a–z are rotated. Spaces, numbers, punctuation and all other characters are left unchanged. Letter case is kept." />
        <div>
          <label htmlFor="caesar-shift" className="label">Shift (0 to 25)</label>
          <select id="caesar-shift" className="input max-w-32" value={shift} onChange={(e) => setShift(Number(e.target.value))}>
            {Array.from({ length: 26 }, (_, k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <Actions>
          <button type="button" className="btn btn-primary" onClick={() => run('Encrypt')}>Encrypt</button>
          <button type="button" className="btn btn-primary" onClick={() => run('Decrypt')}>Decrypt</button>
          <button type="button" className="btn" onClick={() => (setText('HELLO WORLD'), setShift(3), setError(''))}>Use example</button>
          <button type="button" className="btn" onClick={() => (setText(''), setResult(null), setError(''), setShowAll(false))}>Clear</button>
        </Actions>
        <Output label={result ? `Output (${result.mode.toLowerCase()}ed with shift ${result.shift})` : 'Output'} value={result?.output ?? ''} />
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Alphabet for shift {shift}</h2>
        <div className="code overflow-x-auto whitespace-pre">
          {`Original: ${ALPHABET.split('').join(' ')}\nShifted:  ${caesar(ALPHABET, shift).split('').join(' ')}`}
        </div>
        {result && steps.length > 0 && (
          <>
            <h3 className="font-semibold">Step by step (first {steps.length} letters)</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">
              {steps.map((ch, i) => {
                const x = ch.toUpperCase().charCodeAt(0) - 65
                const enc = result.mode === 'Encrypt'
                const y = enc ? (x + result.shift) % 26 : (x - result.shift + 26) % 26
                return (
                  <li key={i}>
                    <strong>{ch}</strong> is {x}. ({x} {enc ? '+' : '−'} {result.shift}{enc ? '' : ' + 26'}) mod 26 = {y}, which is <strong>{caesar(ch, enc ? result.shift : -result.shift)}</strong>.
                  </li>
                )
              })}
            </ol>
            <p className="muted text-sm">
              What this means: the output is the same message with every letter moved {result.shift} place{result.shift === 1 ? '' : 's'} {result.mode === 'Encrypt' ? 'forward' : 'back'}. Anyone who guesses the shift can read it.
            </p>
          </>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Break it: try every shift</h2>
        <p className="muted text-sm">Treats the text in the input box as ciphertext and decrypts it with all 26 shifts. Look for the line that reads as normal language.</p>
        <button type="button" className="btn" aria-expanded={showAll} disabled={!text.trim()} onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Hide All 26 Shifts' : 'Show All 26 Shifts'}
        </button>
        {showAll && text.trim() && (
          <div className="max-h-96 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">The input decrypted with every shift from 0 to 25</caption>
              <thead className="sticky top-0 bg-slate-100">
                <tr><th scope="col" className="px-3 py-2">Shift</th><th scope="col" className="px-3 py-2">Decrypted text</th></tr>
              </thead>
              <tbody>
                {Array.from({ length: 26 }, (_, k) => (
                  <tr key={k} className="border-t border-slate-200">
                    <th scope="row" className="px-3 py-2 font-semibold">{k}</th>
                    <td className="px-3 py-2 font-mono">{caesar(text, -k)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Related lesson="caesar" challenge="decode-the-shift" />
    </>
  )
}

// ---------- Vigenère ----------

function VigenereLab() {
  const [text, setText] = useState('')
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<{ mode: Mode; output: string; steps: VigenereStep[] } | null>(null)
  const [errors, setErrors] = useState({ text: '', keyword: '' })

  const run = (mode: Mode) => {
    const next = { text: text.trim() ? '' : 'Enter some text first.', keyword: '' }
    let out: ReturnType<typeof vigenere> | null = null
    try {
      if (!keyword) throw new Error('Enter a keyword, for example LEMON.')
      out = vigenere(text, keyword, mode === 'Decrypt')
    } catch (e) {
      next.keyword = message(e)
    }
    setErrors(next)
    if (out && !next.text) setResult({ mode, ...out })
  }

  return (
    <>
      <section className="card space-y-4">
        <h2 className="h2">Vigenère Cipher</h2>
        <p className="muted text-sm">
          A keyword supplies a different Caesar shift for each letter: A = 0, B = 1, … Z = 25. The keyword repeats until the message ends. Unlike a single Caesar shift, the same plaintext letter can become different ciphertext letters.
        </p>
        <Callout tone="warning" title="Educational only. Not appropriate for modern security.">
          <p>Because the keyword repeats, letters that share a keyword position use the same shift. That pattern lets the cipher be broken with classical analysis.</p>
        </Callout>
        <TextField label="Plaintext or ciphertext" value={text} onChange={setText} multiline error={errors.text} />
        <TextField label="Keyword" value={keyword} onChange={setKeyword} error={errors.keyword} autoComplete="off" hint="English letters only, no spaces. Upper and lower case are treated the same." />
        <p className="muted text-sm">
          Convention used here: the keyword moves to its next letter only when an English letter is processed. Spaces, numbers and punctuation are copied unchanged and do not use up a keyword letter. Letter case of the input is kept.
        </p>
        <Actions>
          <button type="button" className="btn btn-primary" onClick={() => run('Encrypt')}>Encrypt</button>
          <button type="button" className="btn btn-primary" onClick={() => run('Decrypt')}>Decrypt</button>
          <button type="button" className="btn" onClick={() => (setText('ATTACKATDAWN'), setKeyword('LEMON'), setErrors({ text: '', keyword: '' }))}>Use example</button>
          <button type="button" className="btn" onClick={() => (setText(''), setKeyword(''), setResult(null), setErrors({ text: '', keyword: '' }))}>Clear</button>
        </Actions>
        <Output label={result ? `Output (${result.mode.toLowerCase()}ed)` : 'Output'} value={result?.output ?? ''} />
      </section>

      {result && result.steps.length > 0 && (
        <section className="card space-y-3">
          <h2 className="h2">Step by step</h2>
          <p className="muted text-sm">
            Each row {result.mode === 'Encrypt' ? 'adds' : 'subtracts'} the shift of one keyword letter. Notice the keyword column repeating. {result.steps.length > 40 && 'Showing the first 40 letters.'}
          </p>
          <div className="max-h-96 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Vigenère transformation of each letter</caption>
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  {['#', 'Input letter', 'Keyword letter', 'Numeric shift', 'Output letter'].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}
                </tr>
              </thead>
              <tbody className="font-mono">
                {result.steps.slice(0, 40).map((s, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="px-3 py-1.5">{i + 1}</td>
                    <td className="px-3 py-1.5">{s.input}</td>
                    <td className="px-3 py-1.5">{s.key}</td>
                    <td className="px-3 py-1.5">{s.shift}</td>
                    <td className="px-3 py-1.5 font-bold">{s.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Related lesson="vigenere" challenge="follow-the-keyword" />
    </>
  )
}

// ---------- AES-GCM ----------

function AesLab() {
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [keyNote, setKeyNote] = useState('')
  const [revealed, setRevealed] = useState('')
  const [importValue, setImportValue] = useState('')
  const [importError, setImportError] = useState('')
  const [plain, setPlain] = useState('')
  const [plainError, setPlainError] = useState('')
  const [payload, setPayload] = useState('')
  const [decrypted, setDecrypted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [tampered, setTampered] = useState<{ payload: string; result: string } | null>(null)

  if (!webCryptoAvailable()) {
    return (
      <section className="card space-y-4">
        <h2 className="h2">AES-GCM</h2>
        <Callout tone="warning" title="This lab is not available in the current browser context.">
          <p>The Web Crypto API only works in a secure context: a page loaded over HTTPS, or from localhost during development. Open the site that way, in an up-to-date browser, and try again.</p>
        </Callout>
      </section>
    )
  }

  const applyKey = (k: CryptoKey, note: string) => (setKey(k), setKeyNote(note), setRevealed(''), setDecrypted(null), setError(''), setTampered(null))
  const needKey = () => (key ? true : (setError('Generate or import a key first.'), false))

  const doImport = async () => {
    try {
      applyKey(await importAesKey(importValue), 'Key imported. It is held in memory only.')
      setImportValue('')
      setImportError('')
    } catch (e) {
      setImportError(message(e))
    }
  }
  const encrypt = async () => {
    setPlainError(plain ? '' : 'Enter a message to encrypt.')
    if (!plain || !needKey()) return
    setPayload(await aesEncrypt(key!, plain))
    setDecrypted(null)
    setTampered(null)
    setError('')
  }
  const decrypt = async () => {
    setDecrypted(null) // never leave earlier plaintext on screen next to a failure
    if (!needKey()) return
    if (!payload.trim()) return setError('There is no encrypted payload to decrypt. Encrypt a message or paste a payload.')
    try {
      setDecrypted(await aesDecrypt(key!, payload))
      setError('')
    } catch (e) {
      setError(message(e))
    }
  }
  const tamper = async () => {
    if (!needKey()) return
    if (!payload.trim()) return setError('Encrypt a message first, then tamper with a copy of it.')
    try {
      const copy = tamperPayload(payload)
      const result = await aesDecrypt(key!, copy).then(
        () => 'Unexpected: the modified copy was accepted.',
        (e) => message(e),
      )
      setTampered({ payload: copy, result })
      setError('')
    } catch (e) {
      setError(message(e))
    }
  }

  return (
    <>
      <section className="card space-y-4">
        <h2 className="h2">AES-GCM</h2>
        <p className="muted text-sm">
          AES-GCM is modern authenticated encryption: it keeps a message secret and also detects any change to the encrypted data. This lab uses your browser's Web Crypto API with a 256-bit key, a fresh random 12-byte IV (a per-message value that must never repeat for a key) for every encryption, and a 128-bit authentication tag.
        </p>
        <Callout tone="info" title="A learning demonstration, not a secure vault.">
          <p>Nothing here is sent to a server. Do not rely on this page to protect real secrets.</p>
        </Callout>
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Step 1: Key</h2>
        <p role="status" className="flex items-center gap-2 text-sm font-medium">
          <Icon name={key ? 'check' : 'info'} className={`h-4 w-4 ${key ? 'text-green-700' : 'text-slate-500'}`} />
          {key ? keyNote : 'No key yet.'}
        </p>
        <Actions>
          <button type="button" className="btn btn-primary" onClick={async () => applyKey(await generateAesKey(), 'A 256-bit key is ready. It is held in memory only.')}>
            {key ? 'Generate New Key' : 'Generate Key'}
          </button>
          {key && (
            <button type="button" className="btn" aria-expanded={!!revealed} onClick={async () => setRevealed(revealed ? '' : await exportAesKey(key))}>
              {revealed ? 'Hide key' : 'Reveal key to export'}
            </button>
          )}
        </Actions>
        {revealed && (
          <div className="space-y-2">
            <Callout tone="warning" title="This is the secret key. Anyone who has it can decrypt your payloads.">
              <p>Keep it separate from the encrypted payload. Never store or send the two together.</p>
            </Callout>
            <div className="code break-all">{revealed}</div>
            <CopyButton text={revealed} label="Copy key" />
          </div>
        )}
        <p className="muted text-sm">
          The key is kept in this page's memory and is never saved. Refreshing or closing the page clears it, and anything encrypted with it can then no longer be decrypted, unless you revealed and exported the key first.
        </p>
        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold">Import a demonstration key</summary>
          <div className="mt-3 space-y-3">
            <TextField label="Key (Base64, 32 bytes)" value={importValue} onChange={setImportValue} error={importError} mono autoComplete="off" hint="Paste a key that was exported from this lab. Only use demonstration keys here." />
            <button type="button" className="btn" onClick={doImport}>Import key</button>
          </div>
        </details>
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Step 2: Encrypt</h2>
        <TextField label="Plaintext message" value={plain} onChange={setPlain} multiline error={plainError} />
        <Actions>
          <button type="button" className="btn btn-primary" onClick={encrypt}>Encrypt</button>
          <button type="button" className="btn" onClick={() => (setPlain('Meet at the library at 4 pm.'), setPlainError(''))}>Use example</button>
          <button type="button" className="btn" onClick={() => (setPlain(''), setPayload(''), setDecrypted(null), setError(''), setPlainError(''), setTampered(null))}>Clear</button>
        </Actions>
        <TextField label="Encrypted payload (JSON)" value={payload} onChange={(v) => (setPayload(v), setDecrypted(null))} multiline rows={6} mono hint="Contains the version, algorithm, IV and ciphertext (with the authentication tag attached). It does not contain the key. You can also paste a payload here." />
        {payload && <CopyButton text={payload} label="Copy payload" />}
        <p className="muted text-sm">Encrypt the same message twice: the IV and ciphertext are different every time, because a new random IV is generated for each encryption.</p>
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Step 3: Decrypt</h2>
        <Actions>
          <button type="button" className="btn btn-primary" onClick={decrypt}>Decrypt</button>
        </Actions>
        {error && <Callout tone="error" title={error} />}
        {decrypted !== null && (
          <>
            <Callout tone="success" title="Authentication passed. The payload was not modified and the key matches." live />
            <Output label="Decrypted plaintext" value={decrypted} />
          </>
        )}
        <p className="muted text-sm">
          What this means: a successful decryption shows the payload was created with this same shared key and has not changed since. It does not prove which person or system created it.
        </p>
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Experiment: Tamper with a Copy</h2>
        <p className="muted text-sm">Makes a copy of the payload above, flips one bit in the first ciphertext byte, and tries to decrypt the copy with the correct key. Your original payload is not changed.</p>
        <button type="button" className="btn" onClick={tamper}>Tamper with a Copy</button>
        {tampered && (
          <div className="space-y-3">
            <Output label="Tampered copy" value={tampered.payload} />
            <Callout tone="error" title={tampered.result}>
              <p>No plaintext is shown, because AES-GCM refuses to release data that fails its authentication check. Here we know the copy was modified; in real use, the same message appears for a wrong key, so the error alone cannot tell you which cause occurred.</p>
            </Callout>
          </div>
        )}
      </section>
      <Related lesson="aes-gcm" challenge="detect-tampered-message" />
    </>
  )
}

// ---------- SHA-256 ----------

const MAX_FILE_BYTES = 10 * 1024 * 1024

function Sha256Lab() {
  const [text, setText] = useState('')
  const [digest, setDigest] = useState<{ value: string; source: string } | null>(null)
  const [expected, setExpected] = useState('')
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const file = useRef<HTMLInputElement>(null)

  if (!webCryptoAvailable()) {
    return (
      <section className="card space-y-4">
        <h2 className="h2">SHA-256</h2>
        <Callout tone="warning" title="This lab is not available in the current browser context.">
          <p>The Web Crypto API only works in a secure context: a page loaded over HTTPS, or from localhost during development.</p>
        </Callout>
      </section>
    )
  }

  const hashText = async () => {
    if (!text) return setError('Enter some text first.')
    setError('')
    setDigest({ value: await sha256Hex(text), source: 'the text' })
  }
  const hashFile = async (f?: File) => {
    if (!f) return
    if (f.size > MAX_FILE_BYTES) return setFileError(`"${f.name}" is ${(f.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB.`)
    setFileError('')
    try {
      setDigest({ value: await sha256Hex(await f.arrayBuffer()), source: `the file "${f.name}"` })
    } catch {
      setFileError('The file could not be read. Please choose it again.')
    }
  }
  const wanted = normalizeDigest(expected)
  const clear = () => {
    setText(''), setDigest(null), setExpected(''), setError(''), setFileError('')
    if (file.current) file.current.value = ''
  }

  return (
    <>
      <section className="card space-y-4">
        <h2 className="h2">SHA-256</h2>
        <p className="muted text-sm">
          SHA-256 turns any text or file into a 64-character hexadecimal digest, a kind of fingerprint. The same input always gives the same digest; any change gives a completely different one. Hashing does not encrypt: the original stays readable, and the digest cannot be turned back into it.
        </p>
        <TextField label="Text to hash" value={text} onChange={setText} multiline error={error} hint="Every character counts, including spaces and line breaks." />
        <Actions>
          <button type="button" className="btn btn-primary" onClick={hashText}>Hash text</button>
          <button type="button" className="btn" onClick={() => (setText('abc'), setError(''))}>Use example</button>
          <button type="button" className="btn" onClick={clear}>Clear</button>
        </Actions>
        <div>
          <label htmlFor="sha-file" className="label">Or hash a local file (maximum 10 MB)</label>
          <input ref={file} id="sha-file" type="file" className="input" aria-describedby="sha-file-help" onChange={(e) => hashFile(e.target.files?.[0])} />
          <p id="sha-file-help" className={fileError ? 'mt-1 text-sm font-medium text-red-700' : 'hint'} role={fileError ? 'alert' : undefined}>
            {fileError ? `Error: ${fileError}` : 'The file is read and hashed on this device. It is not uploaded.'}
          </p>
        </div>
        <Output label={digest ? `SHA-256 digest of ${digest.source}` : 'SHA-256 digest'} value={digest?.value ?? ''} />
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Compare with an expected digest</h2>
        <TextField label="Expected digest" value={expected} onChange={setExpected} mono autoComplete="off" hint="Paste the digest published by the source. It must come from a trusted source: if an attacker can change both the file and the digest, a match means nothing." />
        <div role="status">
          {expected.trim() && !wanted && <Callout tone="warning" title="That is not a SHA-256 digest. It should be exactly 64 hexadecimal characters (0–9 and a–f)." />}
          {wanted && !digest && <Callout tone="info" title="Now hash some text or a file to compare." />}
          {wanted && digest && (wanted === digest.value
            ? <Callout tone="success" title="Match"><p>The input is identical to whatever the expected digest describes. This does not prove who created it.</p></Callout>
            : <Callout tone="error" title="Does Not Match"><p>The input is different from what the expected digest describes, even if only by one character.</p></Callout>)}
        </div>
      </section>
      <Related lesson="integrity" challenge="has-the-file-changed" />
    </>
  )
}

// ---------- Base64 ----------

function Base64Lab() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ mode: 'Encoded' | 'Decoded'; output: string } | null>(null)
  const [error, setError] = useState('')

  const run = (mode: 'Encoded' | 'Decoded') => {
    if (!text.trim()) return setError('Enter some text first.')
    try {
      setResult({ mode, output: mode === 'Encoded' ? textToBase64(text) : base64ToText(text) })
      setError('')
    } catch (e) {
      setResult(null) // do not leave an earlier result next to an error
      setError(message(e))
    }
  }

  return (
    <>
      <section className="card space-y-4">
        <h2 className="h2">Base64</h2>
        <Callout tone="warning" title="Base64 is encoding, not encryption. It does not protect secrets." />
        <p className="muted text-sm">
          Base64 rewrites bytes using 64 safe characters so that data can travel through systems that expect plain text. There is no key. Anyone can decode it. Text is converted using UTF-8, so accented letters, Arabic, and emoji all work.
        </p>
        <TextField label="Text to encode, or Base64 to decode" value={text} onChange={setText} multiline error={error} />
        <Actions>
          <button type="button" className="btn btn-primary" onClick={() => run('Encoded')}>Encode</button>
          <button type="button" className="btn btn-primary" onClick={() => run('Decoded')}>Decode</button>
          <button type="button" className="btn" onClick={() => (setText('Hello, CryptoShield! ✓'), setError(''))}>Use example</button>
          <button type="button" className="btn" onClick={() => (setText(''), setResult(null), setError(''))}>Clear</button>
        </Actions>
        <Output label={result ? `${result.mode} output` : 'Output'} value={result?.output ?? ''} />
        <p className="muted text-sm">
          What this means: the output holds exactly the same information as the input, just written differently. If you can decode it without a secret, so can everyone else.
        </p>
      </section>
      <Related lesson="basics" challenge="encoding-is-not-protection" />
    </>
  )
}
