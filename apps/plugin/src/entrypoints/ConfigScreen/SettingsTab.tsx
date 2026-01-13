import { useState } from 'react';
import { Button, Spinner, SwitchField, TextField } from 'datocms-react-ui';
import type { BackupConfig, ScheduleConfig } from '@datocms-backup/shared';
import { CRON_PRESETS } from '@datocms-backup/shared';
import Select from '@/components/Select';

type Props = {
  config: BackupConfig | null;
  loading: boolean;
  error: string | null;
  onUpdate: (updates: Partial<BackupConfig>) => Promise<BackupConfig | undefined>;
};

export default function SettingsTab({ config, loading, error, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<BackupConfig | null>(config);

  // Update local config when prop changes
  if (config && !localConfig) {
    setLocalConfig(config);
  }

  const handleSave = async () => {
    if (!localConfig) return;

    setSaving(true);
    setSaveError(null);

    try {
      await onUpdate({
        schedules: localConfig.schedules,
        notifications: localConfig.notifications,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateSchedule = (
    type: 'daily' | 'weekly' | 'monthly',
    field: keyof ScheduleConfig,
    value: boolean | string | number
  ) => {
    if (!localConfig) return;

    setLocalConfig({
      ...localConfig,
      schedules: {
        ...localConfig.schedules,
        [type]: {
          ...localConfig.schedules[type],
          [field]: value,
        },
      },
    });
  };

  const cronOptions = CRON_PRESETS.map((preset) => ({
    label: preset.label,
    value: preset.value,
  }));

  if (loading && !localConfig) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (error && !localConfig) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#c62828' }}>
        <p>Failed to load configuration: {error}</p>
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No configuration found.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Backup Schedules</h3>

      {/* Daily */}
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
          value={localConfig.schedules.daily?.enabled ?? false}
          onChange={(value) => updateSchedule('daily', 'enabled', value)}
        />

        {localConfig.schedules.daily?.enabled && (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              id="dailyCron"
              name="dailyCron"
              label="Schedule"
              value={localConfig.schedules.daily.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('daily', 'cronExpression', value)}
            />
            <TextField
              id="dailyRetention"
              name="dailyRetention"
              label="Retention (keep last N)"
              value={String(localConfig.schedules.daily.retentionCount)}
              onChange={(value) =>
                updateSchedule('daily', 'retentionCount', parseInt(value) || 7)
              }
            />
          </div>
        )}
      </div>

      {/* Weekly */}
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
          value={localConfig.schedules.weekly?.enabled ?? false}
          onChange={(value) => updateSchedule('weekly', 'enabled', value)}
        />

        {localConfig.schedules.weekly?.enabled && (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              id="weeklyCron"
              name="weeklyCron"
              label="Schedule"
              value={localConfig.schedules.weekly.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('weekly', 'cronExpression', value)}
            />
            <TextField
              id="weeklyRetention"
              name="weeklyRetention"
              label="Retention (keep last N)"
              value={String(localConfig.schedules.weekly.retentionCount)}
              onChange={(value) =>
                updateSchedule('weekly', 'retentionCount', parseInt(value) || 4)
              }
            />
          </div>
        )}
      </div>

      {/* Monthly */}
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
          value={localConfig.schedules.monthly?.enabled ?? false}
          onChange={(value) => updateSchedule('monthly', 'enabled', value)}
        />

        {localConfig.schedules.monthly?.enabled && (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              id="monthlyCron"
              name="monthlyCron"
              label="Schedule"
              value={localConfig.schedules.monthly.cronExpression}
              options={cronOptions}
              onChange={(value) => updateSchedule('monthly', 'cronExpression', value)}
            />
            <TextField
              id="monthlyRetention"
              name="monthlyRetention"
              label="Retention (keep last N)"
              value={String(localConfig.schedules.monthly.retentionCount)}
              onChange={(value) =>
                updateSchedule('monthly', 'retentionCount', parseInt(value) || 3)
              }
            />
          </div>
        )}
      </div>

      {saveError && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {saveError}
        </div>
      )}

      <Button buttonType="primary" onClick={handleSave} disabled={saving}>
        {saving ? <Spinner size={16} /> : 'Save Settings'}
      </Button>
    </div>
  );
}
