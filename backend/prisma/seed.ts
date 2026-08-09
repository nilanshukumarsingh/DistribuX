import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clean existing tables
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (All 4 Roles)
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

  console.log('✓ Seeded 4 Users with roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS');

  // 2. Seed 12 Customers
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
      followupDate: new Date(Date.now() + 86400000 * 2), // +2 days
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
      status: 'ACTIVE',
      address: 'GIDC Industrial Estate, Vadodara, Gujarat',
      followupDate: new Date(Date.now() - 86400000 * 1), // Overdue
      notes: 'Key distributor for West region. Quarterly review needed.',
    },
    {
      name: 'Suresh Kumar',
      mobile: '+919655443322',
      email: 'suresh@skhardware.com',
      businessName: 'SK Hardware Store',
      gstNumber: '33DDDDD3333D4Z4',
      type: 'RETAIL',
      status: 'LEAD',
      address: '12 Anna Salai, Chennai, TN',
      followupDate: new Date(Date.now() + 86400000 * 3),
      notes: 'New lead from trade show. Requested catalog and price list.',
    },
    {
      name: 'Meera Nair',
      mobile: '+919544332211',
      email: 'meera@nairconstructions.com',
      businessName: 'Nair Construction & Supplies',
      gstNumber: '32EEEEE4444E5Z7',
      type: 'WHOLESALE',
      status: 'ACTIVE',
      address: 'MG Road, Kochi, Kerala',
      followupDate: new Date(Date.now() + 86400000 * 7),
      notes: 'Monthly bulk orders for plumbing and electrical fixtures.',
    },
    {
      name: 'Amitabh Sen',
      mobile: '+919433221100',
      email: 'amitabh@sensteel.com',
      businessName: 'Sen Steel & Pipe Depot',
      gstNumber: '19FFFFF5555F6Z2',
      type: 'DISTRIBUTOR',
      status: 'ACTIVE',
      address: 'Strand Road, Kolkata, WB',
      followupDate: null,
      notes: 'High volume credit customer.',
    },
    {
      name: 'Pooja Reddy',
      mobile: '+919322110099',
      email: 'pooja@reddyagri.com',
      businessName: 'Reddy Agricultural Tools',
      gstNumber: '36GGGGG6666G7Z9',
      type: 'WHOLESALE',
      status: 'INACTIVE',
      address: 'Banjara Hills, Hyderabad, TS',
      followupDate: null,
      notes: 'Account dormant since last quarter. Re-engagement pitch needed.',
    },
    {
      name: 'Rohan Mehta',
      mobile: '+919211009988',
      email: 'rohan@mehtaelectricals.com',
      businessName: 'Mehta Electrical Solutions',
      gstNumber: '27HHHHH7777H8Z3',
      type: 'RETAIL',
      status: 'LEAD',
      address: 'Kothrud, Pune, MH',
      followupDate: new Date(Date.now() + 86400000 * 1),
      notes: 'Inquired about solar inverter accessories.',
    },
    {
      name: 'Deepak Joshi',
      mobile: '+919100998877',
      email: 'deepak@joshisupply.com',
      businessName: 'Joshi Supply Chain Ltd',
      gstNumber: '08IIIII8888I9Z6',
      type: 'DISTRIBUTOR',
      status: 'ACTIVE',
      address: 'VKIA Industrial Area, Jaipur, RJ',
      followupDate: new Date(Date.now() + 86400000 * 4),
      notes: 'Distribution contract renewal coming up.',
    },
    {
      name: 'Sunil Gupta',
      mobile: '+919099887766',
      email: 'sunil@guptabuildcon.com',
      businessName: 'Gupta Buildcon Pvt Ltd',
      gstNumber: '09JJJJJ9999J0Z1',
      type: 'WHOLESALE',
      status: 'ACTIVE',
      address: 'Sector 62, Noida, UP',
      followupDate: null,
      notes: 'Large builder account.',
    },
    {
      name: 'Kavita Singh',
      mobile: '+918988776655',
      email: 'kavita@singhmachinery.com',
      businessName: 'Singh Machinery Tools',
      gstNumber: null,
      type: 'RETAIL',
      status: 'LEAD',
      address: 'GT Road, Ludhiana, Punjab',
      followupDate: new Date(Date.now() + 86400000 * 6),
      notes: 'Small retailer inquiring about sample shipments.',
    },
    {
      name: 'Harish Choudhury',
      mobile: '+918877665544',
      email: 'harish@choudhurytools.com',
      businessName: 'Choudhury Hardware Mart',
      gstNumber: '18KKKKK1234K1Z5',
      type: 'RETAIL',
      status: 'ACTIVE',
      address: 'GS Road, Guwahati, Assam',
      followupDate: null,
      notes: 'Regional retail partner.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✓ Seeded ${createdCustomers.length} Customers`);

  // Customer Followups
  await prisma.customerFollowup.createMany({
    data: [
      {
        customerId: createdCustomers[0].id,
        note: 'Called client regarding initial inquiry for industrial fasteners. Sent product brochure.',
        createdById: salesUser.id,
      },
      {
        customerId: createdCustomers[0].id,
        note: 'Followed up via WhatsApp. Client confirmed interest in ordering 50 units next week.',
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

  // 3. Seed 16 Products
  const productData = [
    {
      name: 'Heavy Duty Industrial Fastener 10mm',
      sku: 'FAST-10MM-HD',
      category: 'Fasteners',
      unitPrice: 15.5,
      currentStock: 500,
      minStockAlert: 100,
      location: 'Warehouse A - Rack 01',
    },
    {
      name: 'Stainless Steel Bolt M12 x 50',
      sku: 'BOLT-M12-SS',
      category: 'Fasteners',
      unitPrice: 22.0,
      currentStock: 350,
      minStockAlert: 50,
      location: 'Warehouse A - Rack 02',
    },
    {
      name: 'Copper Armored Cable 3-Core 4sqmm (100m Roll)',
      sku: 'CABL-3C4SQ-100M',
      category: 'Electrical Cables',
      unitPrice: 4500.0,
      currentStock: 25,
      minStockAlert: 10,
      location: 'Warehouse B - Zone E1',
    },
    {
      name: 'Flexible PVC Conduit Pipe 25mm (50m)',
      sku: 'PIPE-PVC-25MM',
      category: 'Conduits & Pipes',
      unitPrice: 850.0,
      currentStock: 4, // LOW STOCK ALERT!
      minStockAlert: 15,
      location: 'Warehouse B - Zone P3',
    },
    {
      name: 'Modular Switch Socket 16A 2-in-1',
      sku: 'ELEC-SW16A-MOD',
      category: 'Electrical Wiring',
      unitPrice: 125.0,
      currentStock: 200,
      minStockAlert: 30,
      location: 'Warehouse A - Rack 08',
    },
    {
      name: 'Industrial Miniature Circuit Breaker (MCB) 32A 3-Pole',
      sku: 'MCB-32A-3P',
      category: 'Electrical Wiring',
      unitPrice: 650.0,
      currentStock: 3, // LOW STOCK ALERT!
      minStockAlert: 10,
      location: 'Warehouse A - Rack 10',
    },
    {
      name: 'LED High Bay Light 150W Industrial',
      sku: 'LED-HB150W-IND',
      category: 'Lighting',
      unitPrice: 2800.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse C - Shelf L1',
    },
    {
      name: 'Safety Helmet Hardhat Yellow',
      sku: 'PPE-HELMET-YEL',
      category: 'Safety Equipment',
      unitPrice: 350.0,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse A - Rack 15',
    },
    {
      name: 'Heavy Duty Leather Work Gloves (Pair)',
      sku: 'PPE-GLOVES-LTHR',
      category: 'Safety Equipment',
      unitPrice: 180.0,
      currentStock: 250,
      minStockAlert: 40,
      location: 'Warehouse A - Rack 16',
    },
    {
      name: 'Hydraulic Pipe Wrench 18-Inch',
      sku: 'TOOL-WRNCH-18IN',
      category: 'Hand Tools',
      unitPrice: 1200.0,
      currentStock: 18,
      minStockAlert: 5,
      location: 'Warehouse C - Shelf T4',
    },
    {
      name: 'Electric Rotary Hammer Drill 800W',
      sku: 'POWER-DRILL-800W',
      category: 'Power Tools',
      unitPrice: 4200.0,
      currentStock: 2, // LOW STOCK ALERT!
      minStockAlert: 8,
      location: 'Warehouse C - Shelf P1',
    },
    {
      name: 'Brass Ball Valve 1-Inch Female Thread',
      sku: 'PLUMB-BVALVE-1IN',
      category: 'Plumbing',
      unitPrice: 420.0,
      currentStock: 90,
      minStockAlert: 20,
      location: 'Warehouse B - Zone V2',
    },
    {
      name: 'CPVC Solvant Cement 500ml Can',
      sku: 'PLUMB-CPVC-500ML',
      category: 'Plumbing',
      unitPrice: 290.0,
      currentStock: 60,
      minStockAlert: 15,
      location: 'Warehouse B - Zone C1',
    },
    {
      name: 'Industrial Extension Board Heavy Duty 4-Way 15A',
      sku: 'ELEC-EXT-4WAY',
      category: 'Electrical Wiring',
      unitPrice: 950.0,
      currentStock: 35,
      minStockAlert: 10,
      location: 'Warehouse A - Rack 09',
    },
    {
      name: 'Digital Multimeter AC/DC Clamp Meter',
      sku: 'METER-CLAMP-DIG',
      category: 'Test & Measurement',
      unitPrice: 2400.0,
      currentStock: 15,
      minStockAlert: 5,
      location: 'Warehouse C - Shelf M2',
    },
    {
      name: 'Teflon Thread Seal Tape 12mm x 10m (Box of 10)',
      sku: 'TAPE-TEFLON-10PK',
      category: 'Plumbing',
      unitPrice: 150.0,
      currentStock: 180,
      minStockAlert: 30,
      location: 'Warehouse B - Zone T1',
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log(`✓ Seeded ${createdProducts.length} Products`);

  // Stock movements (Initial Stock IN)
  for (const prod of createdProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantityChanged: prod.currentStock,
        type: 'IN',
        reason: 'Initial Inventory Inward Intake',
        createdById: warehouseUser.id,
      },
    });
  }
  console.log('✓ Created initial Stock Movements for all products');

  // 4. Seed Challans (1 Confirmed, 1 Draft)
  // Challan 1: Confirmed
  const ch1Number = 'CH-20260808-0001';
  const item1Product = createdProducts[0]; // Fasteners, unitPrice 15.5
  const item2Product = createdProducts[2]; // Copper Cable, unitPrice 4500.0

  const line1 = 15.5 * 100; // 1550
  const line2 = 4500.0 * 2; // 9000
  const totalQty1 = 102;
  const totalAmt1 = line1 + line2;

  const confirmedChallan = await prisma.challan.create({
    data: {
      challanNumber: ch1Number,
      customerId: createdCustomers[0].id,
      totalQuantity: totalQty1,
      totalAmount: totalAmt1,
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

  // Log stock movement OUT for confirmed challan 1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: item1Product.id,
        quantityChanged: 100,
        type: 'OUT',
        reason: `Sales Challan Confirmation (${ch1Number})`,
        createdById: salesUser.id,
      },
      {
        productId: item2Product.id,
        quantityChanged: 2,
        type: 'OUT',
        reason: `Sales Challan Confirmation (${ch1Number})`,
        createdById: salesUser.id,
      },
    ],
  });

  // Challan 2: Draft
  const ch2Number = 'CH-20260808-0002';
  const draftChallanItemProduct = createdProducts[6]; // LED light, 2800.0
  const lineDraft = 2800.0 * 5; // 14000

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
            productId: draftChallanItemProduct.id,
            productName: draftChallanItemProduct.name,
            sku: draftChallanItemProduct.sku,
            unitPrice: draftChallanItemProduct.unitPrice,
            quantity: 5,
            lineTotal: lineDraft,
          },
        ],
      },
    },
  });

  console.log('✓ Seeded initial Challans (1 CONFIRMED, 1 DRAFT)');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
