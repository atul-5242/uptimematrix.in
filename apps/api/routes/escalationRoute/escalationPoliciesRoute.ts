import express from "express";
import { authMiddleware } from "../../middlewares/middleware.js";
import { createEscalationPolicy, getEscalationPolicies, updateEscalationPolicy, deleteEscalationPolicy } from "../../controllers/escalationPoliciesController.js";
const router = express.Router();

router.get("/get-escalation-policies", authMiddleware, getEscalationPolicies);
router.post("/create-escalation-policy", authMiddleware, createEscalationPolicy);
router.patch("/update-escalation-policy", authMiddleware, updateEscalationPolicy);
router.delete("/delete-escalation-policy/:id", authMiddleware, deleteEscalationPolicy);

export default router;
