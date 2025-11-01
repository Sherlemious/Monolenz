import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  if (posthogClient) {
    return posthogClient;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not found for server-side tracking');
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

export async function trackServerEvent(
  eventName: string,
  distinctId: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  const client = getServerPostHog();
  if (!client) return;

  client.capture({
    distinctId,
    event: eventName,
    properties,
  });

  await client.shutdown();
}

export async function identifyServerUser(
  userId: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  const client = getServerPostHog();
  if (!client) return;

  client.identify({
    distinctId: userId,
    properties,
  });

  await client.shutdown();
}
