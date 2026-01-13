import { headers } from 'next/headers';
import { secureCompare } from '@lib/crypto/encryption';

// Extract Bearer token from Authorization header with proper validation
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match || !match[1]) {
    return null;
  }

  return match[1];
}

export async function verifyCronSecret(): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }

  const token = extractBearerToken(authHeader);
  if (!token) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return secureCompare(token, cronSecret);
}

export async function verifyApiSecret(): Promise<boolean> {
  const headersList = await headers();
  const apiSecret = headersList.get('x-api-secret');
  const expectedSecret = process.env.API_SECRET;

  // If API_SECRET is not set, skip this check (backwards compatible)
  if (!expectedSecret) {
    return true;
  }

  if (!apiSecret) {
    return false;
  }

  // Use timing-safe comparison
  return secureCompare(apiSecret, expectedSecret);
}

export async function verifyApiToken(expectedToken: string): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const token = extractBearerToken(authHeader);
  if (!token) {
    return false;
  }

  // Use timing-safe comparison
  return secureCompare(token, expectedToken);
}

export async function getApiToken(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  return extractBearerToken(authHeader);
}
