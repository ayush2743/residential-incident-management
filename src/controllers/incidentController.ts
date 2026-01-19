import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  Incident,
  IncidentStatus,
  IncidentCategory,
  IncidentPriority,
} from '../models/incident';

const incidents: Map<string, Incident> = new Map();


function isValidEnum<T extends Record<string, string>>(enumObj: T, value: string): value is T[keyof T] {
  return (Object.values(enumObj) as string[]).includes(value);
}

export const createIncident = (req: Request, res: Response): void => {
  try {
    const body = req.body as Record<string, unknown>;
    const category = body.category as string;
    const priority = body.priority as string;
    const location = body.location as string;
    const summary = body.summary as string;

    if (!category || !priority || !location || !summary) {
      res.status(400).json({
        error: 'Missing required fields: category, priority, location, summary',
      });
      return;
    }

    if (!isValidEnum(IncidentCategory, category)) {
      res.status(400).json({
        error: `Invalid category. Must be one of: ${Object.values(IncidentCategory).join(', ')}`,
      });
      return;
    }

    if (!isValidEnum(IncidentPriority, priority)) {
      res.status(400).json({
        error: `Invalid priority. Must be one of: ${Object.values(IncidentPriority).join(', ')}`,
      });
      return;
    }

    if (typeof location !== 'string' || location.trim().length === 0) {
      res.status(400).json({
        error: 'Location must be a non-empty string',
      });
      return;
    }

    if (typeof summary !== 'string' || summary.trim().length === 0) {
      res.status(400).json({
        error: 'Summary must be a non-empty string',
      });
      return;
    }

    const incident: Incident = {
      id: uuidv4(),
      category: category as IncidentCategory,
      priority: priority as IncidentPriority,
      location: location.trim(),
      summary: summary.trim(),
      status: IncidentStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    incidents.set(incident.id, incident);

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllIncidents = (_req: Request, res: Response): void => {
  try {
    const allIncidents = Array.from(incidents.values());
    res.status(200).json(allIncidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIncidentStatus = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const status = body.status as string;

    if (!id) {
      res.status(400).json({ error: 'Incident ID is required' });
      return;
    }

    const incident = incidents.get(id);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    if (!status || !isValidEnum(IncidentStatus, status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${Object.values(IncidentStatus).join(', ')}`,
      });
      return;
    }

    incident.status = status as IncidentStatus;
    incident.updatedAt = new Date();
    incidents.set(id, incident);

    res.status(200).json(incident);
  } catch (error) {
    console.error('Error updating incident status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncidentStorage = (): Map<string, Incident> => {
  return incidents;
};

export const clearIncidentStorage = (): void => {
  incidents.clear();
};
