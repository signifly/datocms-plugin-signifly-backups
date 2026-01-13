import { createDatoCmsClient, type DatoCmsClient } from './client';

export interface Environment {
  id: string;
  meta: {
    primary: boolean;
    created_at: string;
  };
}

export async function listEnvironments(client: DatoCmsClient): Promise<Environment[]> {
  const environments = await client.environments.list();
  return environments as Environment[];
}

export async function forkEnvironment(
  client: DatoCmsClient,
  sourceEnvironmentId: string,
  newEnvironmentId: string
): Promise<Environment> {
  const environment = await client.environments.fork(sourceEnvironmentId, {
    id: newEnvironmentId,
  });
  return environment as Environment;
}

export async function deleteEnvironment(
  client: DatoCmsClient,
  environmentId: string
): Promise<void> {
  await client.environments.destroy(environmentId);
}

export async function getEnvironment(
  client: DatoCmsClient,
  environmentId: string
): Promise<Environment | null> {
  try {
    const environment = await client.environments.find(environmentId);
    return environment as Environment;
  } catch {
    return null;
  }
}

export async function environmentExists(
  client: DatoCmsClient,
  environmentId: string
): Promise<boolean> {
  const env = await getEnvironment(client, environmentId);
  return env !== null;
}

// Create a backup by forking the source environment
export async function createBackup(
  apiToken: string,
  sourceEnvironment: string,
  targetEnvironmentId: string
): Promise<{ success: boolean; environmentId?: string; error?: string }> {
  try {
    const client = createDatoCmsClient(apiToken);

    // Check if target already exists
    const exists = await environmentExists(client, targetEnvironmentId);
    if (exists) {
      // Delete existing backup with same name
      await deleteEnvironment(client, targetEnvironmentId);
    }

    // Fork the source environment
    const newEnv = await forkEnvironment(client, sourceEnvironment, targetEnvironmentId);

    return {
      success: true,
      environmentId: newEnv.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Clean up old backup environments based on retention policy
export async function cleanupOldBackups(
  apiToken: string,
  prefix: string,
  keepCount: number
): Promise<{ deleted: string[]; errors: string[] }> {
  const client = createDatoCmsClient(apiToken);
  const environments = await listEnvironments(client);

  // Filter environments matching the prefix, exclude primary
  const backupEnvs = environments
    .filter((env) => env.id.startsWith(prefix) && !env.meta.primary)
    .sort((a, b) =>
      new Date(b.meta.created_at).getTime() - new Date(a.meta.created_at).getTime()
    );

  const deleted: string[] = [];
  const errors: string[] = [];

  // Keep the most recent ones, delete the rest
  const toDelete = backupEnvs.slice(keepCount);

  for (const env of toDelete) {
    try {
      await deleteEnvironment(client, env.id);
      deleted.push(env.id);
    } catch (error) {
      errors.push(`Failed to delete ${env.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { deleted, errors };
}
