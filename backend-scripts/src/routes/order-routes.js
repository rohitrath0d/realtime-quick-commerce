import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { getMyOrders, getOrderById, placeOrder } from '../controllers/order-controller.js';

const router = express.Router();

router.post("/", protectAuth, placeOrder);      // place order
router.get("/", protectAuth, getOrderById);    // list my orders
router.get("/", protectAuth, getMyOrders);     // order details

export default router;  