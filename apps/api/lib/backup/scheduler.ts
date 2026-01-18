import { parseExpression } from 'cron-parser';
import { randomBytes } from 'crypto';
import type { BackupConfig, BackupType, ScheduledBackupType, ScheduleConfig } from '@casperjuel/datocms-backup-shared';

export interface ScheduledBackup {
  type: ScheduledBackupType;
  schedule: ScheduleConfig;
}

// Check if a backup was already triggered within its period
// Daily: once per calendar day (UTC)
// Weekly: once per 7 days
// Monthly: once per 30 days
export function wasAlreadyTriggered(
  type: ScheduledBackupType,
  lastTriggered: Date | null,
  now: Date = new Date()
): boolean {
  if (!lastTriggered) return false;

  const msPerDay = 24 * 60 * 60 * 1000;
  const timeSinceLastRun = now.getTime() - lastTriggered.getTime();

  switch (type) {
    case 'daily':
      // Check if last run was on same calendar day (UTC)
      return lastTriggered.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    case 'weekly':
      return timeSinceLastRun < 7 * msPerDay;
    case 'monthly':
      return timeSinceLastRun < 30 * msPerDay;
    default:
      return false;
  }
}

// Get the next scheduled time for a cron expression
export function getNextRunTime(cronExpression: string, now: Date = new Date()): Date | null {
  try {
    const interval = parseExpression(cronExpression, {
      currentDate: now,
      utc: true,
    });
    return interval.next().toDate();
  } catch {
    return null;
  }
}

// Determine which backups need to run for a project
// Simple logic: if enabled and not already triggered this period, run it
export function getScheduledBackups(
  config: BackupConfig,
  lastRuns: Record<BackupType, Date | null>
): ScheduledBackup[] {
  const backups: ScheduledBackup[] = [];
  const now = new Date();

  const scheduleTypes: ScheduledBackupType[] = ['daily', 'weekly', 'monthly'];

  for (const type of scheduleTypes) {
    const schedule = config.schedules[type];

    if (schedule?.enabled) {
      const lastRun = lastRuns[type];

      // Only run if we haven't already triggered one this period
      if (!wasAlreadyTriggered(type, lastRun, now)) {
        backups.push({ type, schedule });
      }
    }
  }

  return backups;
}

// Generate environment ID for a backup with unique suffix to prevent collisions
export function generateBackupEnvironmentId(prefix: string, date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toISOString().split('T')[1].slice(0, 5).replace(':', ''); // HHMM
  const uniqueSuffix = randomBytes(3).toString('hex'); // 6 character hex string
  return `${prefix}-${dateStr}-${timeStr}-${uniqueSuffix}`;
}

// Validate cron expression
export function isValidCronExpression(expression: string): boolean {
  try {
    parseExpression(expression);
    return true;
  } catch {
    return false;
  }
}

// Parse cron expression to human-readable format
export function describeCronExpression(expression: string): string {
  try {
    const parts = expression.split(' ');
    if (parts.length !== 5) return expression;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Simple cases
    if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Every hour';
    }

    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      if (hour.includes('/')) {
        const interval = hour.split('/')[1];
        return `Every ${interval} hours`;
      }
      return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }

    if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[parseInt(dayOfWeek)] || dayOfWeek;
      return `Every ${dayName} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }

    if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
      return `Monthly on day ${dayOfMonth} at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
    }

    return expression;
  } catch {
    return expression;
  }
}
