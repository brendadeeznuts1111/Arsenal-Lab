#!/usr/bin/env bun
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";

// Initialize tracing
const tracerProvider = new NodeTracerProvider();

// Jaeger exporter for distributed tracing
if (process.env.JAEGER_ENDPOINT) {
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  });
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
}

// Register the tracer provider
tracerProvider.register();

// Create meter for metrics
const meterProvider = new MeterProvider();
let prometheusExporter: PrometheusExporter | null = null;

// Prometheus exporter for metrics
if (process.env.PROMETHEUS_PORT) {
  prometheusExporter = new PrometheusExporter({
    port: parseInt(process.env.PROMETHEUS_PORT) || 9464,
  });
  meterProvider.addMetricReader(prometheusExporter);
}

// Get tracer and meter instances
export const tracer = tracerProvider.getTracer("bun-system-gate", "3.0.0");
export const meter = meterProvider.getMeter("bun-system-gate", "3.0.0");

// Pre-defined metrics
export const metrics = {
  // Invariant validation metrics
  invariantValidations: meter.createCounter("invariant_validations_total", {
    description: "Total number of invariant validations performed"
  }),

  invariantViolations: meter.createCounter("invariant_violations_total", {
    description: "Total number of invariant violations detected"
  }),

  validationDuration: meter.createHistogram("validation_duration_seconds", {
    description: "Duration of invariant validation operations"
  }),

  // Patch governance metrics
  patchesValidated: meter.createCounter("patches_validated_total", {
    description: "Total number of patches validated"
  }),

  patchesWithViolations: meter.createCounter("patches_with_violations_total", {
    description: "Total number of patches that had violations"
  }),

  // Tension monitoring metrics
  tensionChecks: meter.createCounter("tension_checks_total", {
    description: "Total number of tension checks performed"
  }),

  tensionViolations: meter.createCounter("tension_violations_total", {
    description: "Total number of tension violations detected"
  }),

  // Canary deployment metrics
  canaryRollouts: meter.createCounter("canary_rollouts_total", {
    description: "Total number of canary rollouts initiated"
  }),

  canaryPromotions: meter.createCounter("canary_promotions_total", {
    description: "Total number of canary to stable promotions"
  }),

  // Slack notification metrics
  slackNotifications: meter.createCounter("slack_notifications_total", {
    description: "Total number of Slack notifications sent"
  }),

  slackNotificationErrors: meter.createCounter("slack_notification_errors_total", {
    description: "Total number of Slack notification errors"
  })
};

// Tracing utilities
export class TraceSpan {
  private span: any;

  constructor(name: string, attributes: Record<string, any> = {}) {
    this.span = tracer.startSpan(name, {
      attributes: {
        service: "bun-system-gate",
        version: "3.0.0",
        ...attributes
      }
    });
  }

  setAttribute(key: string, value: any) {
    this.span.setAttribute(key, value);
  }

  addEvent(name: string, attributes: Record<string, any> = {}) {
    this.span.addEvent(name, attributes);
  }

  recordException(error: Error) {
    this.span.recordException(error);
    this.span.setStatus({ code: 2, message: error.message }); // ERROR status
  }

  end() {
    this.span.end();
  }
}

// Utility function to create traced operations
export function traced<T>(
  name: string,
  fn: (span: TraceSpan) => Promise<T>,
  attributes: Record<string, any> = {}
): Promise<T> {
  const span = new TraceSpan(name, attributes);

  return fn(span)
    .catch(error => {
      span.recordException(error);
      throw error;
    })
    .finally(() => {
      span.end();
    });
}

// Utility function to measure operation duration
export function measured<T>(
  operation: string,
  fn: () => Promise<T>,
  attributes: Record<string, any> = {}
): Promise<T> {
  const startTime = performance.now();

  return traced(operation, async (span) => {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });

    const result = await fn();
    const duration = (performance.now() - startTime) / 1000;

    // Record duration in both tracing and metrics
    span.setAttribute("duration_seconds", duration);
    metrics.validationDuration.record(duration, attributes);

    return result;
  }, attributes);
}

// Initialize telemetry
export function initTelemetry() {
  console.log("📊 Initializing OpenTelemetry for Bun System Gate v3.0.0");

  if (process.env.JAEGER_ENDPOINT) {
    console.log(`🔗 Jaeger tracing enabled: ${process.env.JAEGER_ENDPOINT}`);
  }

  if (prometheusExporter) {
    console.log(`📈 Prometheus metrics enabled on port ${prometheusExporter.port}`);
  }

  // Log telemetry status
  console.log("✅ Telemetry initialized successfully");
}

// Graceful shutdown
export function shutdownTelemetry() {
  console.log("🛑 Shutting down telemetry...");

  if (prometheusExporter) {
    prometheusExporter.shutdown();
  }

  tracerProvider.shutdown();
  meterProvider.shutdown();

  console.log("✅ Telemetry shutdown complete");
}

// Auto-initialize on import
if (import.meta.main) {
  initTelemetry();
}
