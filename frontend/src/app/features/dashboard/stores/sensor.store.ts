import { isPlatformBrowser } from "@angular/common";
import { computed, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { catchError, interval, of, Subscription, switchMap } from "rxjs";
import { SensorData, Alert } from "../models/sensor.model";
import { SensorService } from "../services/sensor.service";

@Injectable({ providedIn: 'root' })
export class SensorStore {
  subscription?: Subscription;
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  sensors = signal<Record<number, SensorData>>({});
  alerts = signal<Alert[]>([]);
  isConnected = signal(false);

  constructor(private sensorService: SensorService) {}

  initSensors() {
    // Only start polling in the browser
    if (!this.isBrowser) {
      return;
    }

    // Poll for sensor data every 2 seconds
    this.subscription = interval(2000)
      .pipe(
        switchMap(() => this.sensorService.fetchSensors().pipe(
          catchError(err => {
            console.error('Failed to fetch sensor data:', err);
            this.isConnected.set(false);
            return of({});
          })
        ))
      )
      .subscribe({
        next: (data) => {
          this.sensors.set(data);
          this.isConnected.set(true);
        }
      });

    // Poll for alerts every 5 seconds
    interval(5000)
      .pipe(
        switchMap(() => this.sensorService.fetchAlerts().pipe(
          catchError(err => {
            console.error('Failed to fetch alerts:', err);
            return of([]);
          })
        ))
      )
      .subscribe({
        next: (data) => this.alerts.set(data)
      });
  }

  sensorList = computed(() => {
    const sensorMap = this.sensors();
    return Object.entries(sensorMap).map(([id, data]) => ({
      id: parseInt(id),
      data
    }));
  });

  avgTemperature = computed(() => {
    const list = this.sensorList();
    if (list.length === 0) return '0.0';
    const avg = list.reduce((sum, s) => sum + s.data.temperature, 0) / list.length;
    return avg.toFixed(1);
  });

  criticalCount = computed(() => {
    return this.sensorList().filter(s => s.data.temperature >= 35).length;
  });
}