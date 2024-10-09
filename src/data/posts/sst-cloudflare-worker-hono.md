---
date: '2024-10-09'
title: 'Deploying a Hono API to Cloudflare Workers using SST'
description: 'Here is a basic breakdown of what is needed to deploy a Hono API to Cloudflare Workers using SST.'
---

First, install SST.

```shell
pnpm add sst -D
```

Initialize a new SST project. Follow any prompts to complete the installation, choosing `cloudflare` as the provider instead of `aws` (the default).

```shell
pnpm sst init
```

At the root of your project, you should have an `sst.config.ts` that looks roughly like this.

```typescript title="sst.config.ts"
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'my-hono-api',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'cloudflare',
    }
  },
  async run() {
    // ...
  },
})
```

We will come back to this in a minute.

💁‍♂️ The part where I got hung up in the [Cloudflare Workers with SST documentation](https://sst.dev/docs/start/cloudflare/worker) was around Cloudflare API token permissions required in order to deploy your Worker with SST. So in your Cloudflare Dashboard, go to **My Profile** > **API Tokens** > **Create Token** and give it the following minimum permissions:

- Workers R2 Storage:Edit
- Workers Scripts:Edit

I know for sure we need R2 because that's where SST stores infrastructure state when running `sst dev` or `sst deploy`. We also need the Worker Scripts permission to deploy the Worker itself. You may find you need to add more permissions depending on what other features you are using, like **Workers KV Storage:Edit**, **D1:Edit**, or permissions regarding DNS (hoping to figure that out another time and create a follow-up post).

Create a `.env` file at the root of your project and include your generated Cloudflare API token and your account ID, which is found at `https://dash.cloudflare.com/:accountId`.

```shell title=".env"
CLOUDFLARE_DEFAULT_ACCOUNT_ID="..."
CLOUDFLARE_API_TOKEN="..."
```

With our tokens created and environment set up, the final step is to update the `run()` function in our `sst.config.ts` with a Cloudflare Worker resource.

- `handler` - The path to the Hono API handler file.
- `url` - Whether to enable a dedicated URL for the Worker.

```typescript title="sst.config.ts" mark={12-19}
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'my-hono-api',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'cloudflare',
    }
  },
  async run() {
    const api = new sst.cloudflare.Worker('Api', {
      handler: 'src/index.ts',
      url: true,
    })

    return {
      api: api.url,
    }
  },
})
```

Now you can run `pnpm sst dev` or `pnpm sst deploy` to deploy your Hono API to Cloudflare Workers and get a URL back to test your API. 🎉
