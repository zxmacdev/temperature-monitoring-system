import { SensorReading } from "./sensor.dto";
import { alerts, sensors } from "./sensor.service";

export function getSensors() {
  const sensorData: Record<number, SensorReading> = {};
  sensors.forEach((data, id) => {
    sensorData[id] = data;
  });
  return sensorData;
}

export function getSensor(paramId: string) {
  const id = parseInt(paramId);
  const sensor = sensors.get(id);
  
  if (sensor) {
    return { id, ...sensor };
  } else {
    return { error: 'Sensor not found' };
  }
}

export function getAlerts() {
  return alerts;
}

export function getStats() {
  const sensorArray = Array.from(sensors.entries());
  
  if (sensorArray.length === 0) {
    return {
      totalSensors: 0,
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0
    };
  }

  const temps = sensorArray.map(([_, data]) => data.temperature);
  
  return {
    totalSensors: sensors.size,
    avgTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
    minTemperature: Math.min(...temps),
    maxTemperature: Math.max(...temps)
  };
}