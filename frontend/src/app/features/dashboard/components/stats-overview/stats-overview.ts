import { Component, Input, signal, Signal } from '@angular/core';
import { SensorData } from '../../models/sensor.model';

@Component({
  selector: 'app-stats-overview',
  imports: [],
  templateUrl: './stats-overview.html',
  styleUrl: './stats-overview.scss',
})
export class StatsOverview {
  @Input() sensorList: Signal<{
    id: number;
    data: SensorData;
  }[]> = signal([]);
  @Input() avgTemperature: Signal<string> = signal('');
  @Input() criticalCount: Signal<number> = signal(0);
}
