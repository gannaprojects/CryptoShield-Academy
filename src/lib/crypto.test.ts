import { describe, expect, it } from 'vitest'
import {
  aesDecrypt,
  aesEncrypt,
  base64ToText,
  caesar,
  DECRYPT_FAILED,
  exportAesKey,
  generateAesKey,
  importAesKey,
  parsePayload,
  sha256Hex,
  tamperPayload,
  textToBase64,
  vigenere,
} from './crypto'
import { challenges, FILE_ORIGINAL, FILE_SUPPLIED, FILE_TRUSTED_DIGEST } from '../data/challenges'
import { lessons } from '../data/lessons'

describe('Caesar', () => {
  it('encrypts the verified example', () => expect(caesar('HELLO WORLD', 3)).toBe('KHOOR ZRUOG'))
  it('decrypts back to the original', () => expect(caesar(caesar('HELLO WORLD', 3), -3)).toBe('HELLO WORLD'))
  it('wraps Z to A and preserves case, digits and punctuation', () => {
    expect(caesar('xyz XYZ, 42! é', 3)).toBe('abc ABC, 42! é')
    expect(caesar('abc', -3)).toBe('xyz')
    expect(caesar('Hello', 0)).toBe('Hello')
  })
})

describe('Vigenère', () => {
  it('encrypts the verified example', () => expect(vigenere('ATTACKATDAWN', 'LEMON').output).toBe('LXFOPVEFRNHR'))
  it('decrypts back to the original', () => expect(vigenere('LXFOPVEFRNHR', 'lemon', true).output).toBe('ATTACKATDAWN'))
  it('advances the keyword only on letters and preserves case', () => {
    const { output, steps } = vigenere('Attack, at dawn! 123', 'LEMON')
    expect(output).toBe('Lxfopv, ef rnhr! 123')
    expect(steps.map((s) => s.key).join('')).toBe('LEMONLEMONLE')
    expect(vigenere(output, 'LEMON', true).output).toBe('Attack, at dawn! 123')
  })
  it('rejects empty and non-letter keywords', () => {
    expect(() => vigenere('abc', '')).toThrow()
    expect(() => vigenere('abc', 'key 1')).toThrow()
  })
})

describe('AES-GCM', () => {
  it('round-trips text, including non-ASCII', async () => {
    const key = await generateAesKey()
    expect(await aesDecrypt(key, await aesEncrypt(key, 'Meet at noon — مرحبا 🔐'))).toBe('Meet at noon — مرحبا 🔐')
  })
  it('uses a fresh 12-byte IV for every encryption and never includes the key', async () => {
    const key = await generateAesKey()
    const a = await aesEncrypt(key, 'same')
    const b = await aesEncrypt(key, 'same')
    expect(JSON.parse(a).iv).not.toBe(JSON.parse(b).iv)
    expect(parsePayload(a).iv.length).toBe(12)
    expect(parsePayload(a).ciphertext.length).toBe(4 + 16) // 4 bytes of text + 128-bit tag
    expect(Object.keys(JSON.parse(a))).toEqual(['version', 'algorithm', 'iv', 'ciphertext'])
    expect(a).not.toContain(await exportAesKey(key))
  })
  it('fails safely with a wrong key or tampered ciphertext', async () => {
    const key = await generateAesKey()
    const payload = await aesEncrypt(key, 'secret')
    await expect(aesDecrypt(await generateAesKey(), payload)).rejects.toThrow(DECRYPT_FAILED)
    await expect(aesDecrypt(key, tamperPayload(payload))).rejects.toThrow(DECRYPT_FAILED)
    expect(await aesDecrypt(key, payload)).toBe('secret') // the original is untouched
  })
  it('exports and re-imports a key, and rejects bad keys and payloads', async () => {
    const key = await generateAesKey()
    const payload = await aesEncrypt(key, 'hi')
    expect(await aesDecrypt(await importAesKey(await exportAesKey(key)), payload)).toBe('hi')
    await expect(importAesKey('AAAA')).rejects.toThrow('32 bytes')
    await expect(importAesKey('not base64!')).rejects.toThrow()
    await expect(aesDecrypt(key, 'nope')).rejects.toThrow('not valid JSON')
    await expect(aesDecrypt(key, '{"version":2}')).rejects.toThrow('version')
  })
})

describe('SHA-256', () => {
  it('hashes "abc" to the known digest', async () =>
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'))
})

describe('Base64', () => {
  it('round-trips UTF-8 text', () => {
    expect(textToBase64('héllo ✓')).toBe('aMOpbGxvIOKckw==')
    expect(base64ToText('aMOpbGxvIOKckw==')).toBe('héllo ✓')
  })
  it('rejects malformed input and invalid UTF-8', () => {
    expect(() => base64ToText('abc')).toThrow('not valid Base64')
    expect(() => base64ToText('ab$=')).toThrow('not valid Base64')
    expect(() => base64ToText('/w==')).toThrow('UTF-8')
  })
})

describe('content data', () => {
  it('has eight lessons and eight challenges with unique ids', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(8)
    expect(new Set(challenges.map((c) => c.id)).size).toBe(8)
  })
  it('challenge 6 file data is consistent', async () => {
    expect(await sha256Hex(FILE_ORIGINAL)).toBe(FILE_TRUSTED_DIGEST)
    expect(await sha256Hex(FILE_SUPPLIED)).not.toBe(FILE_TRUSTED_DIGEST)
  })
})
