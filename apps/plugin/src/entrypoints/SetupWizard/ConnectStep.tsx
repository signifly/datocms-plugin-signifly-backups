import { useState } from 'react';
import { Button, TextField, Spinner } from 'datocms-react-ui';
import { validateApiUrl } from '@/utils/api';

type Props = {
  apiUrl: string;
  apiToken: string;
  apiSecret: string;
  onApiUrlChange: (url: string) => void;
  onApiTokenChange: (token: string) => void;
  onApiSecretChange: (secret: string) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
};

export default function ConnectStep({
  apiUrl,
  apiToken,
  apiSecret,
  onApiUrlChange,
  onApiTokenChange,
  onApiSecretChange,
  onNext,
  onBack,
  onCancel,
}: Props) {
  const [validating, setValidating] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [kvConnected, setKvConnected] = useState(false);

  const handleValidate = async () => {
    if (!apiUrl) {
      setUrlError('Please enter your deployment URL');
      return;
    }

    setValidating(true);
    setUrlError(null);

    const result = await validateApiUrl(apiUrl, apiSecret || undefined);

    setValidating(false);

    if (result.success) {
      setValidated(true);
      setKvConnected(result.kvConnected ?? false);
    } else {
      setUrlError(result.error || 'Could not connect to the backup service.');
    }
  };

  const handleNext = () => {
    if (!apiToken) {
      setUrlError('Please enter your DatoCMS API token');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Step 2: Connect Your Service
      </h2>

      <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
        Enter the URL of your deployed backup service and your DatoCMS API token.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <TextField
          id="apiUrl"
          name="apiUrl"
          label="Deployment URL"
          placeholder="https://your-project.vercel.app"
          value={apiUrl}
          onChange={(value) => {
            onApiUrlChange(value);
            setValidated(false);
            setUrlError(null);
          }}
          error={urlError || undefined}
          hint="The URL of your Vercel deployment"
        />

        <div style={{ marginTop: '0.5rem' }}>
          {validated ? (
            <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
              ✓ Connection verified{kvConnected ? ' (KV storage connected)' : ''}
            </span>
          ) : (
            <Button
              buttonType="muted"
              buttonSize="s"
              onClick={handleValidate}
              disabled={validating || !apiUrl}
            >
              {validating ? <Spinner size={16} /> : 'Validate Connection'}
            </Button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <TextField
          id="apiSecret"
          name="apiSecret"
          label="API Secret (optional)"
          placeholder="Enter your API_SECRET from Vercel"
          value={apiSecret}
          onChange={(value) => {
            onApiSecretChange(value);
            setValidated(false);
          }}
          hint="Only required if you set API_SECRET in your Vercel environment variables"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <TextField
          id="apiToken"
          name="apiToken"
          label="DatoCMS Full-Access API Token"
          placeholder="Enter your API token"
          value={apiToken}
          onChange={onApiTokenChange}
          hint={
            <>
              Required to create environment backups.{' '}
              <a
                href="https://www.datocms.com/docs/content-management-api/authentication"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#4a90d9' }}
              >
                Learn how to create one
              </a>
            </>
          }
        />
      </div>

      <div
        style={{
          backgroundColor: '#fff3cd',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        <strong>Important:</strong> Use a Full-Access API token with permissions to
        create and delete environments. The token is stored securely and used only
        for backup operations.
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <Button buttonType="muted" onClick={onBack}>
          Back
        </Button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button buttonType="muted" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={handleNext}
            disabled={!validated || !apiToken}
          >
            Next: Configure
          </Button>
        </div>
      </div>
    </div>
  );
}
