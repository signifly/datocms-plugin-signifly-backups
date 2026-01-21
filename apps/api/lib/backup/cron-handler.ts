import { v4 as uuidv4 } from 'uuid';
import type {
  BackupRun,
  BackupType,
  CronBackupResponse,
  CronBackupResult,
} from '@casperjuel/datocms-backup-shared';
import * as storage from '../storage/kv';
import { createBackup } from '../datocms/operations';
import { getScheduledBackups, generateBackupEnvironmentId } from './scheduler';
import { enforceRetention } from './retention';

/**
 * Main cron handler function - call this from your cron route
 * All logic is in the package so updates are applied on redeploy
 */
export async function handleCronBackup(): Promise<CronBackupResponse> {
  const results: CronBackupResult[] = [];
  const timestamp = new Date().toISOString();

  console.log(`[CRON] Backup cron started at ${timestamp}`);

  const projectIds = await storage.getActiveProjects();
  console.log(`[CRON] Found ${projectIds.length} active projects`);

  for (const projectId of projectIds) {
    try {
      const config = await storage.getConfig(projectId);

      if (!config) {
        console.log(`[CRON] No config found for project ${projectId}, skipping`);
        continue;
      }

      // Get run history and find last triggered time for each type
      const { runs } = await storage.getRunHistory(projectId, 100, 0);
      const lastRuns: Record<BackupType, Date | null> = {
        daily: null,
        weekly: null,
        monthly: null,
        manual: null,
      };

      for (const run of runs) {
        // Track when each type was last triggered (any status)
        // We only care if we already started one, not whether it succeeded
        if (!lastRuns[run.type]) {
          lastRuns[run.type] = new Date(run.startedAt);
        }
      }

      // Determine which backups should run
      const scheduledBackups = getScheduledBackups(config, lastRuns);
      console.log(`[CRON] Project ${projectId}: ${scheduledBackups.length} backups due`);

      // Only run ONE backup per cron to avoid timeout (backups take ~200s each)
      const backupToRun = scheduledBackups[0];
      if (!backupToRun) continue;

      const targetEnvironmentId = generateBackupEnvironmentId(backupToRun.schedule.prefix);

      // Create run record
      const run: BackupRun = {
        id: uuidv4(),
        projectId,
        type: backupToRun.type,
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

      // Update run status
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
        type: backupToRun.type,
        runId: run.id,
        status: result.success ? 'started' : 'error',
        error: result.error,
      });

      console.log(
        `[CRON] Project ${projectId}: ${backupToRun.type} backup ${result.success ? 'completed' : 'failed'}`
      );

      // Enforce retention after successful backup
      if (result.success) {
        try {
          const retentionResult = await enforceRetention(config, backupToRun.type);
          console.log(
            `[CRON] Project ${projectId}: cleaned up ${retentionResult.deletedEnvironments.length} old environments`
          );
        } catch (error) {
          console.error(`[CRON] Retention cleanup error:`, error);
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

  return {
    success: true,
    executed: results,
    timestamp,
  };
}
