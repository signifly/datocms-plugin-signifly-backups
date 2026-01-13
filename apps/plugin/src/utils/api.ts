import type {
  HealthResponse,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  TriggerBackupRequest,
  TriggerBackupResponse,
  HistoryResponse,
  BackupConfig,
} from '@casperjuel/datocms-backup-shared';

export class BackupApiClient {
  private baseUrl: string;
  private apiToken: string;
  private apiSecret?: string;

  constructor(baseUrl: string, apiToken: string, apiSecret?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiToken = apiToken;
    this.apiSecret = apiSecret;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    };

    if (this.apiSecret) {
      headers['X-API-Secret'] = this.apiSecret;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
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
    const headers: Record<string, string> = {};
    if (this.apiSecret) {
      headers['X-API-Secret'] = this.apiSecret;
    }
    const response = await fetch(`${this.baseUrl}/api/health`, { headers });
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

// Validation result with more details
export type ValidationResult = {
  success: boolean;
  error?: string;
  kvConnected?: boolean;
};

// Validate API URL by checking health endpoint
export async function validateApiUrl(url: string, apiSecret?: string): Promise<ValidationResult> {
  try {
    const headers: Record<string, string> = {};
    if (apiSecret) {
      headers['X-API-Secret'] = apiSecret;
    }

    const response = await fetch(`${url.replace(/\/$/, '')}/api/health`, { headers });

    if (response.status === 401) {
      return { success: false, error: 'Invalid API Secret. Please check your API_SECRET matches the one in Vercel.' };
    }

    if (!response.ok) {
      return { success: false, error: `Server returned ${response.status}: ${response.statusText}` };
    }

    const data: HealthResponse = await response.json();

    if (data.status === 'ok') {
      return { success: true, kvConnected: data.kvConnected };
    } else {
      return { success: false, error: 'Service is running but KV storage is not connected', kvConnected: false };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Connection failed: ${message}` };
  }
}
