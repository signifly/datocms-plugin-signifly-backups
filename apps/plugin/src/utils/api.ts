import type {
  HealthResponse,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  TriggerBackupRequest,
  TriggerBackupResponse,
  HistoryResponse,
  BackupConfig,
} from '@datocms-backup/shared';

export class BackupApiClient {
  private baseUrl: string;
  private apiToken: string;

  constructor(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiToken = apiToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return response.json();
  }

  async getConfig(projectId: string): Promise<GetConfigResponse> {
    return this.request<GetConfigResponse>(`/api/config?projectId=${projectId}`);
  }

  async updateConfig(data: UpdateConfigRequest): Promise<UpdateConfigResponse> {
    return this.request<UpdateConfigResponse>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async triggerBackup(data: TriggerBackupRequest): Promise<TriggerBackupResponse> {
    return this.request<TriggerBackupResponse>('/api/backup/trigger', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHistory(
    projectId: string,
    options: { limit?: number; offset?: number; type?: string; status?: string } = {}
  ): Promise<HistoryResponse> {
    const params = new URLSearchParams({ projectId });

    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.type) params.set('type', options.type);
    if (options.status) params.set('status', options.status);

    return this.request<HistoryResponse>(`/api/backup/history?${params}`);
  }
}

// Validate API URL by checking health endpoint
export async function validateApiUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/api/health`);
    const data: HealthResponse = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
