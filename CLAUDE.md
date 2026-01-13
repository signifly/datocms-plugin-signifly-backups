# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all dev servers (plugin + api)
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm clean            # Clean all build artifacts
```

### Individual Apps

```bash
# Plugin (apps/plugin)
cd apps/plugin
pnpm dev              # Vite dev server at localhost:5173
pnpm build            # Build to dist/

# API (apps/api)
cd apps/api
pnpm dev              # Next.js dev at localhost:3001
pnpm build            # Build for production
```

## Architecture

This is a pnpm monorepo with Turborepo containing:

### `apps/plugin` - DatoCMS Plugin UI
React 19 + Vite + TypeScript plugin that renders in DatoCMS admin.

**Entry point**: `src/index.tsx` - Connects to DatoCMS plugin SDK with hooks:
- `onBoot` - Opens setup wizard on first install
- `renderConfigScreen` - Main settings UI or setup prompt
- `renderModal` - Setup wizard modal

**Key directories**:
- `src/entrypoints/SetupWizard/` - Multi-step installation wizard (deploy, connect, configure)
- `src/entrypoints/ConfigScreen/` - Main settings with tabs (history, settings, manual backup)
- `src/components/` - Reusable UI components (StatusBadge, RunHistoryTable, Select)
- `src/hooks/` - API client hooks (useBackupApi, useConfig, useHistory)

### `apps/api` - Vercel Backend
Next.js 15 App Router API that handles scheduled backups.

**API Routes** (`app/api/`):
- `cron/backup/route.ts` - Vercel cron endpoint (hourly, checks each project's schedule)
- `backup/trigger/route.ts` - Manual backup trigger
- `backup/history/route.ts` - Paginated history from Vercel KV
- `config/route.ts` - Configuration CRUD
- `health/route.ts` - Connection validation

**Libraries** (`lib/`):
- `datocms/` - CMA client and environment operations (fork, delete, list)
- `storage/kv.ts` - Vercel KV wrapper for config and run history
- `backup/scheduler.ts` - Cron expression parsing and schedule logic
- `backup/retention.ts` - Cleanup old backups per retention policy
- `auth/verify.ts` - CRON_SECRET and API token verification

### `packages/shared` - Shared Types
TypeScript types used by both apps:
- `types/backup.ts` - BackupRun, BackupConfig, ScheduleConfig
- `types/api.ts` - API request/response types
- `constants/index.ts` - Default schedules, cron presets, labels

## Plugin State

Plugin parameters stored via `ctx.plugin.attributes.parameters`:
- `installationState: 'installed' | 'cancelled' | null`
- `hasBeenPrompted: boolean` - Prevents re-showing wizard
- `apiUrl: string` - Vercel deployment URL
- `apiToken: string` - DatoCMS full-access token
- `projectId: string` - DatoCMS site ID

## Data Storage (Vercel KV)

Key patterns:
- `config:{projectId}` - BackupConfig JSON
- `runs:{projectId}` - Sorted set of run IDs by timestamp
- `run:{projectId}:{runId}` - BackupRun JSON
- `projects:active` - Set of active project IDs

## Key Dependencies

- `datocms-plugin-sdk` / `datocms-react-ui` - DatoCMS plugin framework
- `@datocms/cma-client` - DatoCMS Content Management API
- `@vercel/kv` - Vercel KV (Redis) client
- `cron-parser` - Parse cron expressions for scheduling logic

## Branding

This plugin is developed by [Signifly](https://signifly.com).
Repository: https://github.com/signifly/datocms-plugin-signifly-backups
