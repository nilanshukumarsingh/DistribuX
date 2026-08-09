import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await DashboardService.getStats();
    return sendSuccess(res, stats, 'Dashboard metrics fetched successfully');
  } catch (error) {
    next(error);
  }
}
