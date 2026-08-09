import { Router } from 'express';
import { getAllStockMovements } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/movements', authorize('ADMIN', 'WAREHOUSE'), getAllStockMovements);

export default router;
