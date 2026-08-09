import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(8, 'Mobile number must be at least 8 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().or(z.literal('')),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  address: z.string().min(3, 'Address is required'),
  followupDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const followupSchema = z.object({
  note: z.string().min(2, 'Note content is required'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Price must be greater than 0'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minStockAlert: z.number().int().min(0).default(5),
  location: z.string().min(1, 'Warehouse location is required'),
});

export const stockInSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  reason: z.string().min(2, 'Reason for stock in is required'),
});

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const challanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  items: z.array(challanItemSchema).min(1, 'At least one product item is required'),
});
