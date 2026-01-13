// Main entry point for @casperjuel/datocms-backup-api

// Re-export everything from lib modules
export * from './lib/storage/kv';
export * from './lib/auth/verify';
export * from './lib/datocms/index';
export * from './lib/backup/index';
export * from './lib/crypto/encryption';
export * from './lib/validation/index';

// Export middleware
export { middleware, config as middlewareConfig } from './middleware';

// Re-export types and constants from shared
export {
  API_VERSION,
  DEFAULT_SCHEDULES,
  CRON_PRESETS,
} from '@casperjuel/datocms-backup-shared';

export type {
  BackupConfig,
  BackupRun,
  BackupType,
  ScheduledBackupType,
  ScheduleConfig,
  HealthResponse,
  ApiError,
  TriggerBackupRequest,
  TriggerBackupResponse,
  HistoryResponse,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  CronBackupResponse,
  CronBackupResult,
  ProjectRegistration,
} from '@casperjuel/datocms-backup-shared';
