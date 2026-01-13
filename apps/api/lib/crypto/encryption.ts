import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // If no encryption key is set, use a derived key from CRON_SECRET
    // This is a fallback - users should set ENCRYPTION_KEY for production
    const fallback = process.env.CRON_SECRET || 'default-insecure-key-change-me';
    // Hash to get consistent 32 bytes
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(fallback).digest();
  }

  // Key should be 64 hex characters (32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Check if a string looks like it's already encrypted (has our format)
export function isEncrypted(text: string): boolean {
  const parts = text.split(':');
  if (parts.length !== 3) return false;

  const [iv, authTag, data] = parts;
  // Check if parts look like hex strings of expected lengths
  return iv.length === IV_LENGTH * 2 &&
         authTag.length === AUTH_TAG_LENGTH * 2 &&
         data.length > 0 &&
         /^[a-f0-9]+$/i.test(iv) &&
         /^[a-f0-9]+$/i.test(authTag) &&
         /^[a-f0-9]+$/i.test(data);
}

// Timing-safe string comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Still do a comparison to prevent length-based timing attacks
    // but pad shorter buffer
    const maxLen = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.alloc(maxLen);
    const paddedB = Buffer.alloc(maxLen);
    bufA.copy(paddedA);
    bufB.copy(paddedB);
    timingSafeEqual(paddedA, paddedB);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
