import { Button, Spinner } from 'datocms-react-ui';
import type { BackupRun } from '@datocms-backup/shared';
import { BACKUP_TYPE_LABELS } from '@datocms-backup/shared';
import StatusBadge from './StatusBadge';

type Props = {
  runs: BackupRun[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms?: number): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function RunHistoryTable({ runs, loading, hasMore, onLoadMore }: Props) {
  if (runs.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No backup runs yet.</p>
        <p style={{ fontSize: '0.9rem' }}>
          Backups will appear here once they start running on schedule.
        </p>
      </div>
    );
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Environment</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Time</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '0.75rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  {BACKUP_TYPE_LABELS[run.type] || run.type}
                </span>
              </td>
              <td style={{ padding: '0.75rem' }}>
                <code style={{ fontSize: '0.85rem', color: '#555' }}>
                  {run.targetEnvironment}
                </code>
              </td>
              <td style={{ padding: '0.75rem' }}>
                <StatusBadge status={run.status} />
              </td>
              <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                <span title={formatDate(run.startedAt)}>
                  {getRelativeTime(run.startedAt)}
                </span>
              </td>
              <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                {formatDuration(run.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <Spinner size={24} />
        </div>
      )}

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <Button buttonType="muted" buttonSize="s" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
