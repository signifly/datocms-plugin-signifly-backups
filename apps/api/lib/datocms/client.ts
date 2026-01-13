import { buildClient } from '@datocms/cma-client';

export function createDatoCmsClient(apiToken: string) {
  return buildClient({
    apiToken,
    environment: 'main',
  });
}

export type DatoCmsClient = ReturnType<typeof createDatoCmsClient>;
