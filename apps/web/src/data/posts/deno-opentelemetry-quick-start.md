---
date: '2025-06-14'
title: 'A quick start with Deno OpenTelemetry and Grafana'
description: "Here are the simple steps needed to get Deno's built-in OpenTelemetry logs and traces into a locally running Grafana stack."
---

I'm very excited about the [built-in OpenTelemetry support in Deno](https://docs.deno.com/runtime/fundamentals/open_telemetry/) as of Deno 2.2. I usually have trouble getting OpenTelemetry logs and traces working in a Node.js app and surfaced in Grafana, but with Deno, there is much less setup.

## Grafana

Grafana has a handy docker image that contains a preconfigured OpenTelemetry backend - the [LGTM stack](https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-docker-image-introducing-grafana/otel-lgtm/) ([repo](https://github.com/grafana/docker-otel-lgtm)).

I like to set up a `docker-compose.yml` file to start the stack in the background.

```yaml title="docker-compose.yml"
services:
  lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - '3000:3000' # Grafana UI
      - '4317:4317' # OpenTelemetry gRPC port
      - '4318:4318' # OpenTelemetry HTTP port
    networks:
      - lgtm-network

networks:
  lgtm-network:
    driver: bridge
```

Run `docker compose up -d` to spin everything up, and when it's up, visit http://localhost:3000 to view Grafana. Username is **admin** and password is **admin**.

## Deno

Create a directory somewhere for your Deno project - for this, For this example, I'll run the following command to bootstrap a quick HTTP server.

```sh
deno init --serve
```

Add a `.env` file with the following contents:

```sh title=".env"
OTEL_DENO=true
OTEL_SERVICE_NAME="deno-example"
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://localhost:4318/v1/metrics"
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/traces"
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://localhost:4318/v1/logs"
```

Although it's all listed throughout [their docs](https://docs.deno.com/runtime/fundamentals/open_telemetry/), here's a rough breakdown of the environment variables:

- `OTEL_DENO`: required to enable OpenTelemetry support for your Deno script/server.
- `OTEL_SERVICE_NAME`: the name of the app or service that will appear in Grafana - all your logs, traces, and metrics will be associated with it.
- `OTEL_EXPORTER_OLTP_*_ENDPOINT` - the endpoints listed are the default endpoints for your locally running LGTM stack where metrics, traces, and logs will be captured by various services and eventually make their way to Grafana. You could swap these out in production for Grafana Cloud endpoints, for example.

Looking at the `main.ts` file that Deno 2.3 generated for us:

```ts title="main.ts"
import { serveDir } from '@std/http'

const userPagePattern = new URLPattern({ pathname: '/users/:id' })
const staticPathPattern = new URLPattern({ pathname: '/static/*' })

export default {
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/') {
      return new Response('Home page')
    }

    const userPageMatch = userPagePattern.exec(url)
    if (userPageMatch) {
      return new Response(userPageMatch.pathname.groups.id)
    }

    if (staticPathPattern.test(url)) {
      return serveDir(req)
    }

    return new Response('Not found', { status: 404 })
  },
} satisfies Deno.ServeDefaultExport
```

We can see we have a nice little HTTP server. Let's run the following command to start the server with OpenTelemetry enabled.

```sh
deno serve --env-file --unstable-otel --allow-env --allow-net main.ts
```

Now make a GET request to http://localhost:8000 and another to http://localhost:8000/users/1234 and refresh the data in Grafana's **Drilldown > Traces** UI and explore your traces.

Without any console.log statements or any other code to set up HTTP tracing, Deno captures key information and exports it for viewing in Grafana!

![Grafana trace view](/public/assets/grafana-trace.png)

Play around with adding `console.log` statements and [custom trace spans](https://docs.deno.com/runtime/fundamentals/open_telemetry/#traces-1) to see what else you can report. 🪵
