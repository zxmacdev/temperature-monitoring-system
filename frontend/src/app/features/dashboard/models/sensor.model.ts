export interface SensorData {
  temperature: number;
  lastUpdate: string;
  min: number;
  max: number;
  count: number;
}

export interface Alert {
  message: string;
  timestamp: string;
}