import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js';
import {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
} from '../controllers/payment-controller.js';

const router = express.Router();

// All payment routes require authentication
router.use(protectAuth);

// Create a new Razorpay order
router.post('/create-order', createOrder);

// Verify payment after successful payment
router.post('/verify', verifyPayment);

// Get payment details
router.get('/details/:paymentId', getPaymentDetails);

// Refund a payment (admin only)
router.post('/refund', refundPayment);

export default router;