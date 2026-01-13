import { Button } from 'datocms-react-ui';

type Props = {
  onNext: () => void;
  onCancel: () => void;
};

// Repository URL for the deploy button
const REPO_URL = 'https://github.com/signifly/datocms-plugin-signifly-backups';

export default function DeployStep({ onNext, onCancel }: Props) {
  const handleDeployClick = () => {
    // Vercel deploy URL with repository
    const stores = JSON.stringify([{ type: 'kv' }]);
    const envDescription = `CRON_SECRET: A secret key for securing cron endpoints.
API_SECRET: A secret key for securing API endpoints (used by the plugin).

Generate both with: openssl rand -hex 32`;

    const deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
      REPO_URL
    )}&root-directory=apps/api&project-name=signifly-datocms-backups&env=CRON_SECRET,API_SECRET&envDescription=${encodeURIComponent(
      envDescription
    )}&envLink=${encodeURIComponent(
      REPO_URL + '#environment-variables'
    )}&stores=${encodeURIComponent(stores)}`;

    window.open(deployUrl, '_blank');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Step 1: Deploy the Backup Service</h2>

      <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: 1.6 }}>
        This plugin requires a backend service to run scheduled backups.
        Click the button below to deploy it to Vercel with one click.
      </p>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
          During deployment, you'll need to:
        </p>
        <ol style={{ textAlign: 'left', fontSize: '0.9rem', color: '#555', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Connect your GitHub account (if not already)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Set <code>CRON_SECRET</code> and <code>API_SECRET</code> - generate secure random strings
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Vercel KV storage will be automatically provisioned
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Copy your deployment URL and <code>API_SECRET</code> after it's complete
          </li>
        </ol>
      </div>

      <Button
        buttonType="primary"
        onClick={handleDeployClick}
        fullWidth
        style={{ marginBottom: '1rem' }}
      >
        Deploy to Vercel
      </Button>

      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
        Already deployed?{' '}
        <button
          onClick={onNext}
          style={{
            background: 'none',
            border: 'none',
            color: '#4a90d9',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Skip to connect
        </button>
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button buttonType="muted" onClick={onCancel}>
          Cancel
        </Button>
        <Button buttonType="primary" onClick={onNext}>
          Next: Connect
        </Button>
      </div>
    </div>
  );
}
