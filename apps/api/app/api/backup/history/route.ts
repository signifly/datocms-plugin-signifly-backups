import { NextRequest, NextResponse } from 'next/server';
import type { HistoryResponse, ApiError } from '@datocms-backup/shared';
import * as storage from '@lib/storage/kv';
import { getApiToken } from '@lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest
): Promise<NextResponse<HistoryResponse | ApiError>> {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const typeFilter = searchParams.get('type');
  const statusFilter = searchParams.get('status');

  const token = await getApiToken();

  if (!projectId) {
    return NextResponse.json(
      { error: 'Missing projectId parameter' },
      { status: 400 }
    );
  }

  // Verify token matches config
  const config = await storage.getConfig(projectId);

  if (!config) {
    return NextResponse.json(
      { error: 'Project not configured' },
      { status: 404 }
    );
  }

  if (config.apiToken !== token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get run history
  const { runs, total } = await storage.getRunHistory(projectId, limit + 1, offset);

  // Apply filters
  let filteredRuns = runs;

  if (typeFilter) {
    filteredRuns = filteredRuns.filter((run) => run.type === typeFilter);
  }

  if (statusFilter) {
    filteredRuns = filteredRuns.filter((run) => run.status === statusFilter);
  }

  // Check if there are more results
  const hasMore = runs.length > limit;
  const resultRuns = filteredRuns.slice(0, limit);

  return NextResponse.json({
    runs: resultRuns,
    total,
    hasMore,
  });
}
