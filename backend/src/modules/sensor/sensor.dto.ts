export interface SensorReading {
  temperature: number;
  lastUpdate: Date;
  min: number;
  max: number;
  count: number;
}