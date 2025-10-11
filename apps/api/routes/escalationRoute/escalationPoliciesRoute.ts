import express from "express";
import { authMiddleware } from "../../middlewares/middleware.js";
import { requirePermission } from "../../middlewares/authorization.js";
import { createEscalationPolicy, getEscalationPolicies, updateEscalationPolicy, deleteEscalationPolicy, getPolicyMonitors, toggleMonitorPolicy, getPolicyDetails } from "../../controllers/escalationPoliciesController.js";
const router = express.Router();

router.get("/get-escalation-policies", authMiddleware, requirePermission('reporting:view'), getEscalationPolicies);
router.post("/create-escalation-policy", authMiddleware, requirePermission('escalation_policy:create'), createEscalationPolicy);
router.patch("/update-escalation-policy", authMiddleware, requirePermission('escalation_policy:edit'), updateEscalationPolicy);
router.delete("/delete-escalation-policy/:id", authMiddleware, requirePermission('escalation_policy:delete'), deleteEscalationPolicy);

// Monitor-Policy management routes
router.get("/:policyId/monitors", authMiddleware, requirePermission('reporting:view'), getPolicyMonitors);
router.post("/toggle-monitor", authMiddleware, requirePermission('escalation_policy:edit'), toggleMonitorPolicy);
router.get("/:policyId/details", authMiddleware, requirePermission('reporting:view'), getPolicyDetails);

export default router;
