import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '7ba2ardr',
    dataset: 'production',
  },
  deployment: {
    appId: 'sfeh6u9xtv5g66ty52ctrfux',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  },
})
