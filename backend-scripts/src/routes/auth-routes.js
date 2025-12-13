import express from 'express';
import { loginController, registerController } from "../controllers/auth-controller.js"
import {protectAuth} from '../middlewares/auth-middleware.js'

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;