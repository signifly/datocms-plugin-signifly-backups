import { Button } from 'datocms-react-ui';
import type { BackupRun } from '@datocms-backup/shared';
import RunHistoryTable from '@/components/RunHistoryTable';

type Props = {
  runs: BackupRun[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
};

export default function HistoryTab({ runs, loading, hasMore, onLoadMore, onRefresh }: Props) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0 }}>Recent Backups</h3>
        <Button buttonType="muted" buttonSize="s" onClick={onRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      <RunHistoryTable
        runs={runs}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}
