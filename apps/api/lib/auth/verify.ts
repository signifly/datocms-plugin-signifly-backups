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
