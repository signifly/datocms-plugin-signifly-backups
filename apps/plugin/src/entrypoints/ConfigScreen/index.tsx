import { useState } from 'react';
import { Canvas, Button } from 'datocms-react-ui';
import type { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import type { PluginParameters } from '@/types';
import { useBackupApi, useConfig, useHistory, useBackupTrigger } from '@/hooks/useBackupApi';
import HistoryTab from './HistoryTab';
import SettingsTab from './SettingsTab';
import ManualBackupTab from './ManualBackupTab';

type Props = {
  ctx: RenderConfigScreenCtx;
};

type TabId = 'history' | 'settings' | 'manual';

export default function ConfigScreen({ ctx }: Props) {
  const params = ctx.plugin.attributes.parameters as PluginParameters;
  const [activeTab, setActiveTab] = useState<TabId>('history');

  const client = useBackupApi(params.apiUrl, params.apiToken);
  const { config, loading: configLoading, error: configError, updateConfig } = useConfig(
    client,
    params.projectId
  );
  const { runs, total, hasMore, loading: historyLoading, fetchHistory, loadMore } = useHistory(
    client,
    params.projectId
  );
  const {
    trigger: triggerBackup,
    loading: backupLoading,
    error: backupError,
    lastResult,
  } = useBackupTrigger(client, params.projectId);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'history', label: 'Backup History' },
    { id: 'settings', label: 'Settings' },
    { id: 'manual', label: 'Manual Backup' },
  ];

  // Find last successful backup
  const lastSuccessfulBackup = runs.find((r) => r.status === 'completed');
  const lastBackupTime = lastSuccessfulBackup
    ? new Date(lastSuccessfulBackup.completedAt || lastSuccessfulBackup.startedAt)
    : null;

  return (
    <Canvas ctx={ctx}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Automatic Backups</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
            {lastBackupTime
              ? `Last backup: ${lastBackupTime.toLocaleDateString()} at ${lastBackupTime.toLocaleTimeString()}`
              : 'No backups yet'}
          </p>
        </div>
        <Button
          buttonType="muted"
          buttonSize="s"
          onClick={() => ctx.navigateTo('/admin/environments')}
        >
          View Environments
        </Button>
      </div>

      {/* Status Banner */}
      {config && (
        <div
          style={{
            backgroundColor: '#e8f5e9',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#2e7d32' }}>
            ✓ Backups are active
          </span>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>
            {total} total runs
          </span>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '1.5rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #4a90d9' : '2px solid transparent',
              color: activeTab === tab.id ? '#4a90d9' : '#666',
              fontWeight: activeTab === tab.id ? 600 : 400,
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <HistoryTab
          runs={runs}
          loading={historyLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRefresh={() => fetchHistory()}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          config={config}
          loading={configLoading}
          error={configError}
          onUpdate={updateConfig}
        />
      )}

      {activeTab === 'manual' && (
        <ManualBackupTab
          onTrigger={triggerBackup}
          loading={backupLoading}
          error={backupError}
          lastResult={lastResult}
          onRefreshHistory={() => fetchHistory()}
        />
      )}
    </Canvas>
  );
}
