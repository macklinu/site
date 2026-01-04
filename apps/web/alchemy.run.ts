import alchemy from 'alchemy'
import { Astro } from 'alchemy/cloudflare'
import { CloudflareStateStore } from 'alchemy/state'

const app = await alchemy('mackie-underdown-wiki', {
  stateStore: (scope) => new CloudflareStateStore(scope),
})

export const worker = await Astro('website', {
  routes: ['mackie.underdown.wiki/*'],
  observability: {
    enabled: true,
  },
})

console.log(worker.url)

await app.finalize()
