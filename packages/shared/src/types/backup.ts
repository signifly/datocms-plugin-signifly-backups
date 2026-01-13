export type BackupStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cleaned';

export type ScheduledBackupType = 'daily' | 'weekly' | 'monthly';
export type BackupType = ScheduledBackupType | 'manual';

export type TriggerSource = 'cron' | 'manual';

export interface BackupRun {
  id: string;
  projectId: string;
  type: BackupType;
  status: BackupStatus;
  sourceEnvironment: string;
  targetEnvironment: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  metadata?: BackupRunMetadata;
}

export interface BackupRunMetadata {
  triggeredBy?: TriggerSource;
  userId?: string;
  environmentId?: string;
  retainUntil?: string;
  note?: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string;
  retentionCount: number;
  prefix: string;
}

export interface BackupConfig {
  projectId: string;
  apiToken: string;
  sourceEnvironment: string;
  schedules: {
    daily?: ScheduleConfig;
    weekly?: ScheduleConfig;
    monthly?: ScheduleConfig;
  };
  notifications?: NotificationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationConfig {
  onSuccess: boolean;
  onFailure: boolean;
  webhookUrl?: string;
}

export interface ProjectRegistration {
  projectId: string;
  siteName: string;
  registeredAt: string;
  lastActiveAt: string;
}
