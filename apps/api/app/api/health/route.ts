import { NextRequest, NextResponse } from 'next/server';
import { API_VERSION } from '@casperjuel/datocms-backup-shared';
import type { HealthResponse } from '@casperjuel/datocms-backup-shared';
import { checkKvConnection } from '@lib/storage/kv';
import { verifyApiSecret } from '@lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse<HealthResponse | { error: string }>> {
  // Check API_SECRET if provided (for validation during setup)
  const apiSecretValid = await verifyApiSecret();

  if (!apiSecretValid) {
    return NextResponse.json(
      { error: 'Invalid API secret' },
      { status: 401 }
    );
  }

  const kvConnected = await checkKvConnection();

  return NextResponse.json({
    status: kvConnected ? 'ok' : 'error',
    version: API_VERSION,
    kvConnected,
    timestamp: new Date().toISOString(),
  });
}
