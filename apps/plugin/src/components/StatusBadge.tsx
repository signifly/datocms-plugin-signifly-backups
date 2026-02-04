import { STATUS_LABELS } from '@casperjuel/datocms-backup-shared';

type DisplayStatus = 'pending' | 'in_progress' | 'triggered' | 'completed' | 'failed' | 'cleaned';

type Props = {
  status: DisplayStatus;
};

const statusColors: Record<DisplayStatus, { bg: string; text: string }> = {
  pending: { bg: '#fff3cd', text: '#856404' },
  in_progress: { bg: '#cce5ff', text: '#004085' },
  triggered: { bg: '#e8daef', text: '#6c3483' },
  completed: { bg: '#d4edda', text: '#155724' },
  failed: { bg: '#f8d7da', text: '#721c24' },
  cleaned: { bg: '#e2e3e5', text: '#383d41' },
};

export default function StatusBadge({ status }: Props) {
  const colors = statusColors[status] || statusColors.pending;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
