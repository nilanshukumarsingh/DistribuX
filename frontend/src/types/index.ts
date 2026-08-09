export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface CustomerFollowup {
  id: string;
  customerId: string;
  note: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  type: CustomerType;
  status: CustomerStatus;
  address: string;
  followupDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followups?: CustomerFollowup[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  type: StockMovementType;
  reason: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
  product?: Product;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  items: ChallanItem[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProductsCount: number;
  draftChallans: number;
  confirmedChallans: number;
  recentMovements: StockMovement[];
  upcomingFollowups: {
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    status: CustomerStatus;
    followupDate: string;
    notes?: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: { field?: string; message: string }[];
}
