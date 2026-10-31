const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

function backendUnavailableMessage(): string {
  if (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')) {
    return `Backend nije dostupan na ${API_BASE}. U drugom terminalu pokrenite: cd gandras-spot/backend && npm run start:dev`;
  }
  return `Backend nije dostupan (${API_BASE}). Osvežite stranicu ili pokušajte ponovo za nekoliko sekundi.`;
}

export type ApiResponse<T> = { success: boolean; data: T; message?: string };

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gandras_token');
}

export function setToken(token: string) {
  localStorage.setItem('gandras_token', token);
}

export function clearToken() {
  localStorage.removeItem('gandras_token');
}

function formatErrorMessage(body: Record<string, unknown>, status: number): string {
  const msg = body.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string' && msg) {
    if (msg === 'Invalid credentials') return 'Pogrešan email ili lozinka.';
    if (msg === 'No restaurant access') return 'Nalog nema pristup restoranu.';
    return msg;
  }
  return `API greška (${status})`;
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const requestUrl = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(backendUnavailableMessage());
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatErrorMessage(json as Record<string, unknown>, res.status));
  }
  return (json.data ?? json) as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ accessToken: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),
  me: () => api<unknown>('/auth/me'),
};

export const ordersApi = {
  list: (status?: string) => api<unknown[]>(`/orders${status ? `?status=${status}` : ''}`),
  listNew: () => api<unknown[]>('/orders/new'),
  get: (id: string) => api<unknown>(`/orders/${id}`),
  track: (token: string) =>
    api<unknown>(`/orders/track/${encodeURIComponent(token)}`, { auth: false }),
  create: (body: unknown) =>
    api<unknown>('/orders', { method: 'POST', body: JSON.stringify(body), auth: false }),
  accept: (id: string, estimatedMinutes: number, internalNote?: string) =>
    api<unknown>(`/orders/${id}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ estimatedMinutes, internalNote }),
    }),
  reject: (id: string, reason?: string) =>
    api<unknown>(`/orders/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  updateStatus: (id: string, status: string, note?: string) =>
    api<unknown>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
};

export const dashboardApi = {
  get: () => api<DashboardData>('/admin/dashboard'),
};

export const menuApi = {
  public: () => api<PublicMenuData>('/products', { auth: false }),
  admin: () => api<AdminMenuData>('/admin/menu'),
  create: (type: MenuItemType, body: MenuItemInput) =>
    api<MenuItemRecord>(`/admin/menu/${type}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (type: MenuItemType, id: string, body: MenuItemInput) =>
    api<void>(`/admin/menu/${type}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (type: MenuItemType, id: string) =>
    api<void>(`/admin/menu/${type}/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/admin/menu/upload`, {
        method: 'POST',
        headers,
        body: form,
      });
    } catch {
      throw new Error(backendUnavailableMessage());
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatErrorMessage(json as Record<string, unknown>, res.status));
    }
    return (json.data ?? json) as { url: string };
  },
};

export type MenuItemType = 'burger' | 'bread' | 'ingredient' | 'extra' | 'drink';

export interface MenuItemInput {
  name: string;
  price?: number;
  description?: string;
  imageUrl?: string | null;
  categorySlug?: string;
  isAvailable?: boolean;
}

export interface MenuItemRecord {
  id: string;
  slug?: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  categorySlug?: string | null;
  isAvailable: boolean;
}

export type ApiMenuRow = MenuItemRecord;

export interface AdminMenuData {
  products: MenuItemRecord[];
  breads: MenuItemRecord[];
  ingredients: MenuItemRecord[];
  extras: MenuItemRecord[];
  drinks: MenuItemRecord[];
}

export interface PublicMenuData {
  burgers: MenuItemRecord[];
  products?: MenuItemRecord[];
  breads: MenuItemRecord[];
  ingredients: MenuItemRecord[];
  extras: MenuItemRecord[];
  drinks: MenuItemRecord[];
}

export const customersApi = {
  list: () => api<CustomerRow[]>('/admin/customers'),
};

export interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  orderCount: number;
  totalSpent: number;
  avgCheck: number;
  lastOrderAt: string | null;
}

export const inventoryApi = {
  suppliers: () => api<SupplierRow[]>('/admin/inventory/suppliers'),
  createSupplier: (body: { name: string; phone?: string; email?: string; note?: string }) =>
    api<SupplierRow>('/admin/inventory/suppliers', { method: 'POST', body: JSON.stringify(body) }),
  updateSupplier: (id: string, body: { name?: string; phone?: string; email?: string; note?: string }) =>
    api<SupplierRow>(`/admin/inventory/suppliers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  stock: () => api<StockRow[]>('/admin/inventory/stock'),
  createStock: (body: Record<string, unknown>) =>
    api<StockRow>('/admin/inventory/stock', { method: 'POST', body: JSON.stringify(body) }),
  updateStock: (id: string, body: { name?: string; quantity?: number; minQuantity?: number; supplierId?: string | null }) =>
    api<StockRow>(`/admin/inventory/stock/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delivery: (body: { supplierId: string; note?: string; items: { stockItemId: string; quantity: number }[] }) =>
    api<unknown>('/admin/inventory/deliveries', { method: 'POST', body: JSON.stringify(body) }),
  lowStock: () => api<StockRow[]>('/admin/inventory/low-stock'),
};

export interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
}

export interface StockRow {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  supplier?: SupplierRow | null;
  drink?: { id: string; name: string } | null;
  extra?: { id: string; name: string } | null;
}

export const reportsApi = {
  summary: (from?: string, to?: string) =>
    api<ReportsSummary>(`/admin/reports${from || to ? `?from=${from ?? ''}&to=${to ?? ''}` : ''}`),
  csvUrl: (from?: string, to?: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('gandras_token') : '';
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    return `${base}/admin/reports/export/csv?${q.toString()}&token=${token}`;
  },
};

export interface ReportsSummary {
  period: { from: string; to: string };
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
  avgOrderValue: number;
  deliveryCount: number;
  pickupCount: number;
  cashCount: number;
  cardCount: number;
  topProducts: { name: string; count: number; revenue: number }[];
  topCustomers: CustomerRow[];
  lowStock: StockRow[];
}

export interface RestaurantSettingsPayload {
  name?: string;
  settings?: Partial<RestaurantSettingsFields>;
}

export interface RestaurantSettingsFields {
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  workingHours: Record<string, string> | null;
  deliveryFee: number;
  freeDeliveryMin: number;
  minOrderAmount: number;
  isOpen: boolean;
  cashEnabled: boolean;
  cardEnabled: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  taxRate: number;
  courierPayPerDelivery: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface RestaurantSettingsData {
  id: string;
  name: string;
  slug: string;
  settings: RestaurantSettingsFields;
}

export const settingsApi = {
  get: () => api<RestaurantSettingsData>('/admin/settings'),
  update: (body: RestaurantSettingsPayload) =>
    api<RestaurantSettingsData>('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),
};

export interface PublicRestaurantData {
  id: string;
  name: string;
  slug: string;
  settings: RestaurantSettingsFields;
}

export const restaurantApi = {
  public: () => api<PublicRestaurantData>('/restaurant', { auth: false }),
};

export const kitchenApi = {
  orders: () => api<unknown[]>('/kitchen/orders'),
};

export const deliveryApi = {
  orders: () => api<unknown[]>('/kitchen/delivery'),
};

export interface CourierDeliveryOrder {
  id: string;
  displayId: string;
  status: string;
  driverId: string | null;
  customerFirstName: string;
  customerLastName: string | null;
  customerPhone: string;
  customerAddress: string | null;
  customerCity: string | null;
  customerNote: string | null;
  total: number;
  deliveryFee: number;
  completedAt: string | null;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice?: number;
    kind?: string | null;
    options?: Record<string, unknown> | null;
  }>;
}

export interface CourierEarningsPeriod {
  count: number;
  total: number;
  deliveries: Array<{
    id: string;
    displayId: string;
    completedAt: string;
    customerAddress: string | null;
    customerCity: string | null;
    pay: number;
  }>;
}

export interface CourierDashboard {
  driver: {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    status: string;
    payPerDelivery: number;
  };
  queue: CourierDeliveryOrder[];
  active: CourierDeliveryOrder[];
  earnings: {
    payPerDelivery: number;
    today: CourierEarningsPeriod;
    week: CourierEarningsPeriod;
    month: CourierEarningsPeriod;
  };
}

export const courierApi = {
  dashboard: () => api<CourierDashboard>('/courier/dashboard'),
  claim: (id: string) =>
    api<CourierDashboard>(`/courier/orders/${id}/claim`, { method: 'PATCH' }),
  complete: (id: string) =>
    api<CourierDashboard>(`/courier/orders/${id}/complete`, { method: 'PATCH' }),
  setStatus: (status: string) =>
    api<unknown>('/courier/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const driversApi = {
  list: () => api<unknown[]>('/admin/drivers'),
  createCourier: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone: string;
    payPerDelivery?: number;
  }) =>
    api<unknown>('/admin/drivers/courier-account', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateCourier: (
    id: string,
    body: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      payPerDelivery?: number | null;
    },
  ) =>
    api<unknown>(`/admin/drivers/${id}/courier-account`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (id: string) => api<unknown>(`/admin/drivers/${id}`, { method: 'DELETE' }),
};

export interface DashboardData {
  stats: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    revenue: number;
    revenueChangePercent: number;
    avgOrderValue: number;
    deliveries: number;
    pickups: number;
    topProducts: { name: string; count: number; revenue: number }[];
  };
  revenueByDay: { label: string; revenue: number; orders: number }[];
  recentOrders: Array<{
    id: string;
    displayId: string;
    token: string;
    status: string;
    total: number;
    customer: { firstName: string; phone: string };
    deliveryMethod: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export interface ApiOrder {
  id: string;
  orderNumber: number;
  token: string;
  displayId: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  paymentMethod: string;
  customer: {
    firstName: string;
    lastName?: string;
    phone: string;
    address?: string;
    city?: string;
    note?: string;
  };
  internalNote?: string;
  items: Array<{ name: string; unitPrice: number; totalPrice: number; quantity: number; note?: string; kind?: string | null; options?: Record<string, unknown> | null }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  estimatedMinutes: number | null;
  estimatedReadyAt: string | null;
  driverId?: string | null;
  driver?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    phone: string;
  } | null;
  createdAt: string;
  statusHistory?: Array<{ status: string; createdAt: string; note?: string }>;
}
