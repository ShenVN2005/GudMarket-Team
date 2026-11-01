import type {
  User,
  Product,
  Order,
  WithdrawRequest,
  WalletTransaction,
  ProductStatus,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5039/api';
const TOKEN_KEY = 'gudmarket_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Yêu cầu thất bại (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  // 1. Auth & User Profile
  login(email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(fullName: string, email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  getMe() {
    return request<{ user: User; transactions: WalletTransaction[] }>('/me');
  },

  // 2. Products
  getProducts(params?: { status?: ProductStatus; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  createProduct(data: { title: string; description: string; price: number; imageUrls: string[] }) {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProductStatus(id: string, status: ProductStatus) {
    return request<Product>(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 3. Orders
  getOrders() {
    return request<Order[]>('/orders');
  },

  createOrder(productId: string) {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  payWithWallet(orderId: string) {
    return request<Order>(`/orders/${orderId}/pay-with-wallet`, {
      method: 'POST',
    });
  },

  syncPayment(orderId: string) {
    return request<Order>(`/orders/${orderId}/sync-payment`, {
      method: 'POST',
    });
  },

  shipOrder(orderId: string, trackingCode: string) {
    return request<Order>(`/orders/${orderId}/ship`, {
      method: 'POST',
      body: JSON.stringify({ trackingCode }),
    });
  },

  confirmDelivery(orderId: string) {
    return request<Order>(`/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  },

  // 4. Disputes & Returns
  fileDispute(orderId: string, reason: string, evidenceUrls: string[]) {
    return request<Order>(`/orders/${orderId}/disputes`, {
      method: 'POST',
      body: JSON.stringify({ reason, evidenceUrls }),
    });
  },

  submitReturnTracking(orderId: string, returnTrackingCode: string) {
    return request<Order>(`/orders/${orderId}/return-ship`, {
      method: 'POST',
      body: JSON.stringify({ returnTrackingCode }),
    });
  },

  confirmReturnReceived(orderId: string) {
    return request<Order>(`/orders/${orderId}/return-confirm`, {
      method: 'POST',
    });
  },

  resolveDispute(
    orderId: string,
    decision: 'RELEASE_SELLER' | 'REFUND_BUYER' | 'REQUIRE_RETURN',
    note: string
  ) {
    return request<Order>(`/orders/${orderId}/resolve-dispute`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    });
  },

  // 5. Withdrawals
  getWithdrawals() {
    return request<WithdrawRequest[]>('/withdrawals');
  },

  createWithdrawal(data: {
    amount: number;
    bankName: string;
    accountNo: string;
    accountName: string;
  }) {
    return request<WithdrawRequest>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  processWithdrawal(id: string, status: 'COMPLETED' | 'REJECTED', note?: string) {
    return request<WithdrawRequest>(`/withdrawals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    });
  },
};
