import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { getMyOrders, getOrderById, placeOrder } from '../controllers/order-controller.js';
import { authorizeRole } from '../middlewares/role-middleware.js';

const router = express.Router();

// IMPORTANT: More specific routes MUST come before parameterized routes
// PUT /my BEFORE /:id to avoid route conflicts

router.post("/", protectAuth, authorizeRole("CUSTOMER"), placeOrder);      // place order
router.get("/my", protectAuth, authorizeRole("CUSTOMER"), getMyOrders);     // order details   // get customer's orders (MUST BE BEFORE /:id)
router.get("/:id", protectAuth, authorizeRole("CUSTOMER"), getOrderById);   // list customer orders   // get single order details


export default router;  