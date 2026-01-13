import { buildClient } from '@datocms/cma-client';

// Create a DatoCMS client without specifying an environment
// This allows site-level operations like listing/forking environments
export function createDatoCmsClient(apiToken: string) {
  return buildClient({
    apiToken,
  });
}

export type DatoCmsClient = ReturnType<typeof createDatoCmsClient>;
