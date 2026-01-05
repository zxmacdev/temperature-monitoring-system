import { Component, Input, signal } from '@angular/core';
import { Alert } from '../../models/sensor.model';

@Component({
  selector: 'app-alerts',
  imports: [],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class Alerts {
  @Input() alerts = signal<Alert[]>([]);
}
