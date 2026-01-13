import type { BackupConfig, BackupRun, BackupType } from './backup';

// Health check
export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  kvConnected: boolean;
  timestamp: string;
}

// Config endpoints
export interface GetConfigResponse {
  config: BackupConfig | null;
}

export interface UpdateConfigRequest {
  projectId: string;
  apiToken: string;
  config: Partial<Omit<BackupConfig, 'projectId' | 'apiToken' | 'createdAt' | 'updatedAt'>>;
}

export interface UpdateConfigResponse {
  success: boolean;
  config: BackupConfig;
}

// Backup trigger
export interface TriggerBackupRequest {
  projectId: string;
  type?: BackupType;
  options?: {
    environmentPrefix?: string;
    note?: string;
  };
}

export interface TriggerBackupResponse {
  success: boolean;
  run: BackupRun;
  error?: string;
}

// Backup history
export interface HistoryQuery {
  projectId: string;
  limit?: number;
  offset?: number;
  type?: BackupType;
  status?: string;
}

export interface HistoryResponse {
  runs: BackupRun[];
  total: number;
  hasMore: boolean;
}

// Cron backup
export interface CronBackupResult {
  projectId: string;
  type: BackupType;
  runId: string;
  status: 'started' | 'skipped' | 'error';
  error?: string;
}

export interface CronBackupResponse {
  success: boolean;
  executed: CronBackupResult[];
  timestamp: string;
}

// API Error
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
