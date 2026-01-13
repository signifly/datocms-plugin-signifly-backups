import { headers } from 'next/headers';

export async function verifyCronSecret(): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function verifyApiSecret(): Promise<boolean> {
  const headersList = await headers();
  const apiSecret = headersList.get('x-api-secret');
  const expectedSecret = process.env.API_SECRET;

  // If API_SECRET is not set, skip this check (backwards compatible)
  if (!expectedSecret) {
    return true;
  }

  return apiSecret === expectedSecret;
}

export async function verifyApiToken(expectedToken: string): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === expectedToken;
}

export async function getApiToken(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) {
    return null;
  }

  return authHeader.replace('Bearer ', '');
}
