import { createClient } from "@/lib/supabase/server";
import type { WebhookEvent } from "@/types";
import crypto from "crypto";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Dispatches a webhook event to all active webhooks subscribed to that event.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();

    // Find all active webhooks subscribed to this event
    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("is_active", true)
      .contains("events", [event]);

    if (error || !webhooks || webhooks.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Deliver to each webhook
    const deliveries = webhooks.map((webhook) =>
      deliverWebhook(webhook, payload)
    );

    await Promise.allSettled(deliveries);
  } catch (error) {
    console.error("Webhook dispatch error:", error);
  }
}

/**
 * Delivers a webhook payload to a single endpoint.
 */
async function deliverWebhook(
  webhook: {
    id: string;
    url: string;
    secret: string | null;
  },
  payload: WebhookPayload
): Promise<void> {
  const startTime = Date.now();

  try {
    const body = JSON.stringify(payload);

    // Generate HMAC signature if secret is set
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "ValenciaStudio-Webhook/1.0",
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const duration = Date.now() - startTime;
    const responseBody = await response.text().catch(() => "");

    // Log the delivery
    await logDelivery(webhook.id, payload.event, payload, {
      status_code: response.status,
      response_body: responseBody.slice(0, 1000), // Limit response body size
      duration_ms: duration,
    });

    // Update webhook stats
    const supabase = await createClient();
    await supabase
      .from("webhooks")
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status_code: response.status,
        failure_count: response.ok ? 0 : webhook.id ? 1 : 0, // Reset on success
      })
      .eq("id", webhook.id);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log the failed delivery
    await logDelivery(webhook.id, payload.event, payload, {
      error_message: errorMessage,
      duration_ms: duration,
    });

    // Increment failure count
    const supabase = await createClient();
    try {
      await supabase.rpc("increment_webhook_failures", {
        webhook_id: webhook.id,
      });
    } catch {
      // Fallback if RPC doesn't exist
      await supabase
        .from("webhooks")
        .update({
          last_triggered_at: new Date().toISOString(),
          failure_count: 1,
        })
        .eq("id", webhook.id);
    }
  }
}

/**
 * Logs a webhook delivery to the database.
 */
async function logDelivery(
  webhookId: string,
  event: WebhookEvent,
  payload: WebhookPayload,
  result: {
    status_code?: number;
    response_body?: string;
    error_message?: string;
    duration_ms?: number;
  }
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("webhook_deliveries").insert({
      webhook_id: webhookId,
      event,
      payload,
      status_code: result.status_code || null,
      response_body: result.response_body || null,
      error_message: result.error_message || null,
      duration_ms: result.duration_ms || null,
    });
  } catch (error) {
    console.error("Failed to log webhook delivery:", error);
  }
}

/**
 * Generates a random webhook secret.
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verifies a webhook signature.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}
