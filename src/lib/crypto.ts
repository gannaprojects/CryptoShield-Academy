// All cryptographic logic for the labs. Classical ciphers are implemented here for teaching;
// modern operations (AES-GCM, SHA-256, randomness) are delegated to the browser's Web Crypto API.

/** False in non-secure contexts (e.g. plain http on a non-localhost host), where crypto.subtle is missing. */
export const webCryptoAvailable = () => typeof globalThis.crypto?.subtle !== 'undefined'

// ---------- Classical ciphers ----------

export const isLetter = (ch: string) => /^[A-Za-z]$/.test(ch)

/** Rotates one English letter by k places, keeping its case. Anything else is returned unchanged. */
export function shiftChar(ch: string, k: number): string {
  if (!isLetter(ch)) return ch
  const base = ch <= 'Z' ? 65 : 97
  return String.fromCharCode(((((ch.charCodeAt(0) - base + k) % 26) + 26) % 26) + base)
}

export const caesar = (text: string, shift: number) => Array.from(text, (ch) => shiftChar(ch, shift)).join('')

export interface VigenereStep {
  input: string
  key: string
  shift: number
  output: string
}

export const validKeyword = (keyword: string) => /^[A-Za-z]+$/.test(keyword)

/** Convention: the keyword advances only when an English letter is processed. */
export function vigenere(text: string, keyword: string, decrypt = false): { output: string; steps: VigenereStep[] } {
  if (!validKeyword(keyword)) throw new Error('The keyword must contain English letters only (A–Z), with no spaces.')
  const key = keyword.toUpperCase()
  const steps: VigenereStep[] = []
  let used = 0
  const output = Array.from(text, (ch) => {
    if (!isLetter(ch)) return ch
    const k = key[used++ % key.length]
    const shift = k.charCodeAt(0) - 65
    const out = shiftChar(ch, decrypt ? -shift : shift)
    steps.push({ input: ch, key: k, shift, output: out })
    return out
  }).join('')
  return { output, steps }
}

// ---------- Base64 ----------

export const bytesToBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))

export function base64ToBytes(input: string): Uint8Array<ArrayBuffer> {
  const s = input.replace(/\s+/g, '')
  if (s.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(s)) {
    throw new Error(
      'This is not valid Base64. Use only A–Z, a–z, 0–9, "+" and "/", with "=" padding so the length is a multiple of 4.',
    )
  }
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

export const textToBase64 = (text: string) => bytesToBase64(new TextEncoder().encode(text))

export function base64ToText(input: string): string {
  const bytes = base64ToBytes(input)
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('The Base64 is well-formed, but the decoded bytes are not valid UTF-8 text.')
  }
}

// ---------- SHA-256 ----------

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Trims and lowercases a pasted digest; returns null when it is not 64 hex characters. */
export function normalizeDigest(input: string): string | null {
  const s = input.trim().toLowerCase()
  return /^[0-9a-f]{64}$/.test(s) ? s : null
}

// ---------- AES-GCM ----------

export const PAYLOAD_VERSION = 1
export const PAYLOAD_ALGORITHM = 'AES-256-GCM'
export const DECRYPT_FAILED = 'Decryption failed. The key may be incorrect, or the encrypted data may have been modified.'

const AES = 'AES-GCM'
const IV_BYTES = 12
const TAG_BITS = 128

// Extractable only so the lab's explicit "reveal key" export works.
export const generateAesKey = () => crypto.subtle.generateKey({ name: AES, length: 256 }, true, ['encrypt', 'decrypt'])

export const exportAesKey = async (key: CryptoKey) => bytesToBase64(new Uint8Array(await crypto.subtle.exportKey('raw', key)))

export async function importAesKey(base64: string): Promise<CryptoKey> {
  let raw: Uint8Array<ArrayBuffer>
  try {
    raw = base64ToBytes(base64)
  } catch {
    throw new Error('The key must be Base64 text.')
  }
  if (raw.length !== 32) throw new Error(`A 256-bit key is 32 bytes long. This value decodes to ${raw.length} bytes.`)
  return crypto.subtle.importKey('raw', raw, AES, true, ['encrypt', 'decrypt'])
}

/** Encrypts with a fresh random 12-byte IV and returns the versioned JSON payload. The key is never included. */
export async function aesEncrypt(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const data = await crypto.subtle.encrypt({ name: AES, iv, tagLength: TAG_BITS }, key, new TextEncoder().encode(plaintext))
  return JSON.stringify(
    {
      version: PAYLOAD_VERSION,
      algorithm: PAYLOAD_ALGORITHM,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(data)), // Web Crypto appends the 16-byte tag
    },
    null,
    2,
  )
}

export function parsePayload(json: string): { iv: Uint8Array<ArrayBuffer>; ciphertext: Uint8Array<ArrayBuffer> } {
  let p: Record<string, unknown>
  try {
    p = JSON.parse(json)
  } catch {
    throw new Error('The encrypted payload is not valid JSON.')
  }
  if (typeof p !== 'object' || p === null) throw new Error('The encrypted payload must be a JSON object.')
  if (p.version !== PAYLOAD_VERSION) throw new Error(`Unsupported payload version. This lab reads version ${PAYLOAD_VERSION}.`)
  if (p.algorithm !== PAYLOAD_ALGORITHM) throw new Error(`Unsupported algorithm. This lab reads ${PAYLOAD_ALGORITHM}.`)
  if (typeof p.iv !== 'string' || typeof p.ciphertext !== 'string') {
    throw new Error('The payload must contain "iv" and "ciphertext" as Base64 text.')
  }
  let iv: Uint8Array<ArrayBuffer>, ciphertext: Uint8Array<ArrayBuffer>
  try {
    iv = base64ToBytes(p.iv)
    ciphertext = base64ToBytes(p.ciphertext)
  } catch {
    throw new Error('The "iv" or "ciphertext" field is not valid Base64.')
  }
  if (iv.length !== IV_BYTES) throw new Error(`The IV must be ${IV_BYTES} bytes long.`)
  if (ciphertext.length < TAG_BITS / 8) throw new Error('The ciphertext is too short to contain an authentication tag.')
  return { iv, ciphertext }
}

/** Returns plaintext only if authentication succeeds; otherwise throws DECRYPT_FAILED with no partial output. */
export async function aesDecrypt(key: CryptoKey, payloadJson: string): Promise<string> {
  const { iv, ciphertext } = parsePayload(payloadJson)
  let plain: ArrayBuffer
  try {
    plain = await crypto.subtle.decrypt({ name: AES, iv, tagLength: TAG_BITS }, key, ciphertext)
  } catch {
    throw new Error(DECRYPT_FAILED)
  }
  return new TextDecoder().decode(plain)
}

/** Returns a copy of the payload with one bit of the first ciphertext byte flipped. */
export function tamperPayload(payloadJson: string): string {
  const { ciphertext } = parsePayload(payloadJson)
  ciphertext[0] ^= 1
  return JSON.stringify({ ...JSON.parse(payloadJson), ciphertext: bytesToBase64(ciphertext) }, null, 2)
}

/** Random identifier for local records (not a secret). */
export const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('')
