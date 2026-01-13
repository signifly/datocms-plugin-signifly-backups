import { useState } from 'react';
import { Button, Spinner, TextField } from 'datocms-react-ui';
import type { TriggerBackupResponse } from '@casperjuel/datocms-backup-shared';
import StatusBadge from '@/components/StatusBadge';

type Props = {
  onTrigger: (options?: { note?: string }) => Promise<TriggerBackupResponse | undefined>;
  loading: boolean;
  error: string | null;
  lastResult: TriggerBackupResponse | null;
  onRefreshHistory: () => void;
};

export default function ManualBackupTab({
  onTrigger,
  loading,
  error,
  lastResult,
  onRefreshHistory,
}: Props) {
  const [note, setNote] = useState('');

  const handleTrigger = async () => {
    await onTrigger({ note: note || undefined });
    setNote('');
    onRefreshHistory();
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Trigger Manual Backup</h3>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Create an on-demand backup of your main environment. Manual backups are labeled
        differently from scheduled backups and won't be automatically cleaned up.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <TextField
          id="backupNote"
          name="backupNote"
          label="Note (optional)"
          placeholder="e.g., Before major content update"
          value={note}
          onChange={setNote}
          hint="Add a note to help identify this backup later"
        />
      </div>

      <Button
        buttonType="primary"
        onClick={handleTrigger}
        disabled={loading}
        style={{ marginBottom: '1.5rem' }}
      >
        {loading ? (
          <>
            <Spinner size={16} /> Creating Backup...
          </>
        ) : (
          'Create Backup Now'
        )}
      </Button>

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
          <strong>Backup failed:</strong> {error}
        </div>
      )}

      {lastResult && (
        <div
          style={{
            backgroundColor: lastResult.success ? '#e8f5e9' : '#ffebee',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem' }}>
            {lastResult.success ? 'Backup Created' : 'Backup Failed'}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#666' }}>Status:</span>
            <StatusBadge status={lastResult.run.status} />

            <span style={{ color: '#666' }}>Environment:</span>
            <code style={{ fontSize: '0.85rem' }}>{lastResult.run.targetEnvironment}</code>

            <span style={{ color: '#666' }}>Duration:</span>
            <span>{lastResult.run.duration ? `${(lastResult.run.duration / 1000).toFixed(1)}s` : '-'}</span>

            {lastResult.error && (
              <>
                <span style={{ color: '#666' }}>Error:</span>
                <span style={{ color: '#c62828' }}>{lastResult.error}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
