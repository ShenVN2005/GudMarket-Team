import type {
  User,
  Product,
  Order,
  WithdrawRequest,
  WalletTransaction,
  ProductStatus,
} from './types';
import { loadStore, saveStore, resetStore } from './mockStore';

// Helper to calculate 5% platform fee rounded down
function calculateFee(amount: number) {
  const platformFee = Math.floor((amount * 500) / 10000);
  const sellerNetAmount = amount - platformFee;
  return { platformFee, sellerNetAmount };
}

export const apiClient = {
  // 1. Current Session & Users
  async getCurrentUser(): Promise<User> {
    const store = loadStore();
    const user = store.users.find((u) => u.id === store.currentUserId) || store.users[0];
    return { ...user };
  },

  async getAllUsers(): Promise<User[]> {
    const store = loadStore();
    return [...store.users];
  },

  async switchUser(userId: string): Promise<User> {
    const store = loadStore();
    const found = store.users.find((u) => u.id === userId);
    if (!found) throw new Error('User not found');
    store.currentUserId = userId;
    saveStore(store);
    return { ...found };
  },

  async resetData(): Promise<void> {
    resetStore();
  },

  // 2. Products
  async getProducts(filter?: { status?: ProductStatus; search?: string }): Promise<Product[]> {
    const store = loadStore();
    let result = [...store.products];
    if (filter?.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getProductById(id: string): Promise<Product | null> {
    const store = loadStore();
    const item = store.products.find((p) => p.id === id);
    return item ? { ...item } : null;
  },

  async createProduct(data: {
    title: string;
    description: string;
    price: number;
    imageUrls: string[];
    location?: string;
  }): Promise<Product> {
    const store = loadStore();
    const user = await this.getCurrentUser();
    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      sellerId: user.id,
      sellerName: user.fullName,
      sellerLocation: data.location || 'Toàn quốc',
      title: data.title,
      description: data.description,
      price: data.price,
      imageUrls:
        data.imageUrls.length > 0
          ? data.imageUrls
          : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'],
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.products.unshift(newProduct);
    saveStore(store);
    return newProduct;
  },

  async updateProductStatus(id: string, status: ProductStatus): Promise<Product> {
    const store = loadStore();
    const prod = store.products.find((p) => p.id === id);
    if (!prod) throw new Error('Sản phẩm không tồn tại');
    prod.status = status;
    prod.updatedAt = new Date().toISOString();
    saveStore(store);
    return { ...prod };
  },

  // 3. Orders & Escrow Lifecycle
  async getOrders(): Promise<Order[]> {
    const store = loadStore();
    const user = await this.getCurrentUser();
    if (user.role === 'ADMIN') {
      return [...store.orders];
    }
    return store.orders.filter((o) => o.buyerId === user.id || o.sellerId === user.id);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const store = loadStore();
    const found = store.orders.find((o) => o.id === id);
    return found ? { ...found } : null;
  },

  async createOrder(productId: string): Promise<Order> {
    const store = loadStore();
    const buyer = await this.getCurrentUser();
    const product = store.products.find((p) => p.id === productId);

    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.status !== 'AVAILABLE') throw new Error('Sản phẩm đã có người đặt mua hoặc không sẵn sàng');
    if (product.sellerId === buyer.id) throw new Error('Bạn không thể tự mua sản phẩm của chính mình');

    const { platformFee, sellerNetAmount } = calculateFee(product.price);
    const orderCode = Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: 'order-' + Date.now(),
      orderCode,
      productId: product.id,
      productTitle: product.title,
      productImageUrl: product.imageUrls[0],
      buyerId: buyer.id,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      amount: product.price,
      platformFee,
      sellerNetAmount,
      status: 'PENDING_PAYMENT',
      deadlineAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lock product
    product.status = 'RESERVED';
    product.updatedAt = new Date().toISOString();

    store.orders.unshift(newOrder);
    saveStore(store);
    return newOrder;
  },

  async payWithWallet(orderId: string): Promise<Order> {
    const store = loadStore();
    const buyer = store.users.find((u) => u.id === store.currentUserId);
    const order = store.orders.find((o) => o.id === orderId);

    if (!order || !buyer) throw new Error('Không tìm thấy đơn hàng hoặc người dùng');
    if (order.status !== 'PENDING_PAYMENT') throw new Error('Đơn hàng không ở trạng thái chờ thanh toán');
    if (buyer.balance < order.amount) throw new Error('Số dư ví không đủ để thanh toán');

    // Deduct buyer balance
    buyer.balance -= order.amount;
    buyer.updatedAt = new Date().toISOString();

    // Record transaction
    const tx: WalletTransaction = {
      id: 'tx-' + Date.now(),
      userId: buyer.id,
      orderId: order.id,
      type: 'ORDER_PAYMENT',
      amount: -order.amount,
      lockedDelta: 0,
      balanceAfter: buyer.balance,
      lockedBalanceAfter: buyer.lockedBalance,
      description: `Thanh toán đơn hàng #${order.orderCode} (${order.productTitle})`,
      createdAt: new Date().toISOString(),
    };
    store.transactions.unshift(tx);

    // Update order status
    order.status = 'ESCROW_HOLDING';
    order.deadlineAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString(); // 72 hours
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return { ...order };
  },

  async simulatePayOsWebhook(orderCode: number): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.orderCode === orderCode);
    if (!order) throw new Error('Không tìm thấy đơn hàng tương ứng');

    if (order.status === 'PENDING_PAYMENT') {
      order.status = 'ESCROW_HOLDING';
      order.deadlineAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      order.updatedAt = new Date().toISOString();

      const tx: WalletTransaction = {
        id: 'tx-payos-' + Date.now(),
        userId: order.buyerId,
        orderId: order.id,
        providerTxId: 'PAYOS_' + order.orderCode + '_' + Date.now(),
        type: 'PAYOS_ESCROW_IN',
        amount: 0,
        lockedDelta: 0,
        balanceAfter: 0,
        lockedBalanceAfter: 0,
        description: `Thanh toán chuyển khoản VietQR đơn #${order.orderCode} (GudMarket giữ hộ)`,
        createdAt: new Date().toISOString(),
      };
      store.transactions.unshift(tx);
    }

    saveStore(store);
    return { ...order };
  },

  async shipOrder(orderId: string, trackingCode: string): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');
    if (order.status !== 'ESCROW_HOLDING') throw new Error('Đơn không ở trạng thái chờ gửi hàng');

    order.status = 'SHIPPING';
    order.shippingTrackingCode = trackingCode;
    order.deadlineAt = new Date(Date.now() + 7 * 86400 * 1000).toISOString(); // 7 days
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return { ...order };
  },

  async confirmDeliveredBySimulator(orderId: string): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');

    order.status = 'DELIVERED';
    order.deliveredAt = new Date().toISOString();
    order.deadlineAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48 hours
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return { ...order };
  },

  async completeOrder(orderId: string): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');
    if (order.status !== 'DELIVERED') throw new Error('Chỉ có thể hoàn tất khi đơn đã giao');

    const seller = store.users.find((u) => u.id === order.sellerId);
    const product = store.products.find((p) => p.id === order.productId);

    if (seller) {
      seller.balance += order.sellerNetAmount;
      seller.updatedAt = new Date().toISOString();

      const tx: WalletTransaction = {
        id: 'tx-release-' + Date.now(),
        userId: seller.id,
        orderId: order.id,
        type: 'ESCROW_RELEASE',
        amount: order.sellerNetAmount,
        lockedDelta: 0,
        balanceAfter: seller.balance,
        lockedBalanceAfter: seller.lockedBalance,
        description: `Nhận tiền bán hàng đơn #${order.orderCode} (đã trừ phí sàn 5%)`,
        createdAt: new Date().toISOString(),
      };
      store.transactions.unshift(tx);
    }

    if (product) {
      product.status = 'SOLD';
      product.updatedAt = new Date().toISOString();
    }

    order.status = 'COMPLETED';
    order.deadlineAt = null;
    order.completedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return { ...order };
  },

  async fileDispute(orderId: string, reason: string, evidenceUrls: string[]): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');
    if (order.status !== 'DELIVERED') throw new Error('Chỉ có thể khiếu nại trong 48h kiểm tra hàng');

    order.status = 'DISPUTED';
    order.deadlineAt = null; // stop the 48h clock
    order.disputeReason = reason;
    order.buyerEvidenceUrls = evidenceUrls;
    order.updatedAt = new Date().toISOString();

    saveStore(store);
    return { ...order };
  },

  async resolveDispute(
    orderId: string,
    decision: 'RELEASE_SELLER' | 'REFUND_BUYER' | 'REQUIRE_RETURN',
    adminNote: string
  ): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');

    const admin = await this.getCurrentUser();
    order.resolvedBy = admin.id;
    order.adminResolutionNote = adminNote;

    if (decision === 'RELEASE_SELLER') {
      return this.completeOrder(orderId);
    } else if (decision === 'REFUND_BUYER') {
      const buyer = store.users.find((u) => u.id === order.buyerId);
      const product = store.products.find((p) => p.id === order.productId);
      if (buyer) {
        buyer.balance += order.amount;
        store.transactions.unshift({
          id: 'tx-refund-' + Date.now(),
          userId: buyer.id,
          orderId: order.id,
          type: 'ESCROW_REFUND',
          amount: order.amount,
          lockedDelta: 0,
          balanceAfter: buyer.balance,
          lockedBalanceAfter: buyer.lockedBalance,
          description: `Hoàn tiền 100% đơn hàng #${order.orderCode}`,
          createdAt: new Date().toISOString(),
        });
      }
      if (product) product.status = 'HIDDEN';
      order.status = 'CLOSED_REFUNDED';
      order.deadlineAt = null;
    } else if (decision === 'REQUIRE_RETURN') {
      order.status = 'RETURN_PENDING';
      order.deadlineAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    }

    order.updatedAt = new Date().toISOString();
    saveStore(store);
    return { ...order };
  },

  // 4. Fast Forward Simulation (Demo Tool)
  async fastForwardDeadline(orderId: string, secondsRemaining: number = 3): Promise<Order> {
    const store = loadStore();
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn');

    order.deadlineAt = new Date(Date.now() + secondsRemaining * 1000).toISOString();
    order.updatedAt = new Date().toISOString();
    saveStore(store);
    return { ...order };
  },

  // 5. Wallet & Withdrawals
  async getWalletTransactions(): Promise<WalletTransaction[]> {
    const store = loadStore();
    const user = await this.getCurrentUser();
    return store.transactions.filter((t) => t.userId === user.id);
  },

  async createWithdrawal(amount: number, bankInfo: { bankName: string; accountNo: string; accountName: string }): Promise<WithdrawRequest> {
    const store = loadStore();
    const user = store.users.find((u) => u.id === store.currentUserId);
    if (!user) throw new Error('User not found');
    if (amount <= 0 || user.balance < amount) throw new Error('Số dư không đủ hoặc số tiền không hợp lệ');

    user.balance -= amount;
    user.lockedBalance += amount;

    const req: WithdrawRequest = {
      id: 'withdraw-' + Date.now(),
      userId: user.id,
      amount,
      bankName: bankInfo.bankName,
      accountNo: bankInfo.accountNo,
      accountName: bankInfo.accountName,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    store.withdrawRequests.unshift(req);
    store.transactions.unshift({
      id: 'tx-lock-' + Date.now(),
      userId: user.id,
      withdrawRequestId: req.id,
      type: 'WITHDRAW_LOCK',
      amount: -amount,
      lockedDelta: amount,
      balanceAfter: user.balance,
      lockedBalanceAfter: user.lockedBalance,
      description: `Khóa số dư yêu cầu rút về ${bankInfo.bankName} (${bankInfo.accountNo})`,
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return req;
  },

  async processWithdrawal(id: string, status: 'COMPLETED' | 'REJECTED', note?: string): Promise<WithdrawRequest> {
    const store = loadStore();
    const req = store.withdrawRequests.find((r) => r.id === id);
    if (!req) throw new Error('Không tìm thấy yêu cầu rút');
    if (req.status !== 'PENDING') throw new Error('Yêu cầu đã được xử lý');

    const user = store.users.find((u) => u.id === req.userId);
    const admin = await this.getCurrentUser();

    req.status = status;
    req.processedBy = admin.id;
    req.adminNote = note || null;
    req.processedAt = new Date().toISOString();

    if (user) {
      if (status === 'COMPLETED') {
        user.lockedBalance -= req.amount;
        store.transactions.unshift({
          id: 'tx-wd-comp-' + Date.now(),
          userId: user.id,
          withdrawRequestId: req.id,
          type: 'WITHDRAW_COMPLETE',
          amount: 0,
          lockedDelta: -req.amount,
          balanceAfter: user.balance,
          lockedBalanceAfter: user.lockedBalance,
          description: `Đã chuyển tiền về tài khoản ngân hàng ${req.bankName}`,
          createdAt: new Date().toISOString(),
        });
      } else {
        user.balance += req.amount;
        user.lockedBalance -= req.amount;
        store.transactions.unshift({
          id: 'tx-wd-rej-' + Date.now(),
          userId: user.id,
          withdrawRequestId: req.id,
          type: 'WITHDRAW_REJECT_UNLOCK',
          amount: req.amount,
          lockedDelta: -req.amount,
          balanceAfter: user.balance,
          lockedBalanceAfter: user.lockedBalance,
          description: `Hoàn lại số dư do từ chối yêu cầu rút: ${note || 'Không hợp lệ'}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    saveStore(store);
    return { ...req };
  },
};
