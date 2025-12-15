import express from 'express';
import { protectAuth } from '../middlewares/auth-middleware.js';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../controllers/product-controller.js'
import { authorizeRole } from '../middlewares/role-middleware.js';

const router = express.Router();

router.post("/", protectAuth, authorizeRole(['STORE', 'ADMIN']), createProduct);   // create product
router.get("/", protectAuth, authorizeRole(['STORE', 'ADMIN']), getProducts);      //  list products
// Public product listing for customers
router.get("/public", getProducts);
router.get("/:id", protectAuth, authorizeRole(['STORE', 'ADMIN']), getProductById); // get product by ID
router.put("/:id", protectAuth, authorizeRole(['STORE', 'ADMIN']), updateProduct);  // update product
router.delete("/:id", protectAuth, authorizeRole(['STORE', 'ADMIN']), deleteProduct); // delete product


export default router;  