import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowup,
  getFollowups,
} from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { customerSchema, followupSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomers);
router.post('/', authorize('ADMIN', 'SALES'), validate(customerSchema), createCustomer);
router.get('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS'), getCustomerById);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(customerSchema), updateCustomer);

router.get('/:id/followups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), getFollowups);
router.post('/:id/followups', authorize('ADMIN', 'SALES'), validate(followupSchema), addFollowup);

export default router;
