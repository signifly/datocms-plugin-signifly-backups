import { useState } from 'react';
import { Canvas, Button } from 'datocms-react-ui';
import type { RenderConfigScreenCtx, RenderModalCtx } from 'datocms-plugin-sdk';
import type { InstallationStep, PluginParameters } from '@/types';
import DeployStep from './DeployStep';
import ConnectStep from './ConnectStep';
import ConfigureStep from './ConfigureStep';

type Props = {
  ctx: RenderConfigScreenCtx | RenderModalCtx;
  isModal: boolean;
};

export default function SetupWizard({ ctx, isModal }: Props) {
  const params = ctx.plugin.attributes.parameters as PluginParameters;
  const [step, setStep] = useState<InstallationStep>('deploy');
  const [apiUrl, setApiUrl] = useState(params.apiUrl || '');
  const [apiToken, setApiToken] = useState('');

  const handleComplete = async () => {
    await ctx.updatePluginParameters({
      installationState: 'installed',
      apiUrl,
      apiToken,
      projectId: ctx.site.id,
    });

    if (isModal) {
      (ctx as RenderModalCtx).resolve('installed');
    }
  };

  const handleCancel = async () => {
    await ctx.updatePluginParameters({
      installationState: 'cancelled',
    });

    if (isModal) {
      (ctx as RenderModalCtx).resolve('cancelled');
    }
  };

  // If not modal, show retry button for cancelled state
  if (!isModal && params.installationState === 'cancelled') {
    return (
      <Canvas ctx={ctx}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Setup Required</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            The automatic backups plugin needs to be configured before use.
          </p>
          <Button
            buttonType="primary"
            onClick={() => {
              ctx.updatePluginParameters({ installationState: null, hasBeenPrompted: false });
              ctx.openModal({
                id: 'setupWizard',
                title: 'Automatic Backups Setup',
                width: 'l',
                closeDisabled: true,
              });
            }}
          >
            Start Setup
          </Button>
        </div>
      </Canvas>
    );
  }

  return (
    <Canvas ctx={ctx}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
          {(['deploy', 'connect', 'configure'] as const).map((s, i) => (
            <div
              key={s}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor:
                  step === s
                    ? '#4a90d9'
                    : ['deploy', 'connect', 'configure'].indexOf(step) > i
                    ? '#2e7d32'
                    : '#ddd',
              }}
            />
          ))}
        </div>

        {step === 'deploy' && (
          <DeployStep
            onNext={() => setStep('connect')}
            onCancel={handleCancel}
          />
        )}

        {step === 'connect' && (
          <ConnectStep
            apiUrl={apiUrl}
            apiToken={apiToken}
            onApiUrlChange={setApiUrl}
            onApiTokenChange={setApiToken}
            onNext={() => setStep('configure')}
            onBack={() => setStep('deploy')}
            onCancel={handleCancel}
          />
        )}

        {step === 'configure' && (
          <ConfigureStep
            apiUrl={apiUrl}
            apiToken={apiToken}
            projectId={ctx.site.id}
            onComplete={handleComplete}
            onBack={() => setStep('connect')}
          />
        )}
      </div>
    </Canvas>
  );
}
