import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { authorizeRole } from '../middlewares/role-middleware.js';
import { adminDeleteStore, listDeliveryPartners, listOrders, liveStats } from '../controllers/admin-controller.js'

const router = express.Router();

router.get(
  "/admin/orders",
  protectAuth,
  authorizeRole("ADMIN"),
  // getAllOrders
  listOrders
);

router.get(
  "/admin/orders",
  protectAuth,
  authorizeRole("ADMIN"),
  listDeliveryPartners
);

router.get(
  "/admin/orders",
  protectAuth,
  authorizeRole("ADMIN"),
  liveStats
);

router.delete("/stores/:id", adminDeleteStore);


export default router;