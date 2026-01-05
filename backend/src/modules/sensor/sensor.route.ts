import { Router } from "express";
import { getSensors, getSensor, getAlerts, getStats } from "./sensor.controller";

export const router = Router();

router.get('/', (req, res) => {
  const result = getSensors();
  res.json(result);
});

router.get('/:id', (req, res) => {
  const result = getSensor(req.params.id);
  
  if (result) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

router.get('/alerts', (req, res) => {
  const result = getAlerts();
  res.json(result);
});

router.get('/stats', (req, res) => {
  const result = getStats();
  res.json(result);
});