import {
  createIncident,
  getAllIncidents,
  updateIncidentStatus,
  clearIncidentStorage,
  getIncidentStorage,
} from '../src/controllers/incidentController';
import { IncidentCategory, IncidentPriority, IncidentStatus } from '../src/models/incident';
import { Request, Response } from 'express';

// Mock Express Request and Response
const mockRequest = (body = {}, params = {}): Partial<Request> => ({
  body,
  params,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Incident Controller', () => {
  beforeEach(() => {
    clearIncidentStorage();
  });

  describe('createIncident', () => {
    it('should create a new incident with valid data', () => {
      const req = mockRequest({
        category: IncidentCategory.WATER,
        priority: IncidentPriority.P1,
        location: 'Block A - Lift 2',
        summary: 'Water leakage in corridor',
      });
      const res = mockResponse();

      createIncident(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          category: IncidentCategory.WATER,
          priority: IncidentPriority.P1,
          location: 'Block A - Lift 2',
          summary: 'Water leakage in corridor',
          status: IncidentStatus.OPEN,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should return 400 for missing required fields', () => {
      const req = mockRequest({
        category: IncidentCategory.ELECTRICAL,
      });
      const res = mockResponse();

      createIncident(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields: category, priority, location, summary',
      });
    });

    it('should return 400 for invalid category', () => {
      const req = mockRequest({
        category: 'INVALID_CATEGORY',
        priority: IncidentPriority.P2,
        location: 'Block B',
        summary: 'Test incident',
      });
      const res = mockResponse();

      createIncident(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid category'),
      });
    });

    it('should return 400 for invalid priority', () => {
      const req = mockRequest({
        category: IncidentCategory.SECURITY,
        priority: 'INVALID_PRIORITY',
        location: 'Block C',
        summary: 'Security breach',
      });
      const res = mockResponse();

      createIncident(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid priority'),
      });
    });

    it('should trim location and summary', () => {
      const req = mockRequest({
        category: IncidentCategory.SANITATION,
        priority: IncidentPriority.P3,
        location: '  Block D  ',
        summary: '  Garbage overflow  ',
      });
      const res = mockResponse();

      createIncident(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          location: 'Block D',
          summary: 'Garbage overflow',
        })
      );
    });
  });

  describe('getAllIncidents', () => {
    it('should return an empty array when no incidents exist', () => {
      const req = mockRequest();
      const res = mockResponse();

      getAllIncidents(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return all incidents', () => {
      // Create incidents first
      const req1 = mockRequest({
        category: IncidentCategory.WATER,
        priority: IncidentPriority.P1,
        location: 'Block A',
        summary: 'Water leak',
      });
      createIncident(req1 as Request, mockResponse() as Response);

      const req2 = mockRequest({
        category: IncidentCategory.ELECTRICAL,
        priority: IncidentPriority.P2,
        location: 'Block B',
        summary: 'Power outage',
      });
      createIncident(req2 as Request, mockResponse() as Response);

      // Get all incidents
      const req = mockRequest();
      const res = mockResponse();
      getAllIncidents(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ summary: 'Water leak' }),
          expect.objectContaining({ summary: 'Power outage' }),
        ])
      );
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update incident status successfully', () => {
      // Create an incident first
      const createReq = mockRequest({
        category: IncidentCategory.WATER,
        priority: IncidentPriority.P1,
        location: 'Block A',
        summary: 'Water leak',
      });
      const createRes = mockResponse();
      createIncident(createReq as Request, createRes as Response);

      // Get the created incident ID
      const storage = getIncidentStorage();
      const incidentId = Array.from(storage.keys())[0];

      // Update the status
      const updateReq = mockRequest(
        { status: IncidentStatus.ASSIGNED },
        { id: incidentId }
      );
      const updateRes = mockResponse();
      updateIncidentStatus(updateReq as Request, updateRes as Response);

      expect(updateRes.status).toHaveBeenCalledWith(200);
      expect(updateRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: incidentId,
          status: IncidentStatus.ASSIGNED,
        })
      );
    });

    it('should return 404 for non-existent incident', () => {
      const req = mockRequest(
        { status: IncidentStatus.RESOLVED },
        { id: 'non-existent-id' }
      );
      const res = mockResponse();

      updateIncidentStatus(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Incident not found' });
    });

    it('should return 400 for invalid status', () => {
      // Create an incident first
      const createReq = mockRequest({
        category: IncidentCategory.ELECTRICAL,
        priority: IncidentPriority.P2,
        location: 'Block B',
        summary: 'Power issue',
      });
      const createRes = mockResponse();
      createIncident(createReq as Request, createRes as Response);

      const storage = getIncidentStorage();
      const incidentId = Array.from(storage.keys())[0];

      // Try to update with invalid status
      const updateReq = mockRequest(
        { status: 'INVALID_STATUS' },
        { id: incidentId }
      );
      const updateRes = mockResponse();
      updateIncidentStatus(updateReq as Request, updateRes as Response);

      expect(updateRes.status).toHaveBeenCalledWith(400);
      expect(updateRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid status'),
      });
    });
  });
});
