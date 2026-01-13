import type { BackupConfig, ScheduledBackupType } from '@datocms-backup/shared';
import { cleanupOldBackups } from '../datocms/operations';
import * as storage from '../storage/kv';

export interface RetentionResult {
  type: ScheduledBackupType;
  deletedEnvironments: string[];
  deletedRuns: string[];
  errors: string[];
}

// Enforce retention policy for a specific backup type
export async function enforceRetention(
  config: BackupConfig,
  type: ScheduledBackupType
): Promise<RetentionResult> {
  const result: RetentionResult = {
    type,
    deletedEnvironments: [],
    deletedRuns: [],
    errors: [],
  };

  const schedule = config.schedules[type];

  if (!schedule?.enabled) {
    return result;
  }

  try {
    // Clean up old DatoCMS environments
    const { deleted, errors } = await cleanupOldBackups(
      config.apiToken,
      schedule.prefix,
      schedule.retentionCount
    );

    result.deletedEnvironments = deleted;
    result.errors = errors;

    // Clean up old run records from KV
    const deletedRuns = await storage.deleteOldRuns(
      config.projectId,
      schedule.retentionCount * 3 // Keep more run records than environments for history
    );
    result.deletedRuns = deletedRuns;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown retention error'
    );
  }

  return result;
}

// Enforce retention for all backup types
export async function enforceAllRetention(
  config: BackupConfig
): Promise<RetentionResult[]> {
  const types: ScheduledBackupType[] = ['daily', 'weekly', 'monthly'];
  const results: RetentionResult[] = [];

  for (const type of types) {
    const result = await enforceRetention(config, type);
    results.push(result);
  }

  return results;
}
