import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from '../controllers/challan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { challanSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallans);
router.post('/', authorize('ADMIN', 'SALES'), validate(challanSchema), createChallan);
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallanById);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(challanSchema), updateChallan);

router.post('/:id/confirm', authorize('ADMIN', 'SALES', 'WAREHOUSE'), confirmChallan);
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), cancelChallan);

export default router;
