import { Component, OnInit, OnDestroy, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

interface SensorData {
  temperature: number;
  lastUpdate: string;
  min: number;
  max: number;
  count: number;
}

interface Alert {
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly API_BASE = 'http://localhost:3000';
  private subscription?: Subscription;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  sensors = signal<Record<number, SensorData>>({});
  alerts = signal<Alert[]>([]);
  isConnected = signal(false);
  selectedSensorId = signal<number | null>(null);

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Only start polling in the browser
    if (!this.isBrowser) {
      return;
    }

    // Poll for sensor data every 2 seconds
    this.subscription = interval(2000)
      .pipe(
        switchMap(() => this.http.get<Record<number, SensorData>>(`${this.API_BASE}/api/sensors`).pipe(
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
        switchMap(() => this.http.get<Alert[]>(`${this.API_BASE}/api/alerts`).pipe(
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  selectSensor(id: number) {
    if (this.isBrowser) {
      this.selectedSensorId.set(id);
    }
  }

  getStatusColor(temp: number): string {
    if (temp < 10) return 'text-blue-600';
    if (temp < 25) return 'text-green-600';
    if (temp < 35) return 'text-yellow-600';
    return 'text-red-600';
  }

  getStatusBg(temp: number): string {
    if (temp < 10) return 'bg-blue-50 border-blue-200';
    if (temp < 25) return 'bg-green-50 border-green-200';
    if (temp < 35) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  }

  getSensorCardClass(temp: number): string {
    const selected = this.selectedSensorId();
    const ring = selected !== null ? 'ring-2 ring-blue-500' : '';
    return `bg-white rounded-lg shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${this.getStatusBg(temp)} ${ring}`;
  }

  formatTime(timestamp: string): string {
    if (!this.isBrowser) {
      return 'Loading...';
    }
    return new Date(timestamp).toLocaleTimeString();
  }
}