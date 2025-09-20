import { Router } from "express";
import { getRegions } from "../controllers/regionsController.js";

const router = Router();

router.get("/", getRegions);

export default router;
