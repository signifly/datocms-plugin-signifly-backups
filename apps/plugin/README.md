![Automatic Environment Backups @ Vercel](https://raw.githubusercontent.com/signifly/datocms-plugin-signifly-backups/main/apps/plugin/docs/cover.png)

# Automatic Environment Backups @ Vercel

A DatoCMS plugin by [Signifly](https://signifly.com) that automatically creates scheduled backups of your environments with full history tracking and configurable retention policies.

## Features

- **Scheduled Backups** - Daily, weekly, and monthly backup schedules with configurable cron expressions
- **Backup History** - Full history with status, duration, and timestamps
- **Manual Backups** - Trigger on-demand backups from the plugin UI
- **Retention Policies** - Automatically clean up old backups based on retention counts
- **One-Click Deploy** - Deploy the backend service to Vercel with a single click

## Quick Start

### 1. Deploy the Backend to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsignifly%2Fdatocms-backup-api-template&project-name=datocms-backup-api&env=CRON_SECRET,API_SECRET&envDescription=CRON_SECRET%3A%20Secret%20for%20cron%20endpoint.%20API_SECRET%3A%20Secret%20for%20API%20endpoints.%20Generate%20both%20with%3A%20openssl%20rand%20-hex%2032&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)

During deployment:
1. Set `CRON_SECRET` and `API_SECRET` (generate with `openssl rand -hex 32`)
2. Vercel KV storage will be automatically provisioned

### 2. Install the Plugin

Install from the [DatoCMS marketplace](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-signifly-backups) or add manually by npm package name.

### 3. Configure

1. Enter your Vercel deployment URL
2. Provide a DatoCMS Full-Access API token
3. Configure your backup schedules

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes | Secret for cron endpoint authentication |
| `API_SECRET` | Yes | Secret for API endpoint authentication |

## Support

- [GitHub Issues](https://github.com/signifly/datocms-plugin-signifly-backups/issues)
- [Documentation](https://github.com/signifly/datocms-plugin-signifly-backups)

## Credits

This plugin is an extended version of [datocms-plugin-automatic-environment-backups](https://www.npmjs.com/package/datocms-plugin-automatic-environment-backups) by [marcelofinaworknate](https://github.com/marcelofinaworknate). We've added Vercel deployment, backup history tracking, and retention policies.

## About Signifly

[Signifly](https://signifly.com) is a digital agency specializing in strategy, design, and technology. We build digital products and experiences that make a difference.

## License

MIT
