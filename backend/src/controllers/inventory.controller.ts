import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

export async function getAllStockMovements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, type } = req.query;
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 15;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (type) {
      where.type = type as string;
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          product: {
            select: { id: true, name: true, sku: true, category: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return sendSuccess(
      res,
      {
        movements,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      'Stock movements log fetched'
    );
  } catch (error) {
    next(error);
  }
}
