'use strict';

require('dotenv').config();

/**
 * New Relic agent configuration.
 */
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'athaar API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    top_n: 20,
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
  },
  browser_monitoring: {
    enable: false,
  },
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },
  distributed_tracing: {
    enabled: true,
  },
  slow_sql: {
    enabled: true,
  },
  cross_application_tracer: {
    enabled: false,
  },
};
