# @casperjuel/datocms-backup-shared

Shared TypeScript types and constants for the DatoCMS automatic backup system.

## Installation

```bash
npm install @casperjuel/datocms-backup-shared
```

## Usage

```typescript
import type { BackupConfig, BackupRun, BackupType } from '@casperjuel/datocms-backup-shared';
import { API_VERSION, DEFAULT_SCHEDULES } from '@casperjuel/datocms-backup-shared';
```

## Exports

### Types
- `BackupConfig` - Configuration for a project's backup settings
- `BackupRun` - Record of a single backup execution
- `BackupType` - `'daily' | 'weekly' | 'monthly' | 'manual'`
- `ScheduleConfig` - Configuration for a scheduled backup type
- `HealthResponse`, `ApiError`, `TriggerBackupRequest`, etc.

### Constants
- `API_VERSION` - Current API version
- `DEFAULT_SCHEDULES` - Default schedule configurations
- `CRON_PRESETS` - Common cron expression presets

## Related Packages

- [@casperjuel/datocms-backup-api](https://www.npmjs.com/package/@casperjuel/datocms-backup-api) - API utilities

## License

MIT
