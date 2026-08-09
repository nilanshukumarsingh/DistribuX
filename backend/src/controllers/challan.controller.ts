import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ChallanService } from '../services/challan.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getChallans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, status, customerId, page, limit } = req.query;
    const result = await ChallanService.getChallans({
      search: search as string,
      status: status as string,
      customerId: customerId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return sendSuccess(res, result, 'Challans fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getChallanById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const challan = await ChallanService.getChallanById(id);
    return sendSuccess(res, challan, 'Challan details fetched successfully');
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function createChallan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const challan = await ChallanService.createChallan(req.body, userId);
    return sendSuccess(res, challan, 'Sales challan created as draft', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create challan', 400);
  }
}

export async function updateChallan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const challan = await ChallanService.updateChallan(id, req.body);
    return sendSuccess(res, challan, 'Draft challan updated successfully');
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message, 400);
  }
}

export async function confirmChallan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const challan = await ChallanService.confirmChallan(id, userId);
    return sendSuccess(res, challan, 'Sales challan confirmed successfully. Stock deducted.');
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      return sendError(res, error.message, 404);
    }
    // Return meaningful inventory or status errors as 400 Bad Request
    return sendError(res, error.message, 400);
  }
}

export async function cancelChallan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const challan = await ChallanService.cancelChallan(id, userId);
    return sendSuccess(res, challan, 'Sales challan cancelled');
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message, 400);
  }
}
