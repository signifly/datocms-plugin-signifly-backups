export type { RenderConfigScreenCtx, RenderModalCtx } from 'datocms-plugin-sdk';

export interface PluginParameters {
  installationState?: 'installed' | 'cancelled' | null;
  hasBeenPrompted?: boolean;
  apiUrl?: string;
  projectId?: string;
  apiToken?: string;
}

export type InstallationStep = 'deploy' | 'connect' | 'configure' | 'complete';
