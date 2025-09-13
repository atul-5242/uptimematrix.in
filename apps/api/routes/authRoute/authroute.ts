import express from "express";
import { signIn, signUp, setSelectedOrganization } from "../../controllers/authControl.js";
import { acceptInvitation, verifyInvitation } from "../../controllers/invitation_requestController.js";
import { sendInvitations } from "../../controllers/invitationController.js";
import { authMiddleware } from "../../middlewares/middleware.js";

const router = express.Router()


router.post("/user/signup", signUp);
router.post("/user/signin",signIn);//It is a Login.

// Verify invitation endpoint
router.post('/verify-invitation', verifyInvitation);

// Accept invitation endpoint
router.post('/accept-invitation', acceptInvitation);

router.post('/send-invitations', authMiddleware, sendInvitations);

// Select organization endpoint
router.post("/select-organization", authMiddleware, setSelectedOrganization);

export default router;