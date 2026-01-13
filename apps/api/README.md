# @casperjuel/datocms-backup-api

Backend API utilities for DatoCMS automatic environment backups. Used by the [DatoCMS Backup API Template](https://github.com/signifly/datocms-backup-api-template).

## Installation

```bash
npm install @casperjuel/datocms-backup-api
```

## Quick Start

Deploy your own backup API using our template:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsignifly%2Fdatocms-backup-api-template&project-name=datocms-backup-api&env=CRON_SECRET,API_SECRET&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)

## Usage

This package exports utilities for building DatoCMS backup APIs:

```typescript
import {
  // Storage
  getConfig,
  setConfig,
  addRun,
  getRunHistory,

  // Auth
  verifyCronSecret,
  getApiToken,

  // DatoCMS operations
  createBackup,
  cleanupOldBackups,

  // Scheduling
  getScheduledBackups,
  generateBackupEnvironmentId,
  enforceRetention,

  // Validation
  validateProjectId,
  validateApiTokenFormat,

  // Types
  type BackupConfig,
  type BackupRun,
} from '@casperjuel/datocms-backup-api';
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | Yes | Vercel KV REST API URL |
| `KV_REST_API_TOKEN` | Yes | Vercel KV REST API token |
| `CRON_SECRET` | Yes | Secret for cron endpoint authentication |
| `API_SECRET` | No | Secret for API endpoint authentication |
| `ENCRYPTION_KEY` | No | 64 hex chars for encrypting stored tokens |

## API Endpoints

When used with the template, provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/config` | GET, PUT, DELETE | Configuration management |
| `/api/backup/trigger` | POST | Trigger manual backup |
| `/api/backup/history` | GET | Get backup history |
| `/api/cron/backup` | GET | Cron endpoint (Vercel cron) |

## Related

- [DatoCMS Backup API Template](https://github.com/signifly/datocms-backup-api-template) - Deploy template
- [@casperjuel/datocms-backup-shared](https://www.npmjs.com/package/@casperjuel/datocms-backup-shared) - Shared types

## License

MIT
