import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ProductService } from '../services/product.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getProducts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, category, lowStock, page, limit } = req.query;
    const result = await ProductService.getProducts({
      search: search as string,
      category: category as string,
      lowStock: lowStock === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return sendSuccess(res, result, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    return sendSuccess(res, product, 'Product details fetched successfully');
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await ProductService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message && error.message.includes('already exists')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
}

export async function stockIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const userId = req.user!.userId;

    const product = await ProductService.stockIn(id, quantity, reason, userId);
    return sendSuccess(res, product, `Stock increased by ${quantity}`);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
}

export async function getStockMovements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const movements = await ProductService.getStockMovements(id);
    return sendSuccess(res, movements, 'Stock movements fetched');
  } catch (error) {
    next(error);
  }
}
