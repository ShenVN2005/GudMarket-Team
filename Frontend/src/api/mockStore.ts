import type { User, Product, Order, WithdrawRequest, WalletTransaction } from './types';

const STORAGE_KEY = 'GUDMARKET_MOCK_STORE_V1';

export interface MockDataState {
  currentUserId: string;
  users: User[];
  products: Product[];
  orders: Order[];
  withdrawRequests: WithdrawRequest[];
  transactions: WalletTransaction[];
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user-buyer-1',
    email: 'buyer@gudmarket.vn',
    fullName: 'Nguyễn Văn An (Người mua)',
    role: 'USER',
    balance: 2500000,
    lockedBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-seller-1',
    email: 'seller@gudmarket.vn',
    fullName: 'Trần Minh (Người bán)',
    role: 'USER',
    balance: 500000,
    lockedBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-1',
    email: 'admin@gudmarket.vn',
    fullName: 'Ban Quản Trị GudMarket',
    role: 'ADMIN',
    balance: 0,
    lockedBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-macbook-m1',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Cầu Giấy, Hà Nội',
    title: 'MacBook Air M1 2020 (8GB/256GB) Chính Hãng',
    description: 'Đẹp 98%, pin 91%, nguyên bản đầy đủ hộp và sạc zin theo máy.',
    price: 11500000,
    imageUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'prod-sofa-felt',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Quận 1, TP.HCM',
    title: 'Sofa Văng Nỉ Xanh Rêu 1m8 Khung Gỗ Sồi',
    description: 'Dùng được 8 tháng, khung gỗ sồi tự nhiên còn cứng cáp, nỉ đã giặt sạch.',
    price: 2450000,
    imageUrls: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'RESERVED',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'prod-sony-a6400',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Hải Châu, Đà Nẵng',
    title: 'Máy ảnh Sony A6400 + Lens Kit 16-50mm',
    description: '6.000 shot, sensor sạch đẹp, hoạt động hoàn hảo không lỗi.',
    price: 14200000,
    imageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'SOLD',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'prod-breville-870',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Thanh Xuân, Hà Nội',
    title: 'Máy Pha Cà Phê Breville 870XL Gia Đình',
    description: 'Đầy đủ phụ kiện tamper, giỏ lọc đôi. Áp suất ổn định, máy dùng giữ gìn.',
    price: 8900000,
    imageUrls: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'prod-walnut-table',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Bình Thạnh, TP.HCM',
    title: 'Bàn Trà Gỗ Óc Chó Chân Tiện Tròn',
    description: 'Gỗ óc chó tự nhiên nguyên khối, bề mặt có trầy xước nhẹ qua sử dụng.',
    price: 850000,
    imageUrls: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'prod-apple-watch-s8',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    sellerLocation: 'Đống Đa, Hà Nội',
    title: 'Apple Watch Series 8 Bản Nhôm 41mm GPS',
    description: 'Như mới 99%, pin 98%, kèm sạc nhanh và dây đeo thể thao theo máy.',
    price: 4600000,
    imageUrls: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-demo-1',
    orderCode: 849201,
    productId: 'prod-macbook-m1',
    productTitle: 'MacBook Air M1 2020 (8GB/256GB) Chính Hãng',
    productImageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    buyerId: 'user-buyer-1',
    sellerId: 'user-seller-1',
    sellerName: 'Trần Minh',
    amount: 11500000,
    platformFee: 575000, // 5%
    sellerNetAmount: 10925000,
    status: 'ESCROW_HOLDING',
    deadlineAt: new Date(Date.now() + 72 * 3600000 - 18000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-init-1',
    userId: 'user-buyer-1',
    type: 'LATE_OR_OVERPAYMENT_CREDIT',
    amount: 2500000,
    lockedDelta: 0,
    balanceAfter: 2500000,
    lockedBalanceAfter: 0,
    description: 'Số dư nạp ban đầu cho tài khoản thử nghiệm',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getInitialState(): MockDataState {
  return {
    currentUserId: 'user-buyer-1',
    users: INITIAL_USERS,
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    withdrawRequests: [],
    transactions: INITIAL_TRANSACTIONS,
  };
}

export function loadStore(): MockDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveStore(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialState();
  }
}

export function saveStore(state: MockDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function resetStore(): MockDataState {
  const initial = getInitialState();
  saveStore(initial);
  return initial;
}
