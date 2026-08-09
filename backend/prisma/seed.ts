import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Clean Database Seeding (3 items per module)...');

  // Clean existing tables
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed 4 Role Users
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const salesPasswordHash = await bcrypt.hash('Sales123!', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse123!', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Global Administrator',
      email: 'admin@company.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales Manager',
      email: 'sales@company.com',
      password: salesPasswordHash,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Walter Warehouse Lead',
      email: 'warehouse@company.com',
      password: warehousePasswordHash,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Alex Accounts Officer',
      email: 'accounts@company.com',
      password: accountsPasswordHash,
      role: 'ACCOUNTS',
    },
  });

  console.log('✓ Seeded 4 Role Accounts (admin, sales, warehouse, accounts)');

  // 2. Seed Exactly 3 Customers
  const customerData = [
    {
      name: 'Rajesh Sharma',
      mobile: '+919876543210',
      email: 'rajesh@apexretail.com',
      businessName: 'Apex Retail Enterprises',
      gstNumber: '27AAAAA0000A1Z5',
      type: 'RETAIL',
      status: 'ACTIVE',
      address: 'Shop 14, Commercial Market, Mumbai, MH',
      followupDate: new Date(Date.now() + 86400000 * 2),
      notes: 'Interested in bulk purchase of industrial fasteners next month.',
    },
    {
      name: 'Anita Verma',
      mobile: '+919812345678',
      email: 'anita@vermatraders.co.in',
      businessName: 'Verma Wholesale Traders',
      gstNumber: '07BBBBA1111B2Z8',
      type: 'WHOLESALE',
      status: 'ACTIVE',
      address: 'Plot 45, Okhla Industrial Area Phase 3, New Delhi',
      followupDate: new Date(Date.now() + 86400000 * 5),
      notes: 'Regular wholesale client. Expecting discount on large cable orders.',
    },
    {
      name: 'Vikram Patel',
      mobile: '+919711223344',
      email: 'vikram@gujaratdistributors.com',
      businessName: 'Gujarat Electrical Distributors',
      gstNumber: '24CCCCC2222C3Z1',
      type: 'DISTRIBUTOR',
      status: 'LEAD',
      address: 'GIDC Industrial Estate, Vadodara, Gujarat',
      followupDate: new Date(Date.now() + 86400000 * 1),
      notes: 'Key distributor for West region. Quarterly review needed.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✓ Seeded ${createdCustomers.length} Customers`);

  // Customer Followups (3 entries)
  await prisma.customerFollowup.createMany({
    data: [
      {
        customerId: createdCustomers[0].id,
        note: 'Called client regarding initial inquiry for industrial fasteners. Sent product catalog.',
        createdById: salesUser.id,
      },
      {
        customerId: createdCustomers[1].id,
        note: 'Discussed wholesale discount tiers with Anita. Offered 8% bulk discount.',
        createdById: salesUser.id,
      },
      {
        customerId: createdCustomers[2].id,
        note: 'Scheduled quarterly meeting with Vikram for distribution target alignment.',
        createdById: salesUser.id,
      },
    ],
  });
  console.log('✓ Seeded 3 Customer Follow-ups');

  // 3. Seed Exactly 3 Products
  const productData = [
    {
      name: 'Heavy Duty Industrial Fastener 10mm',
      sku: 'FAST-10MM-HD',
      category: 'Fasteners',
      unitPrice: 15.5,
      currentStock: 400,
      minStockAlert: 100,
      location: 'Warehouse A - Rack 01',
    },
    {
      name: 'Copper Armored Cable 3-Core 4sqmm (100m Roll)',
      sku: 'CABL-3C4SQ-100M',
      category: 'Electrical Cables',
      unitPrice: 4500.0,
      currentStock: 23,
      minStockAlert: 10,
      location: 'Warehouse B - Zone E1',
    },
    {
      name: 'Flexible PVC Conduit Pipe 25mm (50m)',
      sku: 'PIPE-PVC-25MM',
      category: 'Conduits & Pipes',
      unitPrice: 850.0,
      currentStock: 4, // LOW STOCK ALERT
      minStockAlert: 15,
      location: 'Warehouse B - Zone P3',
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log(`✓ Seeded ${createdProducts.length} Products`);

  // 4. Seed Stock Movements (3 entries)
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: createdProducts[0].id,
        quantityChanged: 500,
        type: 'IN',
        reason: 'Initial Inventory Inward Intake',
        createdById: warehouseUser.id,
      },
      {
        productId: createdProducts[1].id,
        quantityChanged: 25,
        type: 'IN',
        reason: 'Initial Inventory Inward Intake',
        createdById: warehouseUser.id,
      },
      {
        productId: createdProducts[0].id,
        quantityChanged: 100,
        type: 'OUT',
        reason: 'Sales Challan Confirmation (CH-20260808-0001)',
        createdById: salesUser.id,
      },
    ],
  });
  console.log('✓ Seeded 3 Stock Movements');

  // 5. Seed Exactly 3 Sales Challans (1 CONFIRMED, 1 DRAFT, 1 CANCELLED)
  // Challan 1: CONFIRMED
  const ch1Number = 'CH-20260808-0001';
  const item1Product = createdProducts[0]; // Fastener, 15.5
  const item2Product = createdProducts[1]; // Copper Cable, 4500.0
  const line1 = 15.5 * 100;
  const line2 = 4500.0 * 2;

  await prisma.challan.create({
    data: {
      challanNumber: ch1Number,
      customerId: createdCustomers[0].id,
      totalQuantity: 102,
      totalAmount: line1 + line2,
      status: 'CONFIRMED',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: item1Product.id,
            productName: item1Product.name,
            sku: item1Product.sku,
            unitPrice: item1Product.unitPrice,
            quantity: 100,
            lineTotal: line1,
          },
          {
            productId: item2Product.id,
            productName: item2Product.name,
            sku: item2Product.sku,
            unitPrice: item2Product.unitPrice,
            quantity: 2,
            lineTotal: line2,
          },
        ],
      },
    },
  });

  // Challan 2: DRAFT
  const ch2Number = 'CH-20260808-0002';
  const itemDraft = createdProducts[2]; // Conduit Pipe, 850.0
  const lineDraft = 850.0 * 5;

  await prisma.challan.create({
    data: {
      challanNumber: ch2Number,
      customerId: createdCustomers[1].id,
      totalQuantity: 5,
      totalAmount: lineDraft,
      status: 'DRAFT',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: itemDraft.id,
            productName: itemDraft.name,
            sku: itemDraft.sku,
            unitPrice: itemDraft.unitPrice,
            quantity: 5,
            lineTotal: lineDraft,
          },
        ],
      },
    },
  });

  // Challan 3: CANCELLED
  const ch3Number = 'CH-20260808-0003';
  await prisma.challan.create({
    data: {
      challanNumber: ch3Number,
      customerId: createdCustomers[2].id,
      totalQuantity: 10,
      totalAmount: 155.0,
      status: 'CANCELLED',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: item1Product.id,
            productName: item1Product.name,
            sku: item1Product.sku,
            unitPrice: item1Product.unitPrice,
            quantity: 10,
            lineTotal: 155.0,
          },
        ],
      },
    },
  });

  console.log('✓ Seeded 3 Sales Challans (1 CONFIRMED, 1 DRAFT, 1 CANCELLED)');
  console.log('✅ Clean database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
