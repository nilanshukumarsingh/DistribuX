import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginSchema } from '../validators/index.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getCurrentUser);

export default router;
