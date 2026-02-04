import type { BackupType } from '@casperjuel/datocms-backup-shared';

// Constants for validation
export const MAX_LIMIT = 100;
export const MAX_OFFSET = 10000;
export const MAX_PREFIX_LENGTH = 50;
export const MAX_NOTE_LENGTH = 500;

// Valid backup types
const VALID_BACKUP_TYPES: BackupType[] = ['daily', 'weekly', 'monthly', 'manual'];
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'cleaned'];

// Sanitize and validate pagination limit
export function validateLimit(value: string | null, defaultValue = 50): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, MAX_LIMIT);
}

// Sanitize and validate pagination offset
export function validateOffset(value: string | null, defaultValue = 0): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) return defaultValue;
  return Math.min(parsed, MAX_OFFSET);
}

// Validate backup type filter
export function validateBackupType(value: string | null): BackupType | null {
  if (!value) return null;
  return VALID_BACKUP_TYPES.includes(value as BackupType) ? (value as BackupType) : null;
}

// Validate status filter
export function validateStatus(value: string | null): string | null {
  if (!value) return null;
  return VALID_STATUSES.includes(value) ? value : null;
}

// Validate and sanitize environment prefix
export function validateEnvironmentPrefix(value: string | undefined): string | null {
  if (!value) return null;

  // Remove any non-alphanumeric characters except hyphens
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, MAX_PREFIX_LENGTH);

  return sanitized || null;
}

// Validate and sanitize note
export function validateNote(value: string | undefined): string | undefined {
  if (!value) return undefined;

  // Trim and limit length
  const sanitized = value.trim().slice(0, MAX_NOTE_LENGTH);
  return sanitized || undefined;
}

// Validate project ID format (basic check)
export function validateProjectId(value: string | null): boolean {
  if (!value) return false;
  // DatoCMS project IDs are typically numeric or alphanumeric
  return /^[a-zA-Z0-9_-]{1,50}$/.test(value);
}

// Validate DatoCMS API token format (basic check)
export function validateApiTokenFormat(value: string | null): boolean {
  if (!value) return false;
  // DatoCMS tokens are 20+ characters, alphanumeric with optional colons for full-access tokens
  return /^[a-zA-Z0-9:]{20,}$/.test(value);
}

// Generic sanitize string (prevent injection)
export function sanitizeString(value: string, maxLength = 255): string {
  return value
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, maxLength);
}
