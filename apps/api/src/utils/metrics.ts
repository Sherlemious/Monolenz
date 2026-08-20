import { getNewRelic } from './newrelic-optional';

export class MetricsCollector {
  incrementCounter(name: string, value: number = 1, attributes?: Record<string, unknown>) {
    const newrelic = getNewRelic();
    if (!newrelic) return;
    newrelic.incrementMetric(name, value);
    if (attributes) {
      newrelic.addCustomAttributes(attributes as Record<string, string | number | boolean>);
    }
  }

  recordDuration(name: string, duration: number, attributes?: Record<string, unknown>) {
    const newrelic = getNewRelic();
    if (!newrelic) return;
    newrelic.recordMetric(name, duration);
    if (attributes) {
      newrelic.addCustomAttributes(attributes as Record<string, string | number | boolean>);
    }
  }

  recordGauge(name: string, value: number, attributes?: Record<string, unknown>) {
    const newrelic = getNewRelic();
    if (!newrelic) return;
    newrelic.recordMetric(name, value);
    if (attributes) {
      newrelic.addCustomAttributes(attributes as Record<string, string | number | boolean>);
    }
  }

  addCustomEvent(eventType: string, attributes: Record<string, unknown>) {
    getNewRelic()?.recordCustomEvent(eventType, attributes as Record<string, string | number | boolean>);
  }

  setTransactionName(category: string, name: string) {
    getNewRelic()?.setTransactionName(`${category} ${name}`);
  }

  addTransactionAttribute(key: string, value: string | number | boolean) {
    getNewRelic()?.addCustomAttribute(key, value);
  }
}
