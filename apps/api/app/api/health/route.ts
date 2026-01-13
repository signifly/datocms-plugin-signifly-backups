import { NextResponse } from 'next/server';
import { API_VERSION } from '@datocms-backup/shared';
import type { HealthResponse } from '@datocms-backup/shared';
import { checkKvConnection } from '@lib/storage/kv';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const kvConnected = await checkKvConnection();

  return NextResponse.json({
    status: kvConnected ? 'ok' : 'error',
    version: API_VERSION,
    kvConnected,
    timestamp: new Date().toISOString(),
  });
}
