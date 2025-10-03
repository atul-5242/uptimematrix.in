import express from "express";
import { authMiddleware } from "../../middlewares/middleware.js";
import { requirePermission } from "../../middlewares/authorization.js";
import { addWebsite, getWebsiteStatus, getAllMonitors, deleteWebsite } from "../../controllers/websiteControl.js";

const router = express.Router();

router.post("/websiteCreate", authMiddleware, requirePermission('monitor:create'), addWebsite);

router.get("/status/:websiteId", authMiddleware, requirePermission('monitor:view'), getWebsiteStatus);

router.delete("/delete", authMiddleware, requirePermission('monitor:delete'), deleteWebsite);

// 👇 New route for fetching all monitors/websites
router.get("/getAllWebsites", authMiddleware, requirePermission('monitor:view'), getAllMonitors);

export default router;
