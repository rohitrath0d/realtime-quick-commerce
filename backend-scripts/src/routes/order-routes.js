import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { getMyOrders, getOrderById, placeOrder } from '../controllers/order-controller.js';
import { authorizeRole } from '../middlewares/role-middleware.js';

const router = express.Router();

router.post("/", protectAuth, authorizeRole("CUSTOMER"), placeOrder);      // place order
router.get("/:id", protectAuth, authorizeRole("CUSTOMER"), getOrderById);                                // list customer orders
router.get("/my", protectAuth, authorizeRole("CUSTOMER"), getMyOrders);     // order details

export default router;  