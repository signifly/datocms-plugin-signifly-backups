import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  BackupRun,
  TriggerBackupRequest,
  TriggerBackupResponse,
  ApiError,
} from '@datocms-backup/shared';
import * as storage from '@lib/storage/kv';
import { createBackup } from '@lib/datocms/operations';
import { generateBackupEnvironmentId } from '@lib/backup/scheduler';
import { getApiToken } from '@lib/auth/verify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for backup

export async function POST(
  request: NextRequest
): Promise<NextResponse<TriggerBackupResponse | ApiError>> {
  try {
    const body = (await request.json()) as TriggerBackupRequest;
    const { projectId, type = 'manual', options } = body;
    const token = await getApiToken();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    // Get config
    const config = await storage.getConfig(projectId);

    if (!config) {
      return NextResponse.json(
        { error: 'Project not configured' },
        { status: 404 }
      );
    }

    // Verify token
    if (config.apiToken !== token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate environment ID
    const prefix = options?.environmentPrefix || `${type}-backup`;
    const targetEnvironmentId = generateBackupEnvironmentId(prefix);

    // Create the run record
    const run: BackupRun = {
      id: uuidv4(),
      projectId,
      type,
      status: 'in_progress',
      sourceEnvironment: config.sourceEnvironment,
      targetEnvironment: targetEnvironmentId,
      startedAt: new Date().toISOString(),
      metadata: {
        triggeredBy: 'manual',
        note: options?.note,
      },
    };

    // Save initial run state
    await storage.addRun(run);

    // Perform the backup
    const startTime = Date.now();
    const result = await createBackup(
      config.apiToken,
      config.sourceEnvironment,
      targetEnvironmentId
    );
    const duration = Date.now() - startTime;

    // Update run with result
    const completedRun: BackupRun = {
      ...run,
      status: result.success ? 'completed' : 'failed',
      completedAt: new Date().toISOString(),
      duration,
      error: result.error,
      metadata: {
        ...run.metadata,
        environmentId: result.environmentId,
      },
    };

    await storage.updateRun(completedRun);

    return NextResponse.json({
      success: result.success,
      run: completedRun,
      error: result.error,
    });
  } catch (error) {
    console.error('Backup trigger error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger backup' },
      { status: 500 }
    );
  }
}
