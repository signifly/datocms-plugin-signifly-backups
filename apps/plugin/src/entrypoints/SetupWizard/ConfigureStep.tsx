import { useState } from 'react';
import { Button, Spinner, SwitchField, TextField } from 'datocms-react-ui';
import { BackupApiClient } from '@/utils/api';
import { DEFAULT_SCHEDULES, CRON_PRESETS } from '@signifly/datocms-backup-shared';
import type { ScheduleConfig } from '@signifly/datocms-backup-shared';
import Select from '@/components/Select';

type Props = {
  apiUrl: string;
  apiToken: string;
  apiSecret?: string;
  projectId: string;
  onComplete: () => void;
  onBack: () => void;
};

type ScheduleState = {
  daily: ScheduleConfig;
  weekly: ScheduleConfig;
  monthly: ScheduleConfig;
};

export default function ConfigureStep({
  apiUrl,
  apiToken,
  apiSecret,
  projectId,
  onComplete,
  onBack,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleState>({
    daily: { ...DEFAULT_SCHEDULES.daily },
    weekly: { ...DEFAULT_SCHEDULES.weekly },
    monthly: { ...DEFAULT_SCHEDULES.monthly },
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const client = new BackupApiClient(apiUrl, apiToken, apiSecret);

      await client.updateConfig({
        projectId,
        apiToken,
        config: {
          sourceEnvironment: 'main',
          schedules,
        },
      });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateSchedule = (
    type: keyof ScheduleState,
    field: keyof ScheduleConfig,
    value: boolean | string | number
  ) => {
    setSchedules((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const cronOptions = CRON_PRESETS.map((preset) => ({
    label: preset.label,
    value: preset.value,
  }));

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Step 3: Configure Backup Schedule
      </h2>

      <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
        Set up your backup schedules. You can always change these later in settings.
      </p>

      {/* Daily Backups */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <SwitchField
          id="dailyEnabled"
          name="dailyEnabled"
          label="Daily Backups"
          value={schedules.daily.enabled}
          onChange={(value) => updateSchedule('daily', 'enabled', value)}
        />

        {schedules.daily.enabled && (
          <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            <Select
              id="dailyCron"
              name="dailyCron"
              label="Schedule"
              value={schedules.daily.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('daily', 'cronExpression', value)}
            />
            <div style={{ marginTop: '1rem' }}>
              <TextField
                id="dailyRetention"
                name="dailyRetention"
                label="Keep last N backups"
                value={String(schedules.daily.retentionCount)}
                onChange={(value) =>
                  updateSchedule('daily', 'retentionCount', parseInt(value) || 7)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Weekly Backups */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <SwitchField
          id="weeklyEnabled"
          name="weeklyEnabled"
          label="Weekly Backups"
          value={schedules.weekly.enabled}
          onChange={(value) => updateSchedule('weekly', 'enabled', value)}
        />

        {schedules.weekly.enabled && (
          <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            <Select
              id="weeklyCron"
              name="weeklyCron"
              label="Schedule"
              value={schedules.weekly.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('weekly', 'cronExpression', value)}
            />
            <div style={{ marginTop: '1rem' }}>
              <TextField
                id="weeklyRetention"
                name="weeklyRetention"
                label="Keep last N backups"
                value={String(schedules.weekly.retentionCount)}
                onChange={(value) =>
                  updateSchedule('weekly', 'retentionCount', parseInt(value) || 4)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Monthly Backups */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <SwitchField
          id="monthlyEnabled"
          name="monthlyEnabled"
          label="Monthly Backups"
          value={schedules.monthly.enabled}
          onChange={(value) => updateSchedule('monthly', 'enabled', value)}
        />

        {schedules.monthly.enabled && (
          <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            <Select
              id="monthlyCron"
              name="monthlyCron"
              label="Schedule"
              value={schedules.monthly.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('monthly', 'cronExpression', value)}
            />
            <div style={{ marginTop: '1rem' }}>
              <TextField
                id="monthlyRetention"
                name="monthlyRetention"
                label="Keep last N backups"
                value={String(schedules.monthly.retentionCount)}
                onChange={(value) =>
                  updateSchedule('monthly', 'retentionCount', parseInt(value) || 3)
                }
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <Button buttonType="muted" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button buttonType="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size={16} /> : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}
