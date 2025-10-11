# Complete Escalation Policy Flow Documentation

## 🔄 **Complete Escalation Flow Overview**

This document outlines the complete escalation policy flow from monitor toggle to incident resolution in the UptimeMatrix system.

---

## 📋 **1. Escalation Policy Setup**

### Frontend (Toggle Monitor Assignment)
1. **User clicks "View Details"** on escalation policy card
2. **Monitor Assignment Tab** shows all available monitors with toggle switches
3. **Toggle ON/OFF** updates `website.escalationPolicyId` in database
4. **API Call**: `PATCH /api/escalation-policies/toggle-monitor`
   ```json
   {
     "policyId": "policy-uuid",
     "monitorId": "monitor-uuid", 
     "enabled": true/false
   }
   ```

### Backend Processing
1. **Controller**: `toggleMonitorPolicy()` in `escalationPoliciesController.ts`
2. **Database Update**: Updates `website.escalationPolicyId` field
3. **Response**: Returns updated monitor status

---

## 🔍 **2. Monitor Check Process**

### Worker Loop (`apps/worker/index.ts`)
1. **Continuous Monitoring**: Worker processes monitors every 5 seconds
2. **Website Check**: Fetches website URL and records response
3. **Status Determination**: Online (200-399) vs Offline (400+ or error)
4. **Tick Creation**: Records `WebsiteTick` with status and response time

---

## 🚨 **3. Incident Creation & Escalation Trigger**

### When Monitor Goes Down
1. **Offline Detection**: Worker detects website is offline
2. **Escalation Check**: Looks for `website.escalationPolicyId`
3. **Policy Validation**: Verifies policy exists and is active
4. **Incident Creation**: Creates new incident if none exists

### Incident Data Structure
```typescript
{
  id: "incident-uuid",
  websiteId: "website-uuid", 
  organizationId: "org-uuid",
  status: "INVESTIGATING",
  severity: "CRITICAL|MAJOR|MINOR|NONE",
  Acknowledged: false,
  startTime: "2024-01-01T00:00:00Z",
  currentEscalationStepId: "step-uuid",
  nextEscalationTime: "2024-01-01T00:05:00Z",
  escalationStepStartTime: null,
  currentRepeatCount: 0,
  stepDelayCompleted: false
}
```

---

## ⏰ **4. Escalation Step Processing**

### Step Execution Logic (`handleEscalation.ts`)

#### **Step 1: Initial Delay**
- **Delay Period**: Wait `step.delayMinutes` before starting
- **Status**: `stepDelayCompleted = false`
- **Next Action**: Scheduled at `now + delayMinutes`

#### **Step 2: First Notification**
- **Send Notifications**: Via all configured methods (email, slack, sms, webhook)
- **Status Update**: `stepDelayCompleted = true`, `currentRepeatCount = 1`
- **Next Action**: Scheduled at `now + escalateAfter` minutes

#### **Step 3: Repeat Notifications**
- **Repeat Logic**: Send `step.repeatCount` notifications
- **Interval**: Every `step.escalateAfter` minutes
- **Status Tracking**: Increment `currentRepeatCount`

#### **Step 4: Next Step or Termination**
- **Next Step**: Move to next escalation step if available
- **Termination**: Based on `terminationCondition`
  - `"stop_after_last_step"`: Stop escalating
  - `"repeat_last_step"`: Keep repeating last step every `repeatLastStepIntervalMinutes`

---

## 📧 **5. Notification Methods**

### Supported Methods
1. **Email** ✅ Implemented
   - Uses email templates (incidentEscalated.html)
   - Sends to all recipient emails
   
2. **Slack** ✅ Implemented (stub)
   - Webhook integration ready
   - Formatted messages with incident details
   
3. **SMS** ✅ Implemented (stub)
   - Ready for Twilio/AWS SNS integration
   - Short format messages
   
4. **Webhook** ✅ Implemented (stub)
   - JSON payload with full incident data
   - Configurable endpoints

5. **Teams/Discord/Phone** 🔄 Planned
   - Framework ready for implementation

### Notification Data
```typescript
{
  recipientName: "user@example.com",
  websiteUrl: "https://example.com",
  status: "Offline",
  incidentId: "incident-uuid",
  serviceName: "Example Service",
  escalationPolicyName: "Production Alerts",
  escalationStep: 2,
  customMessage: "Custom alert message",
  ctaLink: "https://dashboard.com/incidents/incident-uuid"
}
```

---

## 🛑 **6. Escalation Stopping Mechanisms**

### **A. Incident Acknowledgment**
- **API**: `PATCH /api/incidents/{incidentId}/acknowledge`
- **Effect**: Sets `Acknowledged = true`, `nextEscalationTime = null`
- **Status Change**: `INVESTIGATING` → `MONITORING`
- **Result**: Stops all further escalations

### **B. Incident Resolution**
- **API**: `PATCH /api/incidents/{incidentId}/resolve`
- **Effect**: Sets `status = RESOLVED`, `endTime = now`
- **Result**: Stops escalations and marks incident as resolved

### **C. Monitor Recovery**
- **Auto-Detection**: Worker detects website is back online
- **Auto-Resolution**: Resolves all investigating incidents for that website
- **Notification**: Sends resolution notification to original recipients

---

## 🔄 **7. Complete Flow Diagram**

```
Monitor Toggle ON → Website Goes Down → Incident Created
                                           ↓
Step 1: Wait delayMinutes → Send Notifications → Wait escalateAfter
                                           ↓
Step 2: Repeat Notifications (repeatCount times) → Next Step or Terminate
                                           ↓
Continue Until: [Acknowledged] OR [Resolved] OR [Website Back Online]
```

---

## 🗃️ **8. Database Schema Key Fields**

### **EscalationPolicy**
```sql
- id (UUID)
- name, description
- priorityLevel (critical|high|medium|low)
- isActive (boolean)
- terminationCondition ("stop_after_last_step"|"repeat_last_step")
- repeatLastStepIntervalMinutes (int)
```

### **EscalationStep**
```sql
- id (UUID), policyId (FK)
- stepOrder (1,2,3...)
- primaryMethods (["email", "sms"])
- additionalMethods (["slack", "webhook"])
- recipients (["user-id", "team-id", "email@domain.com"])
- delayMinutes (wait before step)
- repeatCount (how many times to repeat)
- escalateAfter (minutes between repeats)
- customMessage (optional)
```

### **Website**
```sql
- id (UUID)
- escalationPolicyId (FK) -- KEY FIELD for linking
- url, name, monitorType
- organizationId (FK)
```

### **Incident**
```sql
- id (UUID)
- websiteId (FK), organizationId (FK)
- status (INVESTIGATING|MONITORING|RESOLVED)
- Acknowledged (boolean)
- AcknowledgedBy (User FK)
- ResolvedBy (User FK)
- currentEscalationStepId (FK)
- nextEscalationTime (timestamp)
- currentRepeatCount (int)
- stepDelayCompleted (boolean)
```

---

## 🚀 **9. Implementation Status**

### ✅ **Completed**
- [x] Toggle monitor assignment UI
- [x] Backend API for monitor-policy linking
- [x] Worker incident detection and creation
- [x] Multi-step escalation processing
- [x] Multiple notification methods (framework)
- [x] Incident acknowledgment API
- [x] Incident resolution API
- [x] Auto-resolution on recovery

### 🔄 **In Progress**
- [ ] Real Slack/SMS/Webhook implementations
- [ ] Frontend incident management UI
- [ ] Advanced notification templates
- [ ] Escalation policy analytics

### 📋 **Planned**
- [ ] Teams/Discord integrations
- [ ] Phone call notifications
- [ ] Advanced scheduling (business hours)
- [ ] Escalation policy templates
- [ ] Bulk operations

---

## 🔧 **10. Configuration Examples**

### **Simple Email Alert Policy**
```json
{
  "name": "Basic Email Alerts",
  "steps": [
    {
      "stepOrder": 1,
      "primaryMethods": ["email"],
      "recipients": ["admin@company.com"],
      "delayMinutes": 0,
      "repeatCount": 3,
      "escalateAfter": 5
    }
  ],
  "terminationCondition": "stop_after_last_step"
}
```

### **Multi-Channel Escalation Policy**
```json
{
  "name": "Production Critical Alerts",
  "steps": [
    {
      "stepOrder": 1,
      "primaryMethods": ["email", "slack"],
      "recipients": ["on-call-team"],
      "delayMinutes": 0,
      "repeatCount": 2,
      "escalateAfter": 5
    },
    {
      "stepOrder": 2,
      "primaryMethods": ["sms", "webhook"],
      "recipients": ["manager@company.com"],
      "delayMinutes": 2,
      "repeatCount": 1,
      "escalateAfter": 10
    }
  ],
  "terminationCondition": "repeat_last_step",
  "repeatLastStepIntervalMinutes": 30
}
```

---

## 🐛 **11. Troubleshooting**

### **Common Issues**
1. **Escalations not triggering**: Check if `escalationPolicyId` is set on website
2. **Notifications not sending**: Verify recipient IDs and notification method configs
3. **Escalations not stopping**: Ensure acknowledgment API is called correctly
4. **Duplicate incidents**: Worker has duplicate processing prevention

### **Debug Logs**
- Worker logs show escalation processing steps
- API logs show acknowledgment/resolution actions  
- Database logs show incident status changes

---

This completes the full escalation policy flow from monitor assignment to incident resolution! 🎉