import express from 'express';
import {protectAuth} from '../middlewares/auth-middleware.js'

const router = express.Router();

router.get("/", protectAuth, getProducts);

export default router;  