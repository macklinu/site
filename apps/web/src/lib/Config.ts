import { Context, Effect, Layer, Schema } from 'effect'

const EnvironmentConfigSchema = Schema.Struct({
  otlpExporterEndpoint: Schema.URL,
  grafanaApiToken: Schema.Redacted(Schema.String),
  otlpProtocol: Schema.String,
})

export class EnvironmentConfig extends Context.Tag('@mackie/web/lib/Config/EnvironmentConfig')<
  EnvironmentConfig,
  typeof EnvironmentConfigSchema.Type
>() {
  static readonly layer = Layer.effect(
    EnvironmentConfig,
    Effect.gen(function* () {
      const otlpExporterEndpoint = import.meta.env.OTEL_EXPORTER_OTLP_ENDPOINT
      const grafanaApiToken = import.meta.env.GRAFANA_API_TOKEN
      const otlpProtocol = import.meta.env.OTEL_EXPORTER_OTLP_PROTOCOL

      return yield* Schema.decodeUnknown(EnvironmentConfigSchema)({
        otlpExporterEndpoint,
        grafanaApiToken,
        otlpProtocol,
      })
    })
  )
}
