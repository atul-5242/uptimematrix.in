import express from "express";
import { authMiddleware } from "../../middlewares/middleware.js";
import { addWebsite, getWebsiteStatus, getAllWebsites } from "../../controllers/websiteControl.js";

const router = express.Router();

router.post("/websiteCreate", authMiddleware, addWebsite);

router.get("/status/:websiteId", authMiddleware, getWebsiteStatus);

// 👇 New route for fetching all monitors/websites
router.get("/getAllWebsites", authMiddleware, getAllWebsites);

export default router;
