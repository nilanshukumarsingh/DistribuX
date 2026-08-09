import { prisma } from '../config/db.js';

export class DashboardService {
  static async getStats() {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      allProducts,
      draftChallans,
      confirmedChallans,
      recentMovements,
      upcomingFollowups,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.product.findMany({ select: { id: true, currentStock: true, minStockAlert: true } }),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true, role: true } },
        },
      }),
      prisma.customer.findMany({
        where: {
          followupDate: { not: null },
        },
        take: 5,
        orderBy: { followupDate: 'asc' },
        select: {
          id: true,
          name: true,
          businessName: true,
          mobile: true,
          status: true,
          followupDate: true,
          notes: true,
        },
      }),
    ]);

    const lowStockProductsCount = allProducts.filter((p) => p.currentStock <= p.minStockAlert).length;

    return {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProductsCount,
      draftChallans,
      confirmedChallans,
      recentMovements,
      upcomingFollowups,
    };
  }
}
