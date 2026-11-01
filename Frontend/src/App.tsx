import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import type { User, Product, Order } from './api/types';
import { formatCurrency, ORDER_STATUS_LABELS } from './api/types';
import { AtmosphericBackground } from './components/AtmosphericBackground';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalView, setModalView] = useState<'NONE' | 'STATE_A' | 'STATE_B' | 'STATE_C'>('NONE');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [trackNode, setTrackNode] = useState<number>(1);

  // Load state
  const refreshData = async () => {
    const user = await apiClient.getCurrentUser();
    const users = await apiClient.getAllUsers();
    const prods = await apiClient.getProducts();
    const orders = await apiClient.getOrders();

    setCurrentUser(user);
    setAllUsers(users);
    setProducts(prods);
    setActiveOrders(orders);

    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      const user = await apiClient.getCurrentUser();
      const users = await apiClient.getAllUsers();
      const prods = await apiClient.getProducts();
      const orders = await apiClient.getOrders();
      if (!ignore) {
        setCurrentUser(user);
        setAllUsers(users);
        setProducts(prods);
        setActiveOrders(orders);
        if (orders.length > 0) {
          setSelectedOrder(orders[0]);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSwitchUser = async (userId: string) => {
    await apiClient.switchUser(userId);
    await refreshData();
  };

  const handleReset = async () => {
    await apiClient.resetData();
    await refreshData();
    setModalView('NONE');
  };

  const openOrderModal = (product: Product) => {
    setSelectedProduct(product);
    setModalView('STATE_A');
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct) return;
    try {
      const order = await apiClient.createOrder(selectedProduct.id);
      setSelectedOrder(order);
      setModalView('STATE_B');
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const handleSimulatePayment = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await apiClient.simulatePayOsWebhook(selectedOrder.orderCode);
      setSelectedOrder(updated);
      setTrackNode(1);
      setModalView('STATE_C');
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const handleFastForward = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await apiClient.fastForwardDeadline(selectedOrder.id, 5);
      setSelectedOrder(updated);
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const activeEscrowOrder = activeOrders.find((o) => o.status === 'ESCROW_HOLDING' || o.status === 'DELIVERED');

  return (
    <div className="min-h-screen flex flex-col font-sans pb-20 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <AtmosphericBackground />

      {/* 1. TOP BAR */}
      <div className="bg-zinc-100/70 border-b border-zinc-200/80 text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 font-medium truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              GudMarket giữ tiền hộ bạn: Sau khi nhận hàng, bạn có 48 giờ để kiểm tra trước khi tiền chuyển cho người bán
            </span>
          </p>
          <div className="flex items-center gap-3 text-zinc-500 font-medium flex-shrink-0">
            <button
              onClick={handleReset}
              className="hover:text-zinc-900 transition-colors underline cursor-pointer"
            >
              Khôi phục dữ liệu mẫu
            </button>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-6">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white text-xs font-bold inline-flex items-center justify-center tracking-tight">
              GM
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900">GudMarket</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600">
              Chợ đồ cũ an toàn
            </span>
          </div>

          {/* Quick Role Switcher for Demo */}
          <div className="flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 text-xs">
            <span className="text-zinc-400 font-medium px-2 hidden lg:inline">Vai trò:</span>
            {allUsers.map((u) => {
              const active = u.id === currentUser?.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    active ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {u.role === 'ADMIN' ? '🛡️ Admin' : u.fullName.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* User Balance */}
          <nav aria-label="Điều hướng người dùng" className="flex items-center gap-2 flex-shrink-0">
            <div className="inline-flex h-9 px-3 items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100/80 border border-zinc-200/60 rounded-lg">
              <span className="hidden md:inline">Số dư ví:</span>
              <span className="text-zinc-900 font-semibold tabular-nums">
                {currentUser ? formatCurrency(currentUser.balance) : '0 đ'}
              </span>
            </div>
            {activeOrders.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(activeOrders[0]);
                  setModalView('STATE_C');
                }}
                className="h-9 px-3 inline-flex items-center text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg transition-colors cursor-pointer"
              >
                Đơn mua ({activeOrders.length})
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* SIDEBAR FILTER */}
        <aside aria-label="Bộ lọc sản phẩm" className="order-2 lg:order-1 lg:col-span-3 space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">
              Danh mục
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-sm bg-zinc-900 text-white font-medium rounded-lg px-3 py-2 cursor-pointer transition-colors"
                >
                  <span>Tất cả mặt hàng</span>
                  <span className="text-xs tabular-nums text-zinc-400">{products.length}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  <span>Đồ điện tử & Công nghệ</span>
                  <span className="text-xs tabular-nums text-zinc-400">4</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  <span>Nội thất & Bàn ghế</span>
                  <span className="text-xs tabular-nums text-zinc-400">2</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* PRODUCT LISTING SECTION */}
        <section className="order-1 lg:order-2 lg:col-span-9 space-y-4">
          {/* ACTIVE ESCROW BANNER (STATE C WIDGET) */}
          {activeEscrowOrder && (
            <div className="bg-white border border-zinc-200/80 border-l-4 border-l-emerald-600 rounded-xl p-4 shadow-xs text-zinc-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                      <span>{ORDER_STATUS_LABELS[activeEscrowOrder.status].label}</span>
                    </span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-medium text-zinc-600">
                      Mã đơn <strong className="font-semibold text-zinc-900 tabular-nums">GM{activeEscrowOrder.orderCode}</strong>
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-zinc-900 text-balance">
                    GudMarket đang giữ hộ{' '}
                    <span className="text-emerald-700 font-bold tabular-nums">
                      {formatCurrency(activeEscrowOrder.amount)}
                    </span>{' '}
                    cho {activeEscrowOrder.productTitle}
                  </p>
                </div>

                <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100 flex-shrink-0">
                  <span className="text-[11px] font-medium text-zinc-500">Hạn tự động giải ngân</span>
                  <span className="text-base font-semibold text-zinc-900 tabular-nums">71:58:42</span>
                </div>
              </div>

              {/* 3-Node Money Holder Track */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="relative h-7 flex items-center">
                  <div className="w-full mx-[16.666%] h-1.5 bg-zinc-100 rounded-full overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: trackNode === 0 ? '0%' : trackNode === 1 ? '50%' : '100%' }}
                    />
                  </div>
                  <span
                    className="absolute top-1/2 -translate-y-1/2 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ring-4 ring-emerald-50 tabular-nums whitespace-nowrap transition-all duration-500"
                    style={{
                      left: trackNode === 0 ? '16.666%' : trackNode === 1 ? '50%' : '83.333%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {formatCurrency(activeEscrowOrder.amount)}
                  </span>
                </div>
                <div className="grid grid-cols-3 mt-1.5 text-center text-[11px]">
                  <span className={trackNode === 0 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                    1. Bạn thanh toán
                  </span>
                  <span className={trackNode === 1 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                    2. GudMarket giữ hộ
                  </span>
                  <span className={trackNode === 2 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                    3. Người bán nhận tiền
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Tin đăng mới nhất</h1>
            <span className="text-xs text-zinc-500 font-medium">Cam kết bảo vệ quyền lợi 100%</span>
          </div>

          {/* 3-STEP ESCROW HORIZONTAL INFO STRIP */}
          <div className="bg-white border border-zinc-200/80 rounded-lg px-4 py-2.5 text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
            <div className="flex items-center gap-2 font-medium text-zinc-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" aria-hidden="true" />
              <span>Mua sắm an toàn cùng GudMarket:</span>
            </div>
            <ol className="flex flex-wrap items-center gap-y-1 gap-x-4 flex-1 text-xs text-zinc-600">
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-700 tabular-nums">1.</span>
                <span>GudMarket giữ tiền hộ bạn</span>
              </li>
              <li className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</li>
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-700 tabular-nums">2.</span>
                <span>Nhận hàng và kiểm tra thoải mái trong 48 giờ</span>
              </li>
              <li className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</li>
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-700 tabular-nums">3.</span>
                <span>Đúng mô tả mới chuyển tiền; sai mô tả được hoàn tiền</span>
              </li>
            </ol>
          </div>

          {/* PRODUCT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pt-1">
            {products.map((p) => {
              const isAvailable = p.status === 'AVAILABLE';
              const isReserved = p.status === 'RESERVED';
              const isSold = p.status === 'SOLD';

              return (
                <article
                  key={p.id}
                  className={`group relative bg-white rounded-xl border overflow-hidden transition-all duration-200 flex flex-col ${
                    isReserved
                      ? 'border-emerald-500/70 shadow-xs'
                      : isSold
                      ? 'border-zinc-200/80 opacity-75'
                      : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-[4/3] bg-zinc-100 overflow-hidden relative">
                    <img
                      src={p.imageUrls[0]}
                      alt={p.title}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isSold ? 'grayscale' : 'group-hover:scale-[1.02]'
                      }`}
                    />
                    {!isAvailable && (
                      <span className="absolute top-2.5 right-2.5 backdrop-blur-md bg-white/90 text-zinc-900 border border-black/5 text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                        {isReserved ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Đang giao dịch
                          </span>
                        ) : (
                          'Đã bán'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-zinc-900 line-clamp-1">
                        <button
                          type="button"
                          onClick={() => isAvailable && openOrderModal(p)}
                          className={`text-left after:absolute after:inset-0 ${
                            isAvailable ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          {p.title}
                        </button>
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">{p.sellerLocation || 'Hà Nội'}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-base font-semibold tabular-nums ${isSold ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                        {formatCurrency(p.price)}
                      </span>
                      {isAvailable && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Giữ tiền hộ 48h</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* 4. MODALS (STATE A, STATE B, STATE C) */}
      {modalView !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden text-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-5 h-14 border-b border-zinc-200/80 flex-shrink-0">
              <h2 className="font-semibold text-sm text-zinc-900 truncate">
                {modalView === 'STATE_A' && 'Chi tiết & Xác nhận đơn hàng'}
                {modalView === 'STATE_B' && 'Thanh toán qua mã VietQR'}
                {modalView === 'STATE_C' && 'GudMarket giữ tiền hộ bạn'}
              </h2>
              <button
                type="button"
                onClick={() => setModalView('NONE')}
                className="h-8 w-8 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STATE A */}
            {modalView === 'STATE_A' && selectedProduct && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex gap-4 items-start">
                  <img
                    src={selectedProduct.imageUrls[0]}
                    alt={selectedProduct.title}
                    className="w-24 h-18 rounded-lg object-cover bg-zinc-100 border border-zinc-200/80 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500">Người bán: {selectedProduct.sellerName} · {selectedProduct.sellerLocation}</p>
                    <h3 className="text-base font-semibold text-zinc-900 leading-snug mt-0.5">
                      {selectedProduct.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-zinc-900 tabular-nums">
                        {formatCurrency(selectedProduct.price)}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium px-2 py-0.5 rounded-full">
                        Giữ tiền hộ 48h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipient placeholder */}
                <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">Thông tin nhận hàng</span>
                    <span className="font-medium text-emerald-700">Miễn phí vận chuyển</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900">Nguyễn Văn An · 0901 234 567</p>
                  <p className="text-zinc-500">Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội</p>
                </div>

                {/* Payment Option */}
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50/60 cursor-pointer">
                    <input type="radio" checked readOnly className="mt-0.5 w-4 h-4" />
                    <span className="text-sm flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="font-medium text-zinc-900 text-xs sm:text-sm">Chuyển khoản nhanh qua mã VietQR</strong>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-white">Khuyên dùng</span>
                      </span>
                      <span className="block text-xs text-zinc-500 mt-0.5">Quét mã bằng ứng dụng ngân hàng bất kỳ, tự động xác nhận tức thì</span>
                    </span>
                  </label>
                </div>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-zinc-600">Tổng thanh toán (GudMarket giữ tiền hộ bạn)</span>
                    <span className="text-lg font-bold text-zinc-900 tabular-nums">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    className="w-full h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Tạo mã VietQR thanh toán
                  </button>
                </div>
              </div>
            )}

            {/* STATE B (VietQR) */}
            {modalView === 'STATE_B' && selectedOrder && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Đang giữ sản phẩm cho bạn</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Mã thanh toán tự động hết hạn sau</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 text-base font-bold text-zinc-900 tabular-nums">
                    14:52
                  </span>
                </div>

                {/* Simulated QR Code SVG */}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
                    <svg width="140" height="140" viewBox="0 0 120 120" fill="#18181B">
                      <rect x="0" y="0" width="36" height="36" rx="4"/>
                      <rect x="6" y="6" width="24" height="24" fill="#fff" rx="2"/>
                      <rect x="12" y="12" width="12" height="12"/>
                      <rect x="84" y="0" width="36" height="36" rx="4"/>
                      <rect x="90" y="6" width="24" height="24" fill="#fff" rx="2"/>
                      <rect x="96" y="12" width="12" height="12"/>
                      <rect x="0" y="84" width="36" height="36" rx="4"/>
                      <rect x="6" y="90" width="24" height="24" fill="#fff" rx="2"/>
                      <rect x="12" y="96" width="12" height="12"/>
                      <rect x="44" y="8" width="8" height="8"/><rect x="60" y="8" width="12" height="8"/>
                      <rect x="44" y="24" width="16" height="8"/><rect x="68" y="24" width="8" height="16"/>
                      <rect x="8" y="44" width="16" height="8"/><rect x="32" y="44" width="24" height="8"/>
                      <rect x="64" y="44" width="16" height="16"/><rect x="88" y="44" width="24" height="8"/>
                      <rect x="16" y="60" width="8" height="16"/><rect x="44" y="60" width="12" height="12"/>
                      <rect x="84" y="60" width="16" height="12"/><rect x="108" y="60" width="12" height="20"/>
                      <rect x="44" y="84" width="20" height="8"/><rect x="72" y="84" width="16" height="16"/>
                      <rect x="96" y="88" width="24" height="8"/><rect x="44" y="100" width="16" height="12"/>
                      <rect x="68" y="108" width="24" height="12"/><rect x="104" y="104" width="16" height="16"/>
                    </svg>
                  </div>
                  <p className="text-xs text-zinc-500">Quét bằng ứng dụng ngân hàng hoặc chuyển khoản theo thông tin:</p>
                </div>

                <dl className="rounded-xl border border-zinc-200/80 divide-y divide-zinc-200/80 text-xs sm:text-sm bg-white">
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-zinc-500">Ngân hàng</dt>
                    <dd className="font-medium text-zinc-900">Vietcombank (VCB)</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-zinc-500">Số tài khoản</dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 tabular-nums">9988 7766 55</span>
                      <button
                        onClick={() => copyToClipboard('9988776655', 'accountNo')}
                        className="px-2 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded cursor-pointer"
                      >
                        {copyFeedback === 'accountNo' ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-emerald-50/40">
                    <dt className="text-zinc-700 font-medium">Nội dung</dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700 tabular-nums">GM{selectedOrder.orderCode}</span>
                      <button
                        onClick={() => copyToClipboard(`GM${selectedOrder.orderCode}`, 'memo')}
                        className="px-2 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded cursor-pointer"
                      >
                        {copyFeedback === 'memo' ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </dd>
                  </div>
                </dl>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalView('STATE_A')}
                    className="h-11 px-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs cursor-pointer"
                  >
                    Tôi đã chuyển khoản
                  </button>
                </div>
              </div>
            )}

            {/* STATE C (Escrow Holding Details) */}
            {modalView === 'STATE_C' && selectedOrder && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{ORDER_STATUS_LABELS[selectedOrder.status].label}</span>
                    </span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-500 font-medium">
                      Mã đơn <strong className="text-zinc-900 tabular-nums">GM{selectedOrder.orderCode}</strong>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 text-balance">
                    GudMarket đang giữ hộ <span className="text-emerald-700 tabular-nums">{formatCurrency(selectedOrder.amount)}</span>
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Kiểm tra hàng thoải mái trong 48 giờ sau khi nhận. Nếu hàng đúng mô tả, GudMarket mới chuyển tiền cho người bán.
                  </p>
                </div>

                {/* Fast-forward simulator tool */}
                <div className="rounded-xl border border-zinc-200/80 p-4 flex items-center justify-between gap-4 bg-zinc-50">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Công cụ chạy thử (Demo)</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Tua thời gian để kiểm tra tự động giải ngân sau 48h</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFastForward}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Tua còn 5 giây
                  </button>
                </div>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalView('NONE')}
                    className="h-11 px-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackNode(2)}
                    className="h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl cursor-pointer"
                  >
                    Xem: Chuyển tiền người bán
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DEVELOPER DEMO TOOLBAR */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-md text-zinc-100 border-t border-zinc-800 px-3 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold uppercase tracking-wider text-[10px]">
              Demo Tool
            </span>
            <span className="hidden md:inline text-zinc-400 font-medium">Mở trạng thái mẫu:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setModalView('NONE')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  modalView === 'NONE' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Trang danh mục
              </button>
              <button
                type="button"
                onClick={() => {
                  if (products[0]) setSelectedProduct(products[0]);
                  setModalView('STATE_A');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  modalView === 'STATE_A' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                State A: Chi tiết
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeOrders[0]) setSelectedOrder(activeOrders[0]);
                  setModalView('STATE_B');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  modalView === 'STATE_B' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                State B: VietQR
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeOrders[0]) setSelectedOrder(activeOrders[0]);
                  setModalView('STATE_C');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  modalView === 'STATE_C' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                State C: Đang giữ tiền hộ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="trackSelect" className="text-zinc-400 hidden sm:inline">Trạng thái giữ tiền:</label>
            <select
              id="trackSelect"
              value={trackNode}
              onChange={(e) => setTrackNode(Number(e.target.value))}
              className="h-7 rounded-md bg-zinc-900 border border-zinc-700 px-2 text-xs font-medium text-white cursor-pointer"
            >
              <option value="0">1. Bạn thanh toán</option>
              <option value="1">2. GudMarket giữ hộ</option>
              <option value="2">3. Người bán nhận tiền</option>
            </select>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
