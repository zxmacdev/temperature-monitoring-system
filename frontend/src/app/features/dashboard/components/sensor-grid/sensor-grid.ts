import { Component, Input, Signal, signal } from '@angular/core';
import { SensorData } from '../../models/sensor.model';

@Component({
  selector: 'app-sensor-grid',
  imports: [],
  templateUrl: './sensor-grid.html',
  styleUrl: './sensor-grid.scss',
})
export class SensorGrid {
  @Input() sensorList: Signal<{
    id: number;
    data: SensorData;
  }[]> = signal([]);

  @Input() selectSensor: (id: number) => void = () => {};
  @Input() getStatusColor: (temp: number) => string = () => "";
  @Input() getStatusBg: (temp: number) => string = () => "";
  @Input() getSensorCardClass: (temp: number) => string = () => "";
  @Input() formatTime: (timestamp: string) => string = () => "";
}
