import newrelic from 'newrelic';

export class MetricsCollector {
  incrementCounter(name: string, value: number = 1, attributes?: Record<string, any>) {
    newrelic.incrementMetric(name, value);
    if (attributes) {
      newrelic.addCustomAttributes(attributes);
    }
  }

  recordDuration(name: string, duration: number, attributes?: Record<string, any>) {
    newrelic.recordMetric(name, duration);
    if (attributes) {
      newrelic.addCustomAttributes(attributes);
    }
  }

  recordGauge(name: string, value: number, attributes?: Record<string, any>) {
    newrelic.recordMetric(name, value);
    if (attributes) {
      newrelic.addCustomAttributes(attributes);
    }
  }

  addCustomEvent(eventType: string, attributes: Record<string, any>) {
    newrelic.recordCustomEvent(eventType, attributes);
  }

  setTransactionName(category: string, name: string) {
    newrelic.setTransactionName(`${category} ${name}`);
  }

  addTransactionAttribute(key: string, value: string | number | boolean) {
    newrelic.addCustomAttribute(key, value);
  }
}
