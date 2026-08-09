import { prisma } from '../config/db.js';

export interface CustomerFilterParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class CustomerService {
  static async getCustomers(params: CustomerFilterParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { name: { contains: s } },
        { businessName: { contains: s } },
        { mobile: { contains: s } },
        { email: { contains: s } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.type) {
      where.type = params.type;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followups: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  static async createCustomer(data: any) {
    return prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        type: data.type,
        status: data.status,
        address: data.address,
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
        notes: data.notes || null,
      },
    });
  }

  static async updateCustomer(id: string, data: any) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Customer not found');
    }

    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        type: data.type,
        status: data.status,
        address: data.address,
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
        notes: data.notes || null,
      },
    });
  }

  static async addFollowup(customerId: string, note: string, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    return prisma.customerFollowup.create({
      data: {
        customerId,
        note,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  static async getFollowups(customerId: string) {
    return prisma.customerFollowup.findMany({
      where: { customerId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
