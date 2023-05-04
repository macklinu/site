---
date: '2023-05-04'
title: Using Zod with Remix
description: Here are some of my suggestions for using Zod with Remix
---

I've recently been using [Zod][] to validate data in [Remix][] projects.

My main rule of thumb: **keep Zod on the server**.

Since you have full control over what data is passed from Remix's `loader()` or `action()` to the client, you can trust that the data will be in the expected format by the time it reaches the browser when you validate with Zod on the server.

For example, this is a common pattern for validating URL parameters in a Remix `loader()`.

```ts
// app/routes/projects.$projectId.tsx
import { z } from 'zod'

const ProjectUrlSchema = z.object({
  projectId: z.string().uuid(),
})

export const loader = async ({ params }: LoaderArgs) => {
  const { projectId } = ProjectUrlSchema.parse(params)

  // Now we have a valid projectId to pass to our API endpoint
  const project = await api.getProject(projectId)

  return json(project)
}
```

I do something similar in my `action()` functions, but I'm usually interested in the `FormData` that gets submitted in a form submission or other action from the client.

```ts
const CreateProjectSchema = z.object({
  name: z.string().min(3).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
})

export const action = async ({ request }: ActionArgs) => {
  try {
    const projectParams = CreateProjectSchema.parse(
      Object.fromEntries(await request.formData())
    )

    const project = await api.createProject(projectParams)

    return json(project)
  } catch (error) {
    if (error instanceof ZodError) {
      // Tip: supply better error messaging to the client based on the ZodError
      throw json({ message: 'Invalid project data' }, { status: 400 })
    }
    throw json({ message: 'Unable to create project' }, { status: 500 })
  }
}
```

[zod]: https://github.com/colinhacks/zod
[remix]: https://remix.run/
