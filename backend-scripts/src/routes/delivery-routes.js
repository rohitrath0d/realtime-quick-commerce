import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'

const router = express.Router();

// GET  /api/delivery/orders/unassigned   -> orders I can accept
// GET  /api/delivery/orders/my           -> orders assigned to me
// POST /api/delivery/orders/:id/accept   -> accept & lock
// POST /api/delivery/orders/:id/status   -> update status



export default router;  