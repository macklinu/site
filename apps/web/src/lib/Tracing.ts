import { Otlp } from '@effect/opentelemetry'
import { FetchHttpClient } from '@effect/platform'
import { Effect, Layer, Redacted } from 'effect'

import { EnvironmentConfig } from '~/lib/Config'

const layerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* EnvironmentConfig
    return Otlp.layer({
      baseUrl: config.otlpExporterEndpoint.toString(),
      resource: {
        serviceName: 'mackie.underdown.wiki',
        attributes: {
          'deployment.environment': 'production',
        },
      },
      headers: {
        Authorization: `Basic ${Redacted.value(config.grafanaApiToken)}`,
      },
    }).pipe(Layer.provide(FetchHttpClient.layer))
  })
)

export const layer = Layer.suspend(() => (import.meta.env.PROD ? layerLive : Layer.empty))
