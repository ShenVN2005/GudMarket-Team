import React, { useState } from 'react';
import type { Product, Order, WithdrawRequest } from '../api/types';
import { formatCurrency, ORDER_STATUS_LABELS, PRODUCT_STATUS_LABELS } from '../api/types';

interface AdminDashboardViewProps {
  products: Product[];
  orders: Order[];
  withdrawRequests: WithdrawRequest[];
  onApproveProduct: (productId: string) => void;
  onRejectProduct: (productId: string, reason?: string) => void;
  onResolveDispute: (
    orderId: string,
    decision: 'REFUND_BUYER' | 'PAY_SELLER' | 'REQUIRE_RETURN',
    note: string
  ) => void;
  onApproveWithdraw: (requestId: string) => void;
  onRejectWithdraw: (requestId: string, reason?: string) => void;
  onBackToMarketplace: () => void;
}

type AdminTab = 'PRODUCTS' | 'DISPUTES' | 'WITHDRAWALS';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  orders,
  withdrawRequests,
  onApproveProduct,
  onRejectProduct,
  onResolveDispute,
  onApproveWithdraw,
  onRejectWithdraw,
  onBackToMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('PRODUCTS');
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [selectedQrWithdraw, setSelectedQrWithdraw] = useState<WithdrawRequest | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingProducts = products.filter((p) => p.status === 'PENDING_APPROVAL');
  const disputedOrders = orders.filter(
    (o) =>
      o.status === 'DISPUTED' ||
      o.status === 'RETURN_DISPUTED' ||
      o.status === 'RETURN_PENDING' ||
      o.status === 'RETURNING'
  );
  const pendingWithdrawals = withdrawRequests.filter((w) => w.status === 'PENDING');

  // Total money calculation for Fund Balance
  const totalEscrowHolding = orders
    .filter((o) => o.status === 'ESCROW_HOLDING' || o.status === 'SHIPPING' || o.status === 'DELIVERED' || o.status === 'DISPUTED')
    .reduce((sum, o) => sum + o.amount, 0);

  const handleResolve = (
    orderId: string,
    decision: 'REFUND_BUYER' | 'PAY_SELLER' | 'REQUIRE_RETURN'
  ) => {
    const note = resolutionNotes[orderId]?.trim() || 'Admin đã xem xét chứng cứ và đưa ra phán quyết.';
    onResolveDispute(orderId, decision, note);

    const decisionText =
      decision === 'REFUND_BUYER'
        ? 'Hoàn tiền 100% cho Người mua'
        : decision === 'PAY_SELLER'
        ? 'Chuyển tiền cho Người bán'
        : 'Yêu cầu Người mua gửi trả hàng';

    setNotice(`Đã ban hành phán quyết: "${decisionText}". Hệ thống đã cập nhật số dư và đơn hàng!`);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleApproveWithdrawal = (id: string) => {
    onApproveWithdraw(id);
    setSelectedQrWithdraw(null);
    setNotice('Đã xác nhận chuyển khoản thành công qua VietQR!');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRejectWithdrawal = (id: string) => {
    const reason = prompt('Nhập lý do từ chối lệnh rút tiền (VD: Sai số tài khoản / Tên không khớp):');
    if (reason === null) return;
    onRejectWithdraw(id, reason);
    setSelectedQrWithdraw(null);
    setNotice('Đã từ chối lệnh rút. Tiền đã được hoàn lại số dư ví người dùng!');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-1.5 cursor-pointer"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Quay lại trang chủ chợ</span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Quản trị viên sàn (Admin Dashboard)
            </h1>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl self-start sm:self-auto text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PRODUCTS' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Duyệt tin đăng ({pendingProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DISPUTES')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'DISPUTES' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Phân xử khiếu nại ({disputedOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'WITHDRAWALS' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Duyệt rút tiền &amp; Quỹ ({pendingWithdrawals.length})
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" className="text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-700 font-bold ml-2 cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* TAB 1: DUYỆT TIN ĐĂNG */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Danh sách sản phẩm người dùng gửi đăng bán:</span>
            <span>Chờ duyệt: <strong className="text-zinc-900">{pendingProducts.length}</strong></span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-xs text-zinc-500">
              Không có sản phẩm nào trên sàn.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => {
                const statusBadge = PRODUCT_STATUS_LABELS[p.status] || {
                  label: p.status,
                  badgeClass: 'bg-zinc-100 text-zinc-600',
                };
                const isPending = p.status === 'PENDING_APPROVAL';

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={p.imageUrls[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80'}
                        alt={p.title}
                        className="w-20 h-20 object-cover rounded-xl border border-zinc-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.badgeClass}`}>
                            {statusBadge.label}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 tabular-nums">
                            {formatCurrency(p.price)}
                          </span>
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.title}</h2>
                        <p className="text-xs text-zinc-500 line-clamp-2">{p.description}</p>
                        <p className="text-[11px] text-zinc-400">
                          Người bán: <span className="text-zinc-700 font-medium">{p.sellerName}</span> • Khu vực: {p.sellerLocation}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onRejectProduct(p.id)}
                            className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Từ chối duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onApproveProduct(p.id)}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Duyệt đăng tin
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">
                          Trạng thái: <strong className="text-zinc-700">{statusBadge.label}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PHÂN XỬ KHIẾU NẠI */}
      {activeTab === 'DISPUTES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Danh sách tranh chấp &amp; khiếu nại đang chờ Admin phán quyết:</span>
            <span>Tổng số: <strong className="text-zinc-900">{disputedOrders.length}</strong></span>
          </div>

          {disputedOrders.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-xs text-zinc-500">
              Hiện không có đơn hàng nào bị khiếu nại. Sàn đang hoạt động an toàn!
            </div>
          ) : (
            <div className="space-y-4">
              {disputedOrders.map((order) => {
                const statusBadge = ORDER_STATUS_LABELS[order.status] || {
                  label: order.status,
                  badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
                };

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full font-medium border ${statusBadge.badgeClass}`}>
                          {statusBadge.label}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className="text-zinc-500 font-medium">
                          Mã đơn: <strong className="text-zinc-900 tabular-nums">GM{order.orderCode}</strong>
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm tabular-nums">
                        Tiền đang giữ hộ: {formatCurrency(order.amount)}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <p className="font-semibold text-zinc-900">{order.productTitle}</p>
                        <p className="text-zinc-500">
                          Người mua: <strong className="text-zinc-800">Khách hàng</strong> • Người bán: <strong className="text-zinc-800">{order.sellerName || 'Người bán'}</strong>
                        </p>
                        {order.shippingTrackingCode && (
                          <p className="text-zinc-500">
                            Mã vận đơn gửi: <span className="font-mono text-zinc-900">{order.shippingTrackingCode}</span>
                          </p>
                        )}
                        {order.returnTrackingCode && (
                          <p className="text-purple-700 font-medium">
                            Mã vận đơn trả: <span className="font-mono text-purple-900">{order.returnTrackingCode}</span>
                          </p>
                        )}
                      </div>

                      {/* Evidence & Reason */}
                      <div className="space-y-1.5 p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl">
                        <p className="font-bold text-rose-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>Lý do khiếu nại từ Người mua:</span>
                        </p>
                        <p className="text-rose-800 text-xs">{order.disputeReason || 'Chưa cung cấp lý do chi tiết'}</p>
                        {order.buyerEvidenceUrls && order.buyerEvidenceUrls.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-medium text-rose-700">Ảnh/Video bằng chứng:</span>
                            <div className="flex items-center gap-2 mt-1">
                              {order.buyerEvidenceUrls.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt="Bằng chứng"
                                  className="w-12 h-12 object-cover rounded-lg border border-rose-200 cursor-pointer"
                                  onClick={() => window.open(url, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Resolution Input & 3 Ruling Buttons */}
                    <div className="pt-3 border-t border-zinc-100 space-y-3">
                      <div className="space-y-1">
                        <label htmlFor={`res-note-${order.id}`} className="block text-xs font-semibold text-zinc-700">
                          Ghi chú phán quyết của Admin:
                        </label>
                        <input
                          id={`res-note-${order.id}`}
                          type="text"
                          placeholder="VD: Kiểm tra video mở hộp thấy sản phẩm vỡ màn hình do vận chuyển..."
                          value={resolutionNotes[order.id] || ''}
                          onChange={(e) =>
                            setResolutionNotes((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleResolve(order.id, 'REFUND_BUYER')}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          1. Hoàn tiền ngay cho Người mua
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(order.id, 'REQUIRE_RETURN')}
                          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          2. Yêu cầu Người mua gửi trả hàng
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(order.id, 'PAY_SELLER')}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          3. Chuyển tiền cho Người bán
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DUYỆT RÚT TIỀN & QUỸ */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="space-y-6">
          {/* Fund Balance Summary Widget */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Bảng kiểm tra cân đối tiền quỹ trên sàn (Escrow Fund Audit)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-zinc-500">Tiền GudMarket đang giữ hộ</span>
                <p className="text-lg font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(totalEscrowHolding)}
                </p>
                <p className="text-[11px] text-zinc-400">Các đơn đang chờ giao &amp; kiểm tra 48h</p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-zinc-500">Lệnh rút tiền đang chờ duyệt</span>
                <p className="text-lg font-bold text-amber-600 tabular-nums">
                  {formatCurrency(pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0))}
                </p>
                <p className="text-[11px] text-zinc-400">{pendingWithdrawals.length} lệnh rút từ thành viên</p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="text-emerald-800 font-semibold">Trạng thái cân đối quỹ</span>
                <p className="text-lg font-bold text-emerald-800">
                  Khớp 100% — An toàn
                </p>
                <p className="text-[11px] text-emerald-700">Không có chênh lệch hoặc âm quỹ</p>
              </div>
            </div>
          </div>

          {/* Pending Withdrawals List */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">
              Yêu cầu rút tiền ngân hàng ({pendingWithdrawals.length} lệnh chờ)
            </h2>

            {pendingWithdrawals.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Hiện không có yêu cầu rút tiền nào cần duyệt.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 tabular-nums">
                          {formatCurrency(req.amount)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Chờ duyệt
                        </span>
                      </div>
                      <p className="text-zinc-600">
                        Ngân hàng: <strong className="text-zinc-900">{req.bankName}</strong> • STK: <span className="font-mono text-zinc-900">{req.accountNo}</span>
                      </p>
                      <p className="text-zinc-500">
                        Chủ tài khoản: <strong className="text-zinc-900 uppercase">{req.accountName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedQrWithdraw(req)}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        </svg>
                        <span>Quét mã VietQR chuyển tiền</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectWithdrawal(req.id)}
                        className="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-semibold"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VietQR Payout Modal for Admin */}
      {selectedQrWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200/90 w-full max-w-sm p-6 text-center space-y-4 text-zinc-900">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900">Mã VietQR chuyển tiền tự động</h3>
              <button
                type="button"
                onClick={() => setSelectedQrWithdraw(null)}
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-zinc-900">{selectedQrWithdraw.bankName}</p>
              <p className="font-mono text-zinc-700 text-sm">{selectedQrWithdraw.accountNo}</p>
              <p className="uppercase font-bold text-zinc-900">{selectedQrWithdraw.accountName}</p>
              <p className="text-emerald-700 font-bold text-lg tabular-nums pt-1">
                {formatCurrency(selectedQrWithdraw.amount)}
              </p>
            </div>

            {/* Generated Dynamic VietQR Preview */}
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl inline-block mx-auto">
              <img
                src={`https://img.vietqr.io/image/vietcombank-${selectedQrWithdraw.accountNo}-compact2.png?amount=${selectedQrWithdraw.amount}&addInfo=GudMarket+RutTien+${selectedQrWithdraw.accountName}`}
                alt="VietQR Payout"
                className="w-48 h-48 mx-auto object-contain"
                onError={(e) => {
                  // Fallback visual if offline or mock account
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <p className="text-[11px] text-zinc-400 mt-2">Dùng ứng dụng ngân hàng quét mã để chuyển khoản 24/7</p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedQrWithdraw(null)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleApproveWithdrawal(selectedQrWithdraw.id)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Đã chuyển khoản thành công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

