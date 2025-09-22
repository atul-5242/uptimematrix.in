export type IncidentStatus = 'RESOLVED' | 'INVESTIGATING' | 'MONITORING' | 'DOWN' | 'MAINTENANCE';
export type IncidentSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NONE' | 'MAINTENANCE';

export interface Incident {
  id: string;
  title: string;
  serviceName: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startTime: string;
  endTime: string | null;
  duration: string;
  impact: string;
  serviceId?: string;
  organizationId: string;
  createdAt: string;
  Acknowledged: boolean;
  AcknowledgedBy?: {
    fullName: string | null;
    email: string;
  };
  Resolved: boolean;
  ResolvedBy?: {
    fullName: string | null;
    email: string;
  };
  website?: {
    name: string;
    url: string;
    monitorType: string;
  };
}

export interface IncidentStats {
  total: number;
  open: number;
  acknowledged: number;
  investigating: number;
  resolved: number;
  resolvedToday: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  uptime: number;
}
