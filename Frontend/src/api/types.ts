// 1. Core Models matching DB Schema exactly
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  balance: number;        // BIGINT in VND
  lockedBalance: number;  // BIGINT in VND
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus =
  | 'PENDING_APPROVAL'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'REJECTED'
  | 'HIDDEN';

export interface Product {
  id: string;
  sellerId: string;
  sellerName?: string;
  sellerLocation?: string;
  title: string;
  description: string;
  price: number;          // >= 2000 VND
  imageUrls: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'ESCROW_HOLDING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'RETURN_PENDING'
  | 'RETURNING'
  | 'RETURN_DELIVERED'
  | 'RETURN_DISPUTED'
  | 'CLOSED_REFUNDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Order {
  id: string;
  orderCode: number;     // BIGINT positive integer for payOS
  productId: string;
  productTitle?: string;
  productImageUrl?: string;
  buyerId: string;
  sellerId: string;
  sellerName?: string;
  amount: number;
  platformFee: number;
  sellerNetAmount: number;
  status: OrderStatus;
  deadlineAt: string | null; // ISO-8601 UTC
  shippingTrackingCode?: string | null;
  returnTrackingCode?: string | null;
  disputeReason?: string | null;
  buyerEvidenceUrls?: string[];
  sellerEvidenceUrls?: string[];
  returnDisputeReason?: string | null;
  returnSellerEvidenceUrls?: string[];
  adminResolutionNote?: string | null;
  resolvedBy?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountName: string;
  status: WithdrawStatus;
  processedBy?: string | null;
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export type WalletTransactionType =
  | 'PAYOS_ESCROW_IN'
  | 'ORDER_PAYMENT'
  | 'ESCROW_RELEASE'
  | 'ESCROW_REFUND'
  | 'LATE_OR_OVERPAYMENT_CREDIT'
  | 'WITHDRAW_LOCK'
  | 'WITHDRAW_COMPLETE'
  | 'WITHDRAW_REJECT_UNLOCK';

export interface WalletTransaction {
  id: string;
  userId: string;
  orderId?: string | null;
  withdrawRequestId?: string | null;
  providerTxId?: string | null;
  type: WalletTransactionType;
  amount: number;        // delta on available balance
  lockedDelta: number;   // delta on locked_balance
  balanceAfter: number;
  lockedBalanceAfter: number;
  description: string;
  createdAt: string;
}

// 2. Zero-Jargon Friendly Label Mappings (UI Translation)
export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; badgeClass: string; stepIndex: number }> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
    stepIndex: 0,
  },
  ESCROW_HOLDING: {
    label: 'Đã thanh toán • Chờ người bán gửi hàng',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    stepIndex: 1,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    stepIndex: 2,
  },
  DELIVERED: {
    label: 'Đã giao hàng • 48 giờ kiểm tra',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    stepIndex: 2,
  },
  COMPLETED: {
    label: 'Hoàn tất (Đã chuyển tiền người bán)',
    badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-200',
    stepIndex: 3,
  },
  DISPUTED: {
    label: 'Đang khiếu nại • GudMarket đang hỗ trợ',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
    stepIndex: 2,
  },
  RETURN_PENDING: {
    label: 'Đồng ý trả hàng • Chờ gửi lại',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
    stepIndex: 2,
  },
  RETURNING: {
    label: 'Đang gửi trả hàng về người bán',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/60',
    stepIndex: 2,
  },
  RETURN_DELIVERED: {
    label: 'Người bán đã nhận hàng trả • Kiểm tra',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/60',
    stepIndex: 2,
  },
  RETURN_DISPUTED: {
    label: 'Tranh chấp hàng trả • Admin đang xử lý',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
    stepIndex: 2,
  },
  CLOSED_REFUNDED: {
    label: 'Đã hoàn tiền về ví người mua',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    stepIndex: 3,
  },
  CANCELLED: {
    label: 'Đã hủy đơn',
    badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    stepIndex: 3,
  },
  EXPIRED: {
    label: 'Đã hết hạn thanh toán',
    badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    stepIndex: 3,
  },
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, { label: string; badgeClass: string }> = {
  PENDING_APPROVAL: { label: 'Chờ duyệt', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/60' },
  AVAILABLE: { label: 'Đang bán', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  RESERVED: { label: 'Đang giao dịch', badgeClass: 'bg-emerald-600 text-white border-transparent' },
  SOLD: { label: 'Đã bán', badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  REJECTED: { label: 'Từ chối duyệt', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60' },
  HIDDEN: { label: 'Đang ẩn', badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

export const WALLET_TX_LABELS: Record<WalletTransactionType, { label: string; isPositive: boolean }> = {
  PAYOS_ESCROW_IN: { label: 'Nạp tiền thanh toán qua VietQR', isPositive: true },
  ORDER_PAYMENT: { label: 'Thanh toán mua hàng', isPositive: false },
  ESCROW_RELEASE: { label: 'Tiền bán hàng đã hoàn tất', isPositive: true },
  ESCROW_REFUND: { label: 'Hoàn tiền đơn hàng vào ví', isPositive: true },
  LATE_OR_OVERPAYMENT_CREDIT: { label: 'Cộng tiền thanh toán bổ sung', isPositive: true },
  WITHDRAW_LOCK: { label: 'Tạo lệnh rút tiền về ngân hàng', isPositive: false },
  WITHDRAW_COMPLETE: { label: 'Rút tiền ngân hàng thành công', isPositive: false },
  WITHDRAW_REJECT_UNLOCK: { label: 'Hoàn lại số dư rút tiền', isPositive: true },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

