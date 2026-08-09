import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  stockIn,
  getStockMovements,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { productSchema, stockInSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getProducts);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validate(productSchema), createProduct);
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getProductById);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), validate(productSchema), updateProduct);

router.get('/:id/stock-movements', authorize('ADMIN', 'WAREHOUSE'), getStockMovements);
router.post('/:id/stock-in', authorize('ADMIN', 'WAREHOUSE'), validate(stockInSchema), stockIn);

export default router;
