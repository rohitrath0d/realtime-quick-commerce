import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js'
import { authorizeRole } from '../middlewares/role-middleware.js';
import { acceptOrder, createStore, deleteStore, getStore, getStoreStats, listAllStoreOrders, listStoreOrders, markPacked, startPacking } from '../controllers/store-controller.js';

const router = express.Router();

router.post("/", protectAuth, authorizeRole("STORE"), createStore);

router.get("/", protectAuth, authorizeRole("STORE"), getStore); //  GET / → get store info - Returns whether the store exists and, if it does, its details.

// Orders workflow
router.get("/orders", protectAuth, authorizeRole("STORE"), listStoreOrders);  // get orders for the store - Returns only orders associated with the store.
router.get("/orders/all", protectAuth, authorizeRole("STORE"), listAllStoreOrders);
router.get("/stats", protectAuth, authorizeRole("STORE"), getStoreStats);

router.post("/orders/:id/accept", protectAuth, authorizeRole("STORE"), acceptOrder);
router.post("/orders/:id/packing", protectAuth, authorizeRole("STORE"), startPacking);
router.post("/orders/:id/packed", protectAuth, authorizeRole("STORE"), markPacked);

// router.post(
//   "/orders/:id/status",
//   protectAuth,
//   authorizeRole("STORE"),
//   updateOrderStatus
// );

// Store management
router.delete("/:id", authorizeRole("STORE"), deleteStore);

export default router;  