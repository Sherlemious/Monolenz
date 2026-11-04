import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Every page that touches data is dynamic, so no incremental cache is configured.
export default defineCloudflareConfig({});
