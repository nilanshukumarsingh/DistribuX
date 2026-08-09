import { prisma } from '../config/db.js';
import { InventoryService } from './inventory.service.js';

export interface ChallanFilterParams {
  search?: string;
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class ChallanService {
  /**
   * Helper to generate unique challan number CH-YYYYMMDD-XXXX
   */
  private static async generateChallanNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.challan.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `CH-${dateStr}-${sequence}`;
  }

  static async getChallans(params: ChallanFilterParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { challanNumber: { contains: s } },
        { customer: { name: { contains: s } } },
        { customer: { businessName: { contains: s } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!challan) {
      throw new Error('Challan not found');
    }

    return challan;
  }

  /**
   * Create a new sales challan (as DRAFT).
   * Calculates totals and saves snapshot product data.
   */
  static async createChallan(data: { customerId: string; items: { productId: string; quantity: number }[] }, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Verify products exist and prepare snapshot items
    let totalQuantity = 0;
    let totalAmount = 0;

    const snapshotItems: {
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Product not found with ID ${item.productId}`);
      }

      const lineTotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      snapshotItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const challanNumber = await this.generateChallanNumber();

    return prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        totalAmount,
        status: 'DRAFT',
        createdById: userId,
        items: {
          create: snapshotItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  /**
   * Update an existing draft challan.
   */
  static async updateChallan(
    id: string,
    data: { customerId: string; items: { productId: string; quantity: number }[] }
  ) {
    const existing = await prisma.challan.findUnique({ where: { id }, include: { items: true } });
    if (!existing) {
      throw new Error('Challan not found');
    }

    if (existing.status !== 'DRAFT') {
      throw new Error(`Cannot update challan with status '${existing.status}'. Only DRAFT challans can be edited.`);
    }

    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    let totalQuantity = 0;
    let totalAmount = 0;
    const snapshotItems: {
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Product not found with ID ${item.productId}`);
      }

      const lineTotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      snapshotItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    return prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.challanItem.deleteMany({ where: { challanId: id } });

      return tx.challan.update({
        where: { id },
        data: {
          customerId: data.customerId,
          totalQuantity,
          totalAmount,
          items: {
            create: snapshotItems,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });
  }

  /**
   * CONFIRM Sales Challan in a SINGLE Database Transaction.
   * Performs pre-check on stock for all items, decreases stock, logs stock movement, and updates status to CONFIRMED.
   */
  static async confirmChallan(challanId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true },
      });

      if (!challan) {
        throw new Error('Challan not found');
      }

      if (challan.status === 'CONFIRMED') {
        throw new Error('Challan is already CONFIRMED');
      }

      if (challan.status === 'CANCELLED') {
        throw new Error('Cannot confirm a CANCELLED challan');
      }

      // Step 1: Pre-verify sufficient stock for ALL items in transaction
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productName} (${item.sku}) no longer exists.`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name} (${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}.`
          );
        }
      }

      // Step 2: Deduct stock & create OUT stock movement for every product
      for (const item of challan.items) {
        await InventoryService.decreaseStock(
          tx,
          item.productId,
          item.quantity,
          `Sales Challan Confirmation (${challan.challanNumber})`,
          userId
        );
      }

      // Step 3: Update challan status to CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' },
        include: { customer: true, items: true },
      });

      return confirmedChallan;
    });
  }

  /**
   * CANCEL Sales Challan.
   * If challan was CONFIRMED, return stock back to inventory inside transaction.
   */
  static async cancelChallan(challanId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true },
      });

      if (!challan) {
        throw new Error('Challan not found');
      }

      if (challan.status === 'CANCELLED') {
        throw new Error('Challan is already CANCELLED');
      }

      // If it was confirmed, return stock back
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          await InventoryService.increaseStock(
            tx,
            item.productId,
            item.quantity,
            `Stock Returned from Cancelled Sales Challan (${challan.challanNumber})`,
            userId
          );
        }
      }

      const cancelledChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: 'CANCELLED' },
        include: { customer: true, items: true },
      });

      return cancelledChallan;
    });
  }
}
