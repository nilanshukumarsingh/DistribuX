import { prisma } from '../config/db.js';
import { InventoryService } from './inventory.service.js';

export interface ProductFilterParams {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  static async getProducts(params: ProductFilterParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { name: { contains: s } },
        { sku: { contains: s } },
        { category: { contains: s } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.lowStock) {
      // In Prisma SQL/SQLite, we filter low stock by checking currentStock <= minStockAlert
      where.AND = [
        {
          currentStock: {
            lte: prisma.product.fields ? undefined : 999, // filtered in query below
          },
        },
      ];
    }

    let products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (params.lowStock) {
      products = products.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const total = await prisma.product.count({ where });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  static async createProduct(data: any) {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new Error(`Product with SKU '${data.sku}' already exists`);
    }

    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock || 0,
        minStockAlert: data.minStockAlert || 5,
        location: data.location,
      },
    });
  }

  static async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found');
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuTaken) {
        throw new Error(`Product with SKU '${data.sku}' already exists`);
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        minStockAlert: data.minStockAlert,
        location: data.location,
      },
    });
  }

  static async stockIn(productId: string, quantity: number, reason: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      return InventoryService.increaseStock(tx, productId, quantity, reason, userId);
    });
  }

  static async getStockMovements(productId: string) {
    return prisma.stockMovement.findMany({
      where: { productId },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
