import express from "express";
import { authMiddleware } from "../../middlewares/middleware";
import { addWebsite, getWebsiteStatus } from "../../controllers/websiteControl";
const router = express.Router()


router.post("/websiteCreate", authMiddleware,addWebsite);

router.get("/status/:websiteId",authMiddleware , getWebsiteStatus);

export default router;