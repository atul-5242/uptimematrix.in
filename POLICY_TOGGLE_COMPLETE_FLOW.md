# Complete Policy Toggle Flow - ON/OFF Scenarios

## 🔄 **Scenario 1: Toggle Policy BACK ON (Re-enable)**

### **What Happens When User Toggles ON**

1. **Frontend Action**: User clicks toggle switch to ON position
2. **API Call**: `POST /api/escalation-policies/toggle-monitor` with `enabled: true`
3. **Database Update**: Sets `website.escalationPolicyId = policyId`
4. **🆕 Enhanced Logic**: Re-enables escalations for existing stopped incidents

### **Enhanced Toggle ON Implementation**

```typescript
if (enabled) { // TOGGLE ON
  // Find incidents that were stopped when policy was disabled
  const stoppedIncidents = await prismaClient.incident.findMany({
    where: {
      websiteId: monitorId,
      status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
      endTime: null,
      nextEscalationTime: null // These were stopped
    }
  });
  
  if (stoppedIncidents.length > 0) {
    // Get escalation policy and restart from first step
    const escalationPolicy = await prismaClient.escalationPolicy.findUnique({
      where: { id: policyId },
      include: { steps: { orderBy: { stepOrder: "asc" } } }
    });
    
    // Restart escalations with 2-minute delay
    const nextEscalationTime = new Date(Date.now() + (2 * 60 * 1000));
    
    await prismaClient.incident.updateMany({
      where: { /* same conditions */ },
      data: {
        status: IncidentStatus.INVESTIGATING,
        currentEscalationStepId: firstStep.id,
        nextEscalationTime: nextEscalationTime,
        currentRepeatCount: 0,
        stepDelayCompleted: false,
        Acknowledged: false // Re-open for escalation
      }
    });
  }
}
```

### **Result of Toggle ON**
- ✅ **Policy re-assigned** to monitor
- ✅ **Existing incidents resumed** from first escalation step
- ✅ **New incidents** will use full escalation policy
- ✅ **2-minute grace period** before escalations restart

---

## 🛑 **Scenario 2: Toggle OFF During Active Escalation**

### **Critical Timing Question**: What if escalations are actively running?

Let's trace through a **real-time scenario**:

#### **Timeline Example**
```
10:00:00 - Monitor goes down, incident created
10:00:00 - Step 1: Email sent to team@company.com
10:05:00 - Step 1: Email sent again (repeat 1)
10:10:00 - Step 1: Email sent again (repeat 2)
10:12:30 - 🔴 USER TOGGLES POLICY OFF 🔴
10:15:00 - Step 1: Should send repeat 3? ❓
10:20:00 - Step 2: Should escalate to manager? ❓
```

### **What Actually Happens**

#### **Immediate Effect (10:12:30)**
```typescript
// Toggle OFF sets nextEscalationTime = null
await prismaClient.incident.updateMany({
  data: {
    nextEscalationTime: null, // 🔑 KEY: This stops everything
    Acknowledged: true,
    status: IncidentStatus.MONITORING
  }
});
```

#### **Worker Check (10:15:00)**
```typescript
// Worker looks for incidents to process
const incidentsDue = await prismaClient.incident.findMany({
  where: {
    nextEscalationTime: { lte: now }, // ❌ NULL is not <= now
    status: IncidentStatus.INVESTIGATING, // ❌ Status is now MONITORING
    Acknowledged: false // ❌ Now true
  }
});
// Result: incidentsDue = [] (empty array)
```

#### **Outcome**
- ✅ **10:15:00 email**: **NOT SENT** ❌
- ✅ **10:20:00 escalation**: **NOT SENT** ❌
- ✅ **All future notifications**: **STOPPED IMMEDIATELY** ✋

---

## 🔄 **Complete Flow Diagrams**

### **Escalation Running → Toggle OFF → Toggle ON**

```
┌─ Monitor Down (10:00)
│
├─ Step 1 Email (10:00) ✅ SENT
├─ Step 1 Repeat (10:05) ✅ SENT  
├─ Step 1 Repeat (10:10) ✅ SENT
│
├─ 🔴 TOGGLE OFF (10:12) 
│   └─ nextEscalationTime = null
│   └─ Acknowledged = true
│
├─ Step 1 Repeat (10:15) ❌ SKIPPED
├─ Step 2 Start (10:20) ❌ SKIPPED
│
├─ 🟢 TOGGLE ON (10:25)
│   └─ nextEscalationTime = 10:27 (2min delay)
│   └─ Reset to Step 1
│   └─ Acknowledged = false
│
└─ Step 1 Email (10:27) ✅ SENT (Fresh start)
```

### **New Incident After Toggle States**

```
Policy OFF: Monitor Down → Generic Email Only → END
Policy ON:  Monitor Down → Full Escalation Process → Steps 1,2,3...
```

---

## ⚡ **Real-time Behavior Analysis**

### **Question**: What if notification is being sent right now?

**Answer**: The notification that's **currently being processed** will complete, but the **next scheduled notification** will be skipped.

#### **Technical Reason**
1. **Current notification**: Already in progress, will finish
2. **Database update**: Sets `nextEscalationTime = null`
3. **Next worker check**: Finds no incidents to process
4. **Result**: Current completes, future stops

### **Question**: How quickly does toggle OFF take effect?

**Answer**: **Immediately** for future notifications, within **5 seconds** maximum.

#### **Why 5 seconds?**
```typescript
// Worker loop runs every 5 seconds
await sleep(5000);
```

So the longest delay is the current worker cycle completion.

---

## 🎯 **User Experience Summary**

### **Toggle OFF Experience**
1. **Immediate UI feedback**: Toggle shows OFF
2. **Current notification**: May complete if in progress
3. **Future notifications**: Stopped within 5 seconds
4. **Escalation**: Completely halted

### **Toggle ON Experience** 
1. **Immediate UI feedback**: Toggle shows ON
2. **Existing incidents**: Resume escalation in 2 minutes
3. **New incidents**: Use full escalation policy
4. **Fresh start**: Escalation begins from Step 1

---

## 🔧 **Technical Implementation Details**

### **Key Database Fields**
```sql
-- These control escalation processing
nextEscalationTime: TIMESTAMP | NULL  -- NULL = stopped
Acknowledged: BOOLEAN                  -- true = won't process
status: 'INVESTIGATING' | 'MONITORING' -- only INVESTIGATING escalates
```

### **Worker Query Logic**
```sql
-- Worker only processes incidents matching ALL conditions:
SELECT * FROM incident WHERE
  nextEscalationTime <= NOW()     -- Must have future time
  AND status = 'INVESTIGATING'    -- Must be investigating  
  AND Acknowledged = false        -- Must not be acknowledged
```

### **Toggle OFF Sets**
```sql
nextEscalationTime = NULL     -- ❌ Fails time check
Acknowledged = true           -- ❌ Fails acknowledgment check  
status = 'MONITORING'         -- ❌ Fails status check
```

**Result**: **Triple protection** ensures escalations stop immediately.

---

## 🚨 **Edge Cases Handled**

### **Case 1: Rapid Toggle OFF/ON**
- **Problem**: User toggles OFF then ON quickly
- **Solution**: Existing incidents resume with 2-minute delay

### **Case 2: Multiple Incidents**
- **Problem**: Monitor has several active incidents
- **Solution**: All incidents handled consistently

### **Case 3: Mid-step Toggle**
- **Problem**: Toggle happens between escalation steps
- **Solution**: Current step may complete, next step won't start

### **Case 4: Toggle During Delay**
- **Problem**: Toggle during step delay period
- **Solution**: Delay is cancelled, no notification sent

---

## 📊 **Performance Impact**

### **Toggle OFF**
- **Database**: 1-2 UPDATE queries
- **Worker**: Immediate skip (no processing)
- **Performance**: ✅ Excellent (reduces load)

### **Toggle ON**
- **Database**: 2-3 queries (check + update + policy fetch)
- **Worker**: Resumes normal processing
- **Performance**: ✅ Good (minimal overhead)

---

## ✅ **Final Answer Summary**

### **Toggle ON (Re-enable Policy)**
1. ✅ **Assigns policy** back to monitor
2. ✅ **Resumes stopped incidents** from Step 1 with 2-min delay
3. ✅ **New incidents** get full escalation
4. ✅ **Fresh escalation start** (not resume mid-step)

### **Toggle OFF During Active Escalation**
1. ✅ **Stops immediately** (within 5 seconds)
2. ✅ **Current notification** may complete
3. ✅ **Future notifications** completely stopped
4. ✅ **No more escalation steps** will run

**Both scenarios are handled gracefully with immediate effect and proper state management!** 🎉