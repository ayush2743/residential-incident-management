export enum IncidentCategory {
  WATER = 'WATER',
  ELECTRICAL = 'ELECTRICAL',
  SECURITY = 'SECURITY',
  SANITATION = 'SANITATION',
}

export enum IncidentPriority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  location: string;
  summary: string;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncidentDTO {
  category: IncidentCategory;
  priority: IncidentPriority;
  location: string;
  summary: string;
}

export interface UpdateStatusDTO {
  status: IncidentStatus;
}
