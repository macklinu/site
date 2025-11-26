import { codeInput } from '@sanity/code-input'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'mackie.underdown.wiki',

  projectId: '7ba2ardr',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), codeInput({})],

  schema: {
    types: schemaTypes,
  },
})
