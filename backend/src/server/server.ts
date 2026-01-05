import { spawn } from "node:child_process";
import { ALERT_THRESHOLD, alerts, sensors } from "./data";

// Parse binary message
function parseMessage(buffer: Buffer): { type: number; sensorId: number; temperature: number } | null {
  if (buffer.length < 2) return null;

  const byte1 = buffer[0];
  const byte2 = buffer[1];

  // Combine into 16-bit value
  const value = (byte1 << 8) | byte2;

  // Extract type (bits 0-1, which are the leftmost bits)
  const type = (value >> 14) & 0b11;

  // Extract sensorId (bits 2-7)
  const sensorId = (value >> 8) & 0b111111;

  // Extract temperature (bits 8-15, which is byte2)
  const temperature = byte2;

  return { type, sensorId, temperature };
}

// Process sensor data
function processSensorData(sensorId: number, temperature: number) {
  const existing = sensors.get(sensorId);
  
  if (existing) {
    existing.temperature = temperature;
    existing.lastUpdate = new Date();
    existing.min = Math.min(existing.min, temperature);
    existing.max = Math.max(existing.max, temperature);
    existing.count += 1;
  } else {
    sensors.set(sensorId, {
      temperature,
      lastUpdate: new Date(),
      min: temperature,
      max: temperature,
      count: 1
    });
  }

  // Check for alerts
  if (temperature >= ALERT_THRESHOLD) {
    const alertMsg = `Sensor #${sensorId} exceeded threshold: ${temperature}°C`;
    alerts.unshift({ message: alertMsg, timestamp: new Date() });
    // Keep only last 10 alerts
    if (alerts.length > 10) alerts.pop();
    console.log(`ALERT: ${alertMsg}`);
  }

  console.log(`Sensor #${sensorId}: ${temperature}°C`);
}

// Start measure_temp process
function startMeasurementProcess() {
  try {
    const measureTempProcess = spawn('measure_temp');
    
    let buffer = Buffer.alloc(0);

    measureTempProcess.stdout.on('data', (buf: Buffer) => {
      console.log(`Subprocess outputted ${buf.length} bytes`);
      
      // Append to buffer
      buffer = Buffer.concat([buffer, buf]);

      // Process complete 2-byte messages
      while (buffer.length >= 2) {
        const messageBytes = buffer.subarray(0, 2);
        const parsed = parseMessage(messageBytes);

        if (parsed && parsed.type === 2) {
          processSensorData(parsed.sensorId, parsed.temperature);
        }

        // Remove processed bytes
        buffer = buffer.subarray(2);
      }
    });

    measureTempProcess.stderr.on('data', (data) => {
      console.error(`Process error: ${data}`);
    });

    measureTempProcess.on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      // Optionally restart the process
      setTimeout(startMeasurementProcess, 5000);
    });

    console.log('Temperature measurement process started');
  } catch (error) {
    console.error('Failed to start measurement process:', error);
    // For testing: start mock data generator instead
    startMockDataGenerator();
  }
}

// Mock data generator for testing
function startMockDataGenerator() {
  console.log('Starting mock data generator...');
  
  setInterval(() => {
    // Generate random sensor readings
    const sensorId = Math.floor(Math.random() * 10); // 10 sensors
    const baseTemp = 20;
    const variance = Math.random() * 30 - 5; // -5 to +25
    const temperature = Math.round(baseTemp + variance);

    processSensorData(sensorId, Math.max(0, Math.min(255, temperature)));
  }, 2000);
}

export { parseMessage, processSensorData, startMeasurementProcess };