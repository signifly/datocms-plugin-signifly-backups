import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  BackupRun,
  BackupType,
  CronBackupResponse,
  CronBackupResult,
} from '@casperjuel/datocms-backup-shared';
import * as storage from '@lib/storage/kv';
import { verifyCronSecret } from '@lib/auth/verify';
import { createBackup } from '@lib/datocms/operations';
import { getScheduledBackups, generateBackupEnvironmentId } from '@lib/backup/scheduler';
import { enforceRetention } from '@lib/backup/retention';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing multiple projects

export async function GET(): Promise<NextResponse<CronBackupResponse | { error: string }>> {
  // Verify cron secret
  const isAuthorized = await verifyCronSecret();

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const results: CronBackupResult[] = [];
  const timestamp = new Date().toISOString();

  console.log(`[CRON] Backup cron started at ${timestamp}`);

  try {
    // Get all active projects
    const projectIds = await storage.getActiveProjects();
    console.log(`[CRON] Found ${projectIds.length} active projects`);

    for (const projectId of projectIds) {
      try {
        // Get project config
        const config = await storage.getConfig(projectId);

        if (!config) {
          console.log(`[CRON] No config found for project ${projectId}, skipping`);
          continue;
        }

        // Get last runs for each type
        const { runs } = await storage.getRunHistory(projectId, 100, 0);
        const lastRuns: Record<BackupType, Date | null> = {
          daily: null,
          weekly: null,
          monthly: null,
          manual: null,
        };

        for (const run of runs) {
          // Count both completed and in_progress runs to prevent duplicates
          // if status updates fail
          if ((run.status === 'completed' || run.status === 'in_progress') && !lastRuns[run.type]) {
            lastRuns[run.type] = new Date(run.startedAt);
          }
        }

        // Determine which backups should run
        const scheduledBackups = getScheduledBackups(config, lastRuns);
        console.log(`[CRON] Project ${projectId}: ${scheduledBackups.length} backups due`);

        // Only run ONE backup per cron to avoid timeout (backups take ~200s each)
        // Priority: daily > weekly > monthly
        const backupToRun = scheduledBackups[0];
        if (!backupToRun) continue;

        const backupsToProcess = [backupToRun];
        for (const backup of backupsToProcess) {
          const targetEnvironmentId = generateBackupEnvironmentId(backup.schedule.prefix);

          // Create run record
          const run: BackupRun = {
            id: uuidv4(),
            projectId,
            type: backup.type,
            status: 'in_progress',
            sourceEnvironment: config.sourceEnvironment,
            targetEnvironment: targetEnvironmentId,
            startedAt: new Date().toISOString(),
            metadata: {
              triggeredBy: 'cron',
            },
          };

          await storage.addRun(run);

          // Perform backup
          const startTime = Date.now();
          const result = await createBackup(
            config.apiToken,
            config.sourceEnvironment,
            targetEnvironmentId
          );
          const duration = Date.now() - startTime;

          // Update run
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

          try {
            await storage.updateRun(completedRun);
          } catch (updateError) {
            console.error(`[CRON] Failed to update run status for ${run.id}:`, updateError);
          }

          results.push({
            projectId,
            type: backup.type,
            runId: run.id,
            status: result.success ? 'started' : 'error',
            error: result.error,
          });

          console.log(
            `[CRON] Project ${projectId}: ${backup.type} backup ${result.success ? 'completed' : 'failed'}`
          );

          // Enforce retention after successful backup
          if (result.success) {
            try {
              const retentionResult = await enforceRetention(config, backup.type);
              console.log(
                `[CRON] Project ${projectId}: cleaned up ${retentionResult.deletedEnvironments.length} old environments`
              );
            } catch (error) {
              console.error(`[CRON] Retention cleanup error:`, error);
            }
          }
        }

        // Update project activity
        await storage.updateProjectActivity(projectId);
      } catch (error) {
        console.error(`[CRON] Error processing project ${projectId}:`, error);
        results.push({
          projectId,
          type: 'daily',
          runId: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[CRON] Backup cron completed. Processed ${results.length} backups`);

    return NextResponse.json({
      success: true,
      executed: results,
      timestamp,
    });
  } catch (error) {
    console.error('[CRON] Critical error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron job failed' },
      { status: 500 }
    );
  }
}
