---
date: "2025-01-14"
title: "Using Tailwind v4 with Storybook v8"
description: "Tailwind v4 and Storybook 8.4, wired up with Vite."
---

One of the main changes in Tailwind v4 is configuration through CSS instead of `tailwind.config.ts`, which Tailwind supports through their own Vite plugin. I wanted to play around with Tailwind v4 while building a component library, and with Storybook v8.4's React and Vite support, we can load and test Tailwind as part of our Storybook.

First, let's install the v4 versions of Tailwind.

```shell
pnpm add tailwindcss @tailwindcss/vite -D
```

And let's set up a basic Tailwind v4 CSS file.

```css title="src/index.css"
@import "tailwindcss";
```

Great! Now there are few Storybook steps needed to make it aware of Tailwind.

Once you have [initialized Storybook through their CLI](https://storybook.js.org/docs/get-started/install) or installed manually, you should have a `.storybook/main.ts` config file where you will want to set up the [@storybook/react-vite](https://storybook.js.org/docs/get-started/frameworks/react-vite) framework.

```ts title=".storybook/main.ts" {4-7}
import type { StorybookConfig } from "@storybook/react-vite";

export default {
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // ...
} satisfies StorybookConfig;
```

This Storybook config file supports custom Vite plugins, ~~but instead of importing Tailwind's Vite plugin in a standard fashion, we will need to dynamically import it to work around an [open issue](https://github.com/tailwindlabs/tailwindcss/issues/13216) in the Tailwind GitHub repo.~~ so let's import the tailwindcss vite plugin.

```ts title=".storybook/main.ts" {'1':6} {'2':7} {'3':9}
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

export default {
  viteFinal: async (config) => {
    config.plugins ||= [];
    config.plugins.push(tailwindcss());

    return config;
  },
} satisfies StorybookConfig;
```

1. Storybook's Vite config may have an undefined `plugins` property, and if so, we need to intialize it with an empty array.
2. Add the Tailwind Vite plugin to Storybook's Vite config.
3. And make sure to return the modified config for your changes to take effect!

The last thing we need to do now is actually import the Tailwind CSS file we created earlier.

```ts title=".storybook/preview.ts" {1}
import "../src/index.css";

import type { Preview } from "@storybook/react";

export default {
  // ...
} satisfies Preview;
```

Now any stories you write for React components that use Tailwind styles will appear as expected in Storybook's UI.

Have fun! 😘
