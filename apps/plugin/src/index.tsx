import { connect, RenderModalCtx } from 'datocms-plugin-sdk';
import { render } from '@/utils/render';
import ConfigScreen from '@/entrypoints/ConfigScreen';
import SetupWizard from '@/entrypoints/SetupWizard';
import 'datocms-react-ui/styles.css';
import type { PluginParameters } from '@/types';

connect({
  async onBoot(ctx) {
    const params = ctx.plugin.attributes.parameters as PluginParameters;

    // Show setup wizard if not installed and not previously prompted
    if (!params.installationState && !params.hasBeenPrompted) {
      await ctx.updatePluginParameters({ hasBeenPrompted: true });
      await ctx.openModal({
        id: 'setupWizard',
        title: 'Automatic Backups Setup',
        width: 'l',
        closeDisabled: true,
      });
    }
  },

  renderConfigScreen(ctx) {
    const params = ctx.plugin.attributes.parameters as PluginParameters;

    if (params.installationState === 'installed') {
      return render(<ConfigScreen ctx={ctx} />);
    }

    // Show pre-install screen with retry option
    return render(<SetupWizard ctx={ctx} isModal={false} />);
  },

  renderModal(modalId: string, ctx: RenderModalCtx) {
    if (modalId === 'setupWizard') {
      return render(<SetupWizard ctx={ctx} isModal={true} />);
    }
  },
});
