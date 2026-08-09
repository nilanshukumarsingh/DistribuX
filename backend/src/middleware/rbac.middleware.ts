import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types/index.js';
import { sendError } from '../utils/response.js';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated', 401);
    }

    // ADMIN always has full access
    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return sendError(
      res,
      `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      403
    );
  };
}
