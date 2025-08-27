import express from "express";
import { authMiddleware } from "../../middlewares/middleware.js";
import { addWebsite, getWebsiteStatus, getAllMonitors, deleteWebsite } from "../../controllers/websiteControl.js";

const router = express.Router();

router.post("/websiteCreate", authMiddleware, addWebsite);

router.get("/status/:websiteId", authMiddleware, getWebsiteStatus);

router.delete("/delete", authMiddleware, deleteWebsite);

// 👇 New route for fetching all monitors/websites
router.get("/getAllWebsites", authMiddleware, getAllMonitors);

export default router;
