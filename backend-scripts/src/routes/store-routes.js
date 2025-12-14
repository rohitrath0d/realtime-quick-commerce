import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { authorizeRole } from '../middlewares/role-middleware.js';
import { createStore, deleteStore, listStoreOrders, markPacked, startPacking } from '../controllers/store-controller.js';
import { acceptOrder } from '../controllers/delivery-controller.js';


const router = express.Router();

router.post(
  "/store/orders/:id/status",
  protectAuth,
  authorizeRole("STORE"),
  // updateStoreOrderStatus
);

// Store endpoints
router.use(protectAuth);

// Orders workflow
router.get("/orders", listStoreOrders);
router.post("/orders/:id/accept", acceptOrder);
router.post("/orders/:id/packing", startPacking);
router.post("/orders/:id/packed", markPacked);

// Store management
router.post("/", createStore);
router.delete("/:id", deleteStore);

export default router;  