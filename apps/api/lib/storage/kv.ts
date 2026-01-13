import { kv } from '@vercel/kv';
import type {
  BackupConfig,
  BackupRun,
  ProjectRegistration,
} from '@signifly/datocms-backup-shared';
import { encrypt, decrypt, isEncrypted } from '../crypto/encryption';

// Key patterns
const keys = {
  config: (projectId: string) => `config:${projectId}`,
  runs: (projectId: string) => `runs:${projectId}`,
  run: (projectId: string, runId: string) => `run:${projectId}:${runId}`,
  project: (projectId: string) => `project:${projectId}`,
  activeProjects: 'projects:active',
};

// Internal type for stored config with encrypted token
interface StoredBackupConfig extends Omit<BackupConfig, 'apiToken'> {
  apiToken: string; // Encrypted
}

// Config operations
export async function getConfig(projectId: string): Promise<BackupConfig | null> {
  const stored = await kv.get<StoredBackupConfig>(keys.config(projectId));

  if (!stored) {
    return null;
  }

  // Decrypt the API token
  try {
    const apiToken = isEncrypted(stored.apiToken)
      ? decrypt(stored.apiToken)
      : stored.apiToken; // Handle legacy unencrypted tokens

    return {
      ...stored,
      apiToken,
    };
  } catch (error) {
    console.error('Failed to decrypt API token:', error);
    return null;
  }
}

export async function setConfig(config: BackupConfig): Promise<void> {
  // Encrypt the API token before storing
  const storedConfig: StoredBackupConfig = {
    ...config,
    apiToken: encrypt(config.apiToken),
  };

  await kv.set(keys.config(config.projectId), storedConfig);
}

export async function deleteConfig(projectId: string): Promise<void> {
  await kv.del(keys.config(projectId));
}

// Project registration
export async function registerProject(registration: ProjectRegistration): Promise<void> {
  await Promise.all([
    kv.set(keys.project(registration.projectId), registration),
    kv.sadd(keys.activeProjects, registration.projectId),
  ]);
}

export async function unregisterProject(projectId: string): Promise<void> {
  await Promise.all([
    kv.del(keys.project(projectId)),
    kv.srem(keys.activeProjects, projectId),
  ]);
}

export async function getActiveProjects(): Promise<string[]> {
  const projects = await kv.smembers(keys.activeProjects);
  return projects as string[];
}

export async function updateProjectActivity(projectId: string): Promise<void> {
  const project = await kv.get<ProjectRegistration>(keys.project(projectId));
  if (project) {
    await kv.set(keys.project(projectId), {
      ...project,
      lastActiveAt: new Date().toISOString(),
    });
  }
}

// Run history operations
export async function addRun(run: BackupRun): Promise<void> {
  const timestamp = new Date(run.startedAt).getTime();
  await Promise.all([
    kv.set(keys.run(run.projectId, run.id), run),
    kv.zadd(keys.runs(run.projectId), { score: timestamp, member: run.id }),
  ]);
}

export async function updateRun(run: BackupRun): Promise<void> {
  await kv.set(keys.run(run.projectId, run.id), run);
}

export async function getRun(projectId: string, runId: string): Promise<BackupRun | null> {
  return kv.get<BackupRun>(keys.run(projectId, runId));
}

export async function getRunHistory(
  projectId: string,
  limit = 50,
  offset = 0
): Promise<{ runs: BackupRun[]; total: number }> {
  // Get total count
  const total = await kv.zcard(keys.runs(projectId));

  // Get run IDs in reverse chronological order
  const runIds = await kv.zrange<string[]>(
    keys.runs(projectId),
    offset,
    offset + limit - 1,
    { rev: true }
  );

  if (!runIds || runIds.length === 0) {
    return { runs: [], total };
  }

  // Fetch all run details
  const runKeys = runIds.map((id) => keys.run(projectId, id));
  const runs = await kv.mget<BackupRun[]>(...runKeys);

  return {
    runs: runs.filter((r): r is BackupRun => r !== null),
    total,
  };
}

export async function deleteRun(projectId: string, runId: string): Promise<void> {
  await Promise.all([
    kv.del(keys.run(projectId, runId)),
    kv.zrem(keys.runs(projectId), runId),
  ]);
}

export async function deleteOldRuns(projectId: string, keepCount: number): Promise<string[]> {
  const total = await kv.zcard(keys.runs(projectId));

  if (total <= keepCount) {
    return [];
  }

  // Get runs to delete (oldest ones beyond keepCount)
  const toDelete = await kv.zrange<string[]>(
    keys.runs(projectId),
    0,
    total - keepCount - 1
  );

  if (!toDelete || toDelete.length === 0) {
    return [];
  }

  // Delete the runs
  await Promise.all(
    toDelete.map((runId) => deleteRun(projectId, runId))
  );

  return toDelete;
}

// Health check
export async function checkKvConnection(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch {
    return false;
  }
}
