export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'maintenance';

export interface IncidentUpdate {
  id: string;
  message: string;
  type: 'status_change' | 'comment' | 'incident_report';
  author: string;
  timestamp: string;
  status?: IncidentStatus;
}

export interface IncidentMetrics {
  responseTimeMs: number;
  resolutionTimeMs: number | null;
  impactedUsers: number;
}

export interface RelatedIncident {
  id: string;
  title: string;
  status: IncidentStatus;
  createdAt: string;
}

export interface IncidentAnalytics {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  serviceName: string;
  createdAt: string;
  startTime: string;
  endTime: string | null;
  updates: IncidentUpdate[];
  metrics: IncidentMetrics;
  relatedIncidents: RelatedIncident[];
}
