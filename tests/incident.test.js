"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const incidentController_1 = require("../src/controllers/incidentController");
const incident_1 = require("../src/models/incident");
// Mock Express Request and Response
const mockRequest = (body = {}, params = {}) => ({
    body,
    params,
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe('Incident Controller', () => {
    beforeEach(() => {
        (0, incidentController_1.clearIncidentStorage)();
    });
    describe('createIncident', () => {
        it('should create a new incident with valid data', () => {
            const req = mockRequest({
                category: incident_1.IncidentCategory.WATER,
                priority: incident_1.IncidentPriority.P1,
                location: 'Block A - Lift 2',
                summary: 'Water leakage in corridor',
            });
            const res = mockResponse();
            (0, incidentController_1.createIncident)(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: expect.any(String),
                category: incident_1.IncidentCategory.WATER,
                priority: incident_1.IncidentPriority.P1,
                location: 'Block A - Lift 2',
                summary: 'Water leakage in corridor',
                status: incident_1.IncidentStatus.OPEN,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }));
        });
        it('should return 400 for missing required fields', () => {
            const req = mockRequest({
                category: incident_1.IncidentCategory.ELECTRICAL,
            });
            const res = mockResponse();
            (0, incidentController_1.createIncident)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Missing required fields: category, priority, location, summary',
            });
        });
        it('should return 400 for invalid category', () => {
            const req = mockRequest({
                category: 'INVALID_CATEGORY',
                priority: incident_1.IncidentPriority.P2,
                location: 'Block B',
                summary: 'Test incident',
            });
            const res = mockResponse();
            (0, incidentController_1.createIncident)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.stringContaining('Invalid category'),
            });
        });
        it('should return 400 for invalid priority', () => {
            const req = mockRequest({
                category: incident_1.IncidentCategory.SECURITY,
                priority: 'INVALID_PRIORITY',
                location: 'Block C',
                summary: 'Security breach',
            });
            const res = mockResponse();
            (0, incidentController_1.createIncident)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.stringContaining('Invalid priority'),
            });
        });
        it('should trim location and summary', () => {
            const req = mockRequest({
                category: incident_1.IncidentCategory.SANITATION,
                priority: incident_1.IncidentPriority.P3,
                location: '  Block D  ',
                summary: '  Garbage overflow  ',
            });
            const res = mockResponse();
            (0, incidentController_1.createIncident)(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                location: 'Block D',
                summary: 'Garbage overflow',
            }));
        });
    });
    describe('getAllIncidents', () => {
        it('should return an empty array when no incidents exist', () => {
            const req = mockRequest();
            const res = mockResponse();
            (0, incidentController_1.getAllIncidents)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });
        it('should return all incidents', () => {
            // Create incidents first
            const req1 = mockRequest({
                category: incident_1.IncidentCategory.WATER,
                priority: incident_1.IncidentPriority.P1,
                location: 'Block A',
                summary: 'Water leak',
            });
            (0, incidentController_1.createIncident)(req1, mockResponse());
            const req2 = mockRequest({
                category: incident_1.IncidentCategory.ELECTRICAL,
                priority: incident_1.IncidentPriority.P2,
                location: 'Block B',
                summary: 'Power outage',
            });
            (0, incidentController_1.createIncident)(req2, mockResponse());
            // Get all incidents
            const req = mockRequest();
            const res = mockResponse();
            (0, incidentController_1.getAllIncidents)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ summary: 'Water leak' }),
                expect.objectContaining({ summary: 'Power outage' }),
            ]));
        });
    });
    describe('updateIncidentStatus', () => {
        it('should update incident status successfully', () => {
            // Create an incident first
            const createReq = mockRequest({
                category: incident_1.IncidentCategory.WATER,
                priority: incident_1.IncidentPriority.P1,
                location: 'Block A',
                summary: 'Water leak',
            });
            const createRes = mockResponse();
            (0, incidentController_1.createIncident)(createReq, createRes);
            // Get the created incident ID
            const storage = (0, incidentController_1.getIncidentStorage)();
            const incidentId = Array.from(storage.keys())[0];
            // Update the status
            const updateReq = mockRequest({ status: incident_1.IncidentStatus.ASSIGNED }, { id: incidentId });
            const updateRes = mockResponse();
            (0, incidentController_1.updateIncidentStatus)(updateReq, updateRes);
            expect(updateRes.status).toHaveBeenCalledWith(200);
            expect(updateRes.json).toHaveBeenCalledWith(expect.objectContaining({
                id: incidentId,
                status: incident_1.IncidentStatus.ASSIGNED,
            }));
        });
        it('should return 404 for non-existent incident', () => {
            const req = mockRequest({ status: incident_1.IncidentStatus.RESOLVED }, { id: 'non-existent-id' });
            const res = mockResponse();
            (0, incidentController_1.updateIncidentStatus)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Incident not found' });
        });
        it('should return 400 for invalid status', () => {
            // Create an incident first
            const createReq = mockRequest({
                category: incident_1.IncidentCategory.ELECTRICAL,
                priority: incident_1.IncidentPriority.P2,
                location: 'Block B',
                summary: 'Power issue',
            });
            const createRes = mockResponse();
            (0, incidentController_1.createIncident)(createReq, createRes);
            const storage = (0, incidentController_1.getIncidentStorage)();
            const incidentId = Array.from(storage.keys())[0];
            // Try to update with invalid status
            const updateReq = mockRequest({ status: 'INVALID_STATUS' }, { id: incidentId });
            const updateRes = mockResponse();
            (0, incidentController_1.updateIncidentStatus)(updateReq, updateRes);
            expect(updateRes.status).toHaveBeenCalledWith(400);
            expect(updateRes.json).toHaveBeenCalledWith({
                error: expect.stringContaining('Invalid status'),
            });
        });
    });
});
//# sourceMappingURL=incident.test.js.map