import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const documentFields = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.iso.date(),
  updatedAt: z.iso.datetime().optional(),
  topics: z.array(z.string().trim().min(1)).max(4).default([]),
  related: z.array(z.string().trim().min(1)).max(6).default([]),
});

const articles = defineCollection({
  loader: glob({ base: "./src/data/posts", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("article").default("article"),
  }),
});

const notes = defineCollection({
  loader: glob({ base: "./src/data/notes", pattern: "**/*.{md,mdx}" }),
  schema: documentFields.extend({
    kind: z.literal("note").default("note"),
  }),
});

const demos = defineCollection({
  loader: glob({ base: "./src/data/demos", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("demo").default("demo"),
    status: z.enum(["prototype", "active", "archived"]).default("prototype"),
  }),
});

const guides = defineCollection({
  loader: glob({ base: "./src/data/guides", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("guide").default("guide"),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/data/projects", pattern: "**/*.yaml" }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    href: z.url(),
  }),
});

export const collections = { articles, notes, demos, guides, projects };
