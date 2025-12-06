import * as Sentry from '@sentry/astro'

Sentry.init({
  dsn: 'https://87de2ac19c91cc95c0cd7c4866a12478@o4507255340204032.ingest.us.sentry.io/4510488703991808',
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  environment: import.meta.env.MODE,
})
