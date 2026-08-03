import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const documentFields = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.iso.date(),
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
  loader: glob({ base: "./src/data/notes", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("note").default("note"),
  }),
});

const interactives = defineCollection({
  loader: glob({ base: "./src/data/interactives", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("interactive").default("interactive"),
    status: z.enum(["prototype", "active", "archived"]).default("prototype"),
  }),
});

const guides = defineCollection({
  loader: glob({ base: "./src/data/guides", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("guide").default("guide"),
    updated: z.iso.date(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/data/projects", pattern: "**/*.md" }),
  schema: documentFields.extend({
    kind: z.literal("project").default("project"),
    href: z.url(),
    status: z.enum(["active", "paused", "archived"]).default("active"),
  }),
});

export const collections = { articles, notes, interactives, guides, projects };
