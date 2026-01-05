import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Alerts } from './components/alerts/alerts';
import { StatsOverview } from './components/stats-overview/stats-overview';
import { SensorStore } from './stores/sensor.store';
import { Helper } from '../../core/utils/helper';
import { SensorGrid } from './components/sensor-grid/sensor-grid';
import { DashboardHeader } from './components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeader, Alerts, StatsOverview, SensorGrid],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  selectedSensorId = signal<number | null>(null);

  constructor(public sensorStore: SensorStore) {}

  ngOnInit() {
    this.sensorStore.initSensors();
  }

  ngOnDestroy() {
    this.sensorStore.subscription?.unsubscribe();
  }

  public selectSensor = (id: number) => {
    if (this.sensorStore.isBrowser) {
      this.selectedSensorId.set(id);
    }
  }

  public getStatusColor = (temp: number): string => {
    if (temp < 10) return 'text-blue-600';
    if (temp < 25) return 'text-green-600';
    if (temp < 35) return 'text-yellow-600';
    return 'text-red-600';
  }

  public getStatusBg = (temp: number): string => {
    if (temp < 10) return 'bg-blue-50 border-blue-200';
    if (temp < 25) return 'bg-green-50 border-green-200';
    if (temp < 35) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  }

  public getSensorCardClass = (temp: number): string => {
    const selected = this.selectedSensorId();
    const ring = selected !== null ? 'ring-2 ring-blue-500' : '';
    return `bg-white rounded-lg shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${this.getStatusBg(temp)} ${ring}`;
  }

  public formatTime = (timestamp: string): string => {
    if (!this.sensorStore.isBrowser) {
      return 'Loading...';
    }
    return Helper.formatTime(timestamp);
  }
}