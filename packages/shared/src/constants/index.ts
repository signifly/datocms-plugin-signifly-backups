export const DEFAULT_SCHEDULES = {
  daily: {
    enabled: true,
    cronExpression: '0 2 * * *', // 2 AM UTC daily
    retentionCount: 2,
    prefix: 'daily-backup',
  },
  weekly: {
    enabled: true,
    cronExpression: '0 3 * * 0', // 3 AM UTC Sunday
    retentionCount: 4,
    prefix: 'weekly-backup',
  },
  monthly: {
    enabled: false,
    cronExpression: '0 4 1 * *', // 4 AM UTC 1st of month
    retentionCount: 3,
    prefix: 'monthly-backup',
  },
} as const;

// Max age in days for each backup type (delete older backups regardless of count)
export const MAX_BACKUP_AGE_DAYS = {
  daily: 2,
  weekly: 30,
  monthly: 365,
} as const;

export const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 2 AM', value: '0 2 * * *' },
  { label: 'Daily at 3 AM', value: '0 3 * * *' },
  { label: 'Weekly on Sunday', value: '0 3 * * 0' },
  { label: 'Weekly on Monday', value: '0 3 * * 1' },
  { label: 'First of month', value: '0 4 1 * *' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  cleaned: 'Cleaned',
};

export const BACKUP_TYPE_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  manual: 'Manual',
};

export const API_VERSION = '1.0.0';
