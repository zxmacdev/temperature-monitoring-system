import express from 'express';
import cors from 'cors';
import { sensorRouter } from './modules/sensor';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/sensors', sensorRouter);

export default app;