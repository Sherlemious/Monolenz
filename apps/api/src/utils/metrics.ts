export class MetricsCollector {
  incrementCounter(_name: string, _value: number = 1, _attributes?: Record<string, unknown>) {}

  recordDuration(_name: string, _duration: number, _attributes?: Record<string, unknown>) {}

  recordGauge(_name: string, _value: number, _attributes?: Record<string, unknown>) {}

  addCustomEvent(_eventType: string, _attributes: Record<string, unknown>) {}

  setTransactionName(_category: string, _name: string) {}

  addTransactionAttribute(_key: string, _value: string | number | boolean) {}
}
