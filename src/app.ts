import express, { Application, Request, Response } from 'express';
import incidentRoutes from './routes/incidents';

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/incidents', incidentRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
