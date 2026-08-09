import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { CustomerService } from '../services/customer.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCustomers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, status, type, page, limit } = req.query;
    const result = await CustomerService.getCustomers({
      search: search as string,
      status: status as string,
      type: type as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return sendSuccess(res, result, 'Customers fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customer = await CustomerService.getCustomerById(id);
    return sendSuccess(res, customer, 'Customer details fetched successfully');
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const customer = await CustomerService.createCustomer(req.body);
    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customer = await CustomerService.updateCustomer(id, req.body);
    return sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function addFollowup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user!.userId;

    const followup = await CustomerService.addFollowup(id, note, userId);
    return sendSuccess(res, followup, 'Follow-up note added successfully', 201);
  } catch (error: any) {
    if (error.message === 'Customer not found') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function getFollowups(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const followups = await CustomerService.getFollowups(id);
    return sendSuccess(res, followups, 'Customer follow-up history fetched');
  } catch (error) {
    next(error);
  }
}
