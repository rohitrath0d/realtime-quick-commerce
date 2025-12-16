import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { authorizeRole } from '../middlewares/role-middleware.js';
import { adminDeleteStore, listAllStores, listDeliveryPartners, listOrders, liveStats } from '../controllers/admin-controller.js'

const router = express.Router();

// List all orders (optional query ?status=PLACED)
router.get(
  "/orders",
  protectAuth,
  authorizeRole("ADMIN"),
  // getAllOrders
  listOrders
);

// List all delivery partners
router.get(
  "/delivery-partners",
  protectAuth,
  authorizeRole("ADMIN"),
  listDeliveryPartners
);

// Live stats: totalOrders, placed, packed, delivered
router.get(
  "/live-stats",
  protectAuth,
  authorizeRole("ADMIN"),
  liveStats
);

// List all stores
router.get(
  "/stores",
  protectAuth,
  authorizeRole("ADMIN"),
  listAllStores
);


// Admin delete any store
router.delete(
  "/stores/:id",
  protectAuth,
  authorizeRole("ADMIN"),
  adminDeleteStore
);


export default router;