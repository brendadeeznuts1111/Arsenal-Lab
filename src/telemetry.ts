import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
const provider = new NodeTracerProvider(); provider.register();
export const tracer = provider.getTracer("bun-gate");
export const counter = provider.getMeter("bun-gate").createCounter("invariant_violations_total");
