import express from "express";
import { signIn, signUp } from "../../controllers/authControl.js";
import { acceptInvitation, verifyInvitation } from "../../controllers/invitation_requestController.js";

const router = express.Router()


router.post("/user/signup", signUp);
router.post("/user/signin",signIn);//It is a Login.

// Verify invitation endpoint
router.post('/verify-invitation', verifyInvitation);

// Accept invitation endpoint
router.post('/accept-invitation', acceptInvitation);

export default router;