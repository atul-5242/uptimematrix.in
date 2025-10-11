# Toggle OFF Flow - Complete Analysis & Implementation

## 🔄 **What Happens When User Toggles OFF Escalation Policy**

### **Frontend Flow (User Action)**
1. **User clicks toggle switch** to OFF position in policy details dialog
2. **API Call**: `handleToggleMonitorPolicy(monitorId, false)` is triggered
3. **Request sent**: 
   ```json
   POST /api/escalation-policies/toggle-monitor
   {
     "policyId": "policy-uuid",
     "monitorId": "monitor-uuid", 
     "enabled": false
   }
   ```
4. **UI Updates**: Toggle switch shows OFF, policy status shows "Policy Disabled"

---

## 🔧 **Backend Processing (Enhanced Implementation)**

### **Database Update**
```sql
UPDATE website 
SET escalationPolicyId = NULL 
WHERE id = 'monitor-uuid'
```

### **🚨 CRITICAL: Active Incident Handling (NEW)**
When policy is disabled, the system now:

1. **Finds Active Incidents**:
   ```sql
   SELECT * FROM incident 
   WHERE websiteId = 'monitor-uuid' 
   AND status IN ('INVESTIGATING', 'MONITORING')
   AND endTime IS NULL
   ```

2. **Stops All Escalations**:
   ```sql
   UPDATE incident 
   SET nextEscalationTime = NULL,
       Acknowledged = true,
       status = 'MONITORING'
   WHERE websiteId = 'monitor-uuid'
   AND status IN ('INVESTIGATING', 'MONITORING')
   ```

3. **Console Logs**:
   ```
   ✅ Found 2 active incidents for monitor Example Monitor. Stopping escalations...
   ✅ Stopped escalations for 2 incidents after policy removal
   ```

---

## 🔍 **Worker Behavior After Toggle OFF**

### **When Monitor Goes Down (No Policy)**
1. **Detection**: Worker detects website offline
2. **Policy Check**: `website.escalationPolicyId = null`
3. **Escalation Handler**: Called with `escalationPolicyId = null`
4. **Fallback Behavior**:
   ```javascript
   if (!escalationPolicy || !escalationPolicy.isActive) {
       console.log(`No active escalation policy found for website ${site.url}. Sending generic notification.`);
       const adminEmails = await getRecipientsEmails([site.createdById || ""], organizationId);
       for (const email of adminEmails) {
           await sendEmail(
               email,
               `[${status}] ${site.url} is ${status} - No Active Policy`,
               'generic',
               { websiteUrl: site.url, status: status }
           );
       }
       return; // NO ESCALATION PROCESSING
   }
   ```

### **Result**: 
- ✅ **NO escalation steps are processed**
- ✅ **NO repeated notifications**
- ✅ **NO multi-channel alerts**
- ✅ **Only a simple email to monitor creator**

---

## 🛑 **What Gets Stopped When Toggle OFF**

### **Immediate Effects**
1. **Existing Active Incidents**: Escalations stopped immediately
2. **Future Incidents**: Will only send generic notifications
3. **Multi-step Escalation**: Completely disabled
4. **Repeated Alerts**: No more repeats
5. **Multi-channel Notifications**: Disabled (no Slack, SMS, webhooks)

### **What Still Happens**
1. **Monitor Continues Running**: Website monitoring doesn't stop
2. **Basic Notification**: Single email to monitor creator on outage
3. **Incident Creation**: Incidents are still created but without escalation
4. **Auto-resolution**: When site comes back online, incidents are resolved

---

## 📊 **Before vs After Toggle OFF**

### **WITH Escalation Policy (Toggle ON)**
```
Monitor Down → Incident Created → Multi-step Escalation Process
                                      ↓
Step 1: Email + Slack → Wait 5min → Repeat 3 times
                                      ↓  
Step 2: SMS + Webhook → Wait 10min → Repeat 2 times
                                      ↓
Continue until Acknowledged/Resolved
```

### **WITHOUT Escalation Policy (Toggle OFF)**
```
Monitor Down → Incident Created → Single Generic Email → END
                                      ↓
NO escalation steps, NO repeats, NO multi-channel alerts
```

---

## 🔧 **Implementation Details**

### **Enhanced Toggle Controller**
```typescript
export const toggleMonitorPolicy = async (req: Request, res: Response) => {
  // ... existing code ...
  
  // Update monitor's escalation policy assignment
  const updatedMonitor = await prismaClient.website.update({
    where: { id: monitorId },
    data: { escalationPolicyId: enabled ? policyId : null }
  });
  
  // CRITICAL: Handle existing incidents when policy is disabled
  if (!enabled) {
    const activeIncidents = await prismaClient.incident.findMany({
      where: {
        websiteId: monitorId,
        status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
        endTime: null
      }
    });
    
    if (activeIncidents.length > 0) {
      await prismaClient.incident.updateMany({
        where: {
          websiteId: monitorId,
          status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
          endTime: null
        },
        data: {
          nextEscalationTime: null, // Stops escalations
          Acknowledged: true,
          status: IncidentStatus.MONITORING
        }
      });
    }
  }
}
```

---

## ⚡ **Real-time Effects**

### **Scenario: Monitor with Active Escalation**
1. **Current State**: Monitor has escalation policy, incident is escalating
2. **User Action**: Toggles policy OFF
3. **Immediate Result**: 
   - Database updated: `escalationPolicyId = null`
   - Active incidents: `nextEscalationTime = null` (stops escalations)
   - Worker: Will skip escalation processing on next check
   - UI: Shows "Policy Disabled"

### **Scenario: Monitor Goes Down After Toggle OFF**
1. **Detection**: Worker detects outage
2. **Policy Check**: `escalationPolicyId = null` 
3. **Action**: Single email sent to monitor creator
4. **No Further Action**: No escalation steps, no repeats

---

## 🎯 **User Experience**

### **What Users See**
- ✅ **Immediate feedback**: Toggle switch reflects OFF state
- ✅ **Clear status**: "Policy Disabled" indicator
- ✅ **Escalation stopped**: No more escalation emails/notifications
- ✅ **Basic monitoring continues**: Still get notified of outages (basic email)

### **What Users Don't See (But Happens)**
- 🔧 **Active incidents handled**: Existing escalations stopped
- 🔧 **Database cleanup**: Policy assignments removed
- 🔧 **Worker behavior change**: Escalation processing skipped

---

## 🐛 **Edge Cases Handled**

### **Case 1: Multiple Active Incidents**
- **Problem**: Monitor has multiple ongoing incidents
- **Solution**: All incidents get `nextEscalationTime = null`

### **Case 2: Mid-escalation Toggle**
- **Problem**: User toggles OFF while step 2 of 3 is running
- **Solution**: Current step completes, but no future steps run

### **Case 3: Toggle OFF then ON quickly**
- **Problem**: User changes mind quickly
- **Solution**: Policy reassigned, new incidents will use escalation

---

## 📈 **Monitoring & Logging**

### **Console Logs When Toggle OFF**
```
🔄 Monitor "Production API" removed from policy "Critical Alerts"
✅ Found 1 active incidents for monitor Production API. Stopping escalations...
✅ Stopped escalations for 1 incidents after policy removal
```

### **Console Logs When Monitor Goes Down (No Policy)**
```
❌ https://api.example.com is offline, Status: 500, 120ms
📧 No active escalation policy found for website https://api.example.com. Sending generic notification.
✅ Generic notification sent to admin@company.com
```

---

## ✅ **Summary: Toggle OFF Functionality**

### **What It Does**
1. ✅ **Removes policy assignment** from monitor
2. ✅ **Stops active escalations** immediately  
3. ✅ **Prevents future escalations** for new incidents
4. ✅ **Maintains basic monitoring** with simple notifications
5. ✅ **Provides immediate feedback** in UI

### **What It Doesn't Do**
1. ❌ **Stop monitoring entirely** (monitoring continues)
2. ❌ **Delete incidents** (incidents remain for history)
3. ❌ **Affect other monitors** (only the toggled monitor)
4. ❌ **Break anything** (graceful degradation)

The toggle OFF functionality now provides complete control over escalation policies with proper handling of edge cases and existing incidents! 🎉