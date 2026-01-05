import { describe, it, expect, beforeEach } from '@jest/globals';
import { parseMessage } from './server';

describe('Temperature Monitor - Message Parsing', () => {
  describe('parseMessage', () => {
    it('should correctly parse type 2 message with example data (0xA1 0x10)', () => {
      // Example: A1 10 represents bits 1010 0001 0001 0000
      // Type: 10 (binary) = 2
      // SensorID: 100001 (binary) = 33
      // Temperature: 00010000 (binary) = 16
      const buffer = Buffer.from([0xA1, 0x10]);
      const result = parseMessage(buffer);

      expect(result).not.toBeNull();
      expect(result?.type).toBe(2);
      expect(result?.sensorId).toBe(33);
      expect(result?.temperature).toBe(16);
    });

    it('should parse type 2 message with sensor 0 and temp 0', () => {
      // 10 000000 00000000 = 0x8000
      const buffer = Buffer.from([0x80, 0x00]);
      const result = parseMessage(buffer);

      expect(result?.type).toBe(2);
      expect(result?.sensorId).toBe(0);
      expect(result?.temperature).toBe(0);
    });

    it('should parse type 2 message with max sensor ID (63)', () => {
      // 10 111111 11111111 = 0xBFFF
      const buffer = Buffer.from([0xBF, 0xFF]);
      const result = parseMessage(buffer);

      expect(result?.type).toBe(2);
      expect(result?.sensorId).toBe(63);
      expect(result?.temperature).toBe(255);
    });

    it('should parse type 2 message with mid-range values', () => {
      // Sensor 15, temp 72°C
      // 10 001111 01001000 = 0x8F48
      const buffer = Buffer.from([0x8F, 0x48]);
      const result = parseMessage(buffer);

      expect(result?.type).toBe(2);
      expect(result?.sensorId).toBe(15);
      expect(result?.temperature).toBe(72);
    });

    it('should identify non-type-2 messages', () => {
      // Type 0 message: 00 000000 00000000
      const buffer1 = Buffer.from([0x00, 0x00]);
      const result1 = parseMessage(buffer1);
      expect(result1?.type).toBe(0);

      // Type 1 message: 01 000000 00000000
      const buffer2 = Buffer.from([0x40, 0x00]);
      const result2 = parseMessage(buffer2);
      expect(result2?.type).toBe(1);

      // Type 3 message: 11 000000 00000000
      const buffer3 = Buffer.from([0xC0, 0x00]);
      const result3 = parseMessage(buffer3);
      expect(result3?.type).toBe(3);
    });

    it('should return null for insufficient data', () => {
      const buffer = Buffer.from([0xA1]); // Only 1 byte
      const result = parseMessage(buffer);

      expect(result).toBeNull();
    });

    it('should handle empty buffer', () => {
      const buffer = Buffer.from([]);
      const result = parseMessage(buffer);

      expect(result).toBeNull();
    });

    it('should correctly extract all bits for various sensor IDs', () => {
      // Test boundary values for 6-bit sensor ID (0-63)
      const testCases = [
        { sensorId: 0, byte1: 0x80 },
        { sensorId: 1, byte1: 0x81 },
        { sensorId: 31, byte1: 0x9F },
        { sensorId: 32, byte1: 0xA0 },
        { sensorId: 62, byte1: 0xBE },
        { sensorId: 63, byte1: 0xBF }
      ];

      testCases.forEach(({ sensorId, byte1 }) => {
        const buffer = Buffer.from([byte1, 0x14]); // temp = 20
        const result = parseMessage(buffer);
        expect(result?.sensorId).toBe(sensorId);
        expect(result?.type).toBe(2);
      });
    });
  });

  describe('Binary data handling', () => {
    it('should handle multiple messages in a buffer', () => {
      // Two type 2 messages
      const buffer = Buffer.from([
        0xA1, 0x10, // Sensor 33, temp 16
        0x85, 0x19  // Sensor 5, temp 25
      ]);

      const msg1 = parseMessage(buffer.subarray(0, 2));
      expect(msg1?.sensorId).toBe(33);
      expect(msg1?.temperature).toBe(16);

      const msg2 = parseMessage(buffer.subarray(2, 4));
      expect(msg2?.sensorId).toBe(5);
      expect(msg2?.temperature).toBe(25);
    });

    it('should correctly parse temperature values across full 8-bit range', () => {
      const temperatures = [0, 1, 50, 100, 127, 128, 200, 254, 255];
      
      temperatures.forEach(temp => {
        const buffer = Buffer.from([0x80, temp]); // Type 2, sensor 0
        const result = parseMessage(buffer);
        expect(result?.temperature).toBe(temp);
      });
    });
  });
});

describe('Mock Process for Testing', () => {
  it('should demonstrate mock process creation', () => {
    // Example mock implementation
    class MockChildProcess {
      stdout = {
        listeners: [] as Array<(buf: Buffer) => void>,
        on(event: string, callback: (buf: Buffer) => void) {
          if (event === 'data') {
            this.listeners.push(callback);
          }
          return this;
        },
        emit(data: Buffer) {
          this.listeners.forEach(cb => cb(data));
        }
      };

      stderr = {
        on() { return this; }
      };

      on() { return this; }
    }

    const mockProcess = new MockChildProcess();
    
    // Set up listener
    const received: Buffer[] = [];
    mockProcess.stdout.on('data', (buf) => {
      received.push(buf);
    });

    // Emit test data
    const testData = Buffer.from([0xA1, 0x10]);
    mockProcess.stdout.emit(testData);

    expect(received.length).toBe(1);
    expect(received[0]).toEqual(testData);
  });
});

describe('Integration scenarios', () => {
  it('should handle realistic data stream with multiple sensors', () => {
    const dataStream = Buffer.from([
      0x80, 0x14, // Sensor 0: 20°C
      0x85, 0x16, // Sensor 5: 22°C
      0x8A, 0x18, // Sensor 10: 24°C
      0xA1, 0x10, // Sensor 33: 16°C (example from spec)
      0xBF, 0xFF  // Sensor 63: 255°C (max values)
    ]);

    const messages = [];
    for (let i = 0; i < dataStream.length; i += 2) {
      const msg = parseMessage(dataStream.subarray(i, i + 2));
      if (msg && msg.type === 2) {
        messages.push(msg);
      }
    }

    expect(messages.length).toBe(5);
    expect(messages[0]).toEqual({ type: 2, sensorId: 0, temperature: 20 });
    expect(messages[3]).toEqual({ type: 2, sensorId: 33, temperature: 16 });
    expect(messages[4]).toEqual({ type: 2, sensorId: 63, temperature: 255 });
  });
});