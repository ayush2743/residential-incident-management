import { Router } from 'express';
import {
  createIncident,
  getAllIncidents,
  updateIncidentStatus,
} from '../controllers/incidentController';

const router = Router();

router.post('/', createIncident);

router.get('/', getAllIncidents);

router.patch('/:id/status', updateIncidentStatus);

export default router;
