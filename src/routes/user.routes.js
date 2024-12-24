import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

// Define POST route for user registration
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;
