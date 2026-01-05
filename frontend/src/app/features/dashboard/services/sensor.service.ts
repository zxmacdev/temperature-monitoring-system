import { Alert, SensorData } from "../models/sensor.model";
import { Injectable } from "@angular/core";
import { ApiService } from "../../../core/services/api.services";

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  constructor(private api: ApiService) {}

  fetchSensors() {
    return this.api.fetch<Record<number, SensorData>>('api/sensors');
  }
  
  fetchAlerts() {
    return this.api.fetch<Alert[]>('api/sensors/alerts');
  }
}