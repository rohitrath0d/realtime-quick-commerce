import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { acceptOrder, getMyAssignedOrders, getUnassignedDeliveries, 
  // updateOrderStatus 
} from '../controllers/delivery-controller.js';
import { authorizeRole } from '../middlewares/role-middleware.js';

const router = express.Router();

// GET  /api/delivery/orders/unassigned   -> orders I can accept
// GET  /api/delivery/orders/my           -> orders assigned to me
// POST /api/delivery/orders/:id/accept   -> accept & lock
// POST /api/delivery/orders/:id/status   -> update status


router.get(
  "/orders/unassigned",
  protectAuth,
  authorizeRole("DELIVERY"),
  getUnassignedDeliveries
);

router.post(
  "/orders/:id/accept",
  protectAuth,
  authorizeRole("DELIVERY"),
  acceptOrder
);

// router.post(
//   "/orders/:id/status",
//   protectAuth,
//   authorizeRole("DELIVERY"),
//   updateOrderStatus
// );

router.get(
  "/orders/my",
  protectAuth,
  authorizeRole("DELIVERY"),
  getMyAssignedOrders
);

export default router;  