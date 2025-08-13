import express from "express";
import { signIn, signUp } from "../../controllers/authControl";
const router = express.Router()

router.post("/user/signup", signUp);

router.post("/user/signin",signIn);//It is a Login.

export default router;