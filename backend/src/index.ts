import express from 'express';
import cors from 'cors';
import { sensors, alerts, SensorReading } from './server/data';
import { startMockDataGenerator } from './server/server';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// API Endpoints
app.get('/api/sensors', (req, res) => {
  const sensorData: Record<number, SensorReading> = {};
  sensors.forEach((data, id) => {
    sensorData[id] = data;
  });
  res.json(sensorData);
});

app.get('/api/sensors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const sensor = sensors.get(id);
  
  if (sensor) {
    res.json({ id, ...sensor });
  } else {
    res.status(404).json({ error: 'Sensor not found' });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/stats', (req, res) => {
  const sensorArray = Array.from(sensors.entries());
  
  if (sensorArray.length === 0) {
    return res.json({
      totalSensors: 0,
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0
    });
  }

  const temps = sensorArray.map(([_, data]) => data.temperature);
  
  res.json({
    totalSensors: sensors.size,
    avgTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
    minTemperature: Math.min(...temps),
    maxTemperature: Math.max(...temps)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startMockDataGenerator();
});

export default app;