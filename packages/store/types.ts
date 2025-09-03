import { Method, MonitorType } from "./index.js";

export type Website = {
  id: string;
  url: string;
  method: Method;
  monitorType: MonitorType;
  checkInterval: number | null;
  escalationPolicyId: string | null;
  regions: string[];
  user_id: string;
  nextCheckTime: Date | null;
  lastChecked: Date;
}
