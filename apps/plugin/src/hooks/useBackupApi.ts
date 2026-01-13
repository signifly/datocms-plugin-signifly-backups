import { useState, useCallback, useEffect } from 'react';
import { BackupApiClient } from '@/utils/api';
import type {
  BackupConfig,
  BackupRun,
  HistoryResponse,
  TriggerBackupResponse,
} from '@casperjuel/datocms-backup-shared';

export function useBackupApi(apiUrl: string | undefined, apiToken: string | undefined) {
  const [client, setClient] = useState<BackupApiClient | null>(null);

  useEffect(() => {
    if (apiUrl && apiToken) {
      setClient(new BackupApiClient(apiUrl, apiToken));
    } else {
      setClient(null);
    }
  }, [apiUrl, apiToken]);

  return client;
}

export function useConfig(
  client: BackupApiClient | null,
  projectId: string | undefined
) {
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!client || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getConfig(projectId);
      setConfig(response.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setLoading(false);
    }
  }, [client, projectId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(
    async (updates: Partial<BackupConfig>) => {
      if (!client || !projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await client.updateConfig({
          projectId,
          apiToken: config?.apiToken || '',
          config: updates,
        });
        setConfig(response.config);
        return response.config;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update config');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, projectId, config?.apiToken]
  );

  return { config, loading, error, fetchConfig, updateConfig };
}

export function useHistory(
  client: BackupApiClient | null,
  projectId: string | undefined
) {
  const [runs, setRuns] = useState<BackupRun[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (options: { limit?: number; offset?: number; append?: boolean } = {}) => {
      if (!client || !projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await client.getHistory(projectId, {
          limit: options.limit || 20,
          offset: options.offset || 0,
        });

        if (options.append) {
          setRuns((prev) => [...prev, ...response.runs]);
        } else {
          setRuns(response.runs);
        }

        setTotal(response.total);
        setHasMore(response.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    },
    [client, projectId]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadMore = useCallback(() => {
    fetchHistory({ offset: runs.length, append: true });
  }, [fetchHistory, runs.length]);

  return { runs, total, hasMore, loading, error, fetchHistory, loadMore };
}

export function useBackupTrigger(
  client: BackupApiClient | null,
  projectId: string | undefined
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TriggerBackupResponse | null>(null);

  const trigger = useCallback(
    async (options?: { note?: string }) => {
      if (!client || !projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await client.triggerBackup({
          projectId,
          type: 'manual',
          options,
        });
        setLastResult(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to trigger backup';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, projectId]
  );

  return { trigger, loading, error, lastResult };
}
