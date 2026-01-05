// Data structures
export interface SensorReading {
  temperature: number;
  lastUpdate: Date;
  min: number;
  max: number;
  count: number;
}

const sensors = new Map<number, SensorReading>();
const alerts: Array<{ message: string; timestamp: Date }> = [];
const ALERT_THRESHOLD = 35; // Alert if temp exceeds 35°C

export { sensors, alerts, ALERT_THRESHOLD }