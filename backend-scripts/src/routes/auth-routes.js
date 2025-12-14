import express from 'express';
import { loginController, registerController, getUserProfileController } from "../controllers/auth-controller.js"
import {protectAuth} from '../middlewares/auth-middleware.js'

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", protectAuth, getUserProfileController );

export default router;