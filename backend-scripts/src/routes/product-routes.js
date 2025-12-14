import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js';
import { getProducts, createProduct } from '../controllers/product-controller.js'

const router = express.Router();

router.post("/", protectAuth, createProduct);   // create product
router.get("/", protectAuth, getProducts);      //  list products

export default router;  