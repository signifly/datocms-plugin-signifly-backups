import { NextRequest, NextResponse } from 'next/server';
import type {
  BackupConfig,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  ApiError,
} from '@datocms-backup/shared';
import { DEFAULT_SCHEDULES } from '@datocms-backup/shared';
import * as storage from '@lib/storage/kv';
import { getApiToken } from '@lib/auth/verify';

export const dynamic = 'force-dynamic';

// GET /api/config?projectId=xxx
export async function GET(
  request: NextRequest
): Promise<NextResponse<GetConfigResponse | ApiError>> {
  const projectId = request.nextUrl.searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'Missing projectId parameter' },
      { status: 400 }
    );
  }

  const config = await storage.getConfig(projectId);

  return NextResponse.json({ config });
}

// PUT /api/config
export async function PUT(
  request: NextRequest
): Promise<NextResponse<UpdateConfigResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateConfigRequest;
    const { projectId, apiToken, config: configUpdates } = body;

    if (!projectId || !apiToken) {
      return NextResponse.json(
        { error: 'Missing projectId or apiToken' },
        { status: 400 }
      );
    }

    // Get existing config or create new one
    const existingConfig = await storage.getConfig(projectId);
    const now = new Date().toISOString();

    const newConfig: BackupConfig = {
      projectId,
      apiToken,
      sourceEnvironment: configUpdates?.sourceEnvironment || existingConfig?.sourceEnvironment || 'main',
      schedules: {
        daily: configUpdates?.schedules?.daily || existingConfig?.schedules?.daily || DEFAULT_SCHEDULES.daily,
        weekly: configUpdates?.schedules?.weekly || existingConfig?.schedules?.weekly || DEFAULT_SCHEDULES.weekly,
        monthly: configUpdates?.schedules?.monthly || existingConfig?.schedules?.monthly || DEFAULT_SCHEDULES.monthly,
      },
      notifications: configUpdates?.notifications || existingConfig?.notifications,
      createdAt: existingConfig?.createdAt || now,
      updatedAt: now,
    };

    await storage.setConfig(newConfig);

    // Register project as active if new
    if (!existingConfig) {
      await storage.registerProject({
        projectId,
        siteName: projectId, // Will be updated with actual site name
        registeredAt: now,
        lastActiveAt: now,
      });
    } else {
      await storage.updateProjectActivity(projectId);
    }

    return NextResponse.json({
      success: true,
      config: newConfig,
    });
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update config' },
      { status: 500 }
    );
  }
}

// DELETE /api/config?projectId=xxx
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean } | ApiError>> {
  const projectId = request.nextUrl.searchParams.get('projectId');
  const token = await getApiToken();

  if (!projectId) {
    return NextResponse.json(
      { error: 'Missing projectId parameter' },
      { status: 400 }
    );
  }

  // Verify the token matches the stored config
  const config = await storage.getConfig(projectId);
  if (!config || config.apiToken !== token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  await storage.deleteConfig(projectId);
  await storage.unregisterProject(projectId);

  return NextResponse.json({ success: true });
}
