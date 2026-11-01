import React, { useState } from 'react';
import type { Order, OrderStatus } from '../api/types';
import { formatCurrency, ORDER_STATUS_LABELS } from '../api/types';
import { CountdownTimer } from '../components/CountdownTimer';

interface OrdersViewProps {
  orders: Order[];
  currentUserId: string;
  onBackToMarketplace: () => void;
  onUpdateTrackingCode?: (orderId: string, trackingCode: string) => void;
  onConfirmReceived?: (orderId: string) => void;
  onRequestDispute?: (order: Order) => void;
  onPayOrder?: (order: Order) => void;
}

type TabType = 'BUY' | 'SELL';
type FilterStatus = 'ALL' | 'WAITING' | 'SHIPPING' | 'INSPECTING' | 'DISPUTED' | 'COMPLETED';

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUserId,
  onBackToMarketplace,
  onUpdateTrackingCode,
  onConfirmReceived,
  onRequestDispute,
  onPayOrder,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('BUY');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter orders by Buy vs Sell
  const tabOrders = orders.filter((o) => {
    if (activeTab === 'BUY') {
      return o.buyerId === currentUserId;
    }
    return o.sellerId === currentUserId;
  });

  // Filter by status group
  const filteredOrders = tabOrders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'WAITING') {
      return o.status === 'PENDING_PAYMENT' || o.status === 'ESCROW_HOLDING';
    }
    if (filterStatus === 'SHIPPING') {
      return o.status === 'SHIPPING';
    }
    if (filterStatus === 'INSPECTING') {
      return o.status === 'DELIVERED';
    }
    if (filterStatus === 'DISPUTED') {
      return (
        o.status === 'DISPUTED' ||
        o.status === 'RETURN_PENDING' ||
        o.status === 'RETURNING' ||
        o.status === 'RETURN_DELIVERED' ||
        o.status === 'RETURN_DISPUTED'
      );
    }
    if (filterStatus === 'COMPLETED') {
      return o.status === 'COMPLETED' || o.status === 'CLOSED_REFUNDED';
    }
    return true;
  });

  const handleTrackingSubmit = (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) {
      alert('Vui lòng nhập mã vận đơn để xác nhận gửi hàng!');
      return;
    }
    if (onUpdateTrackingCode) {
      onUpdateTrackingCode(orderId, code);
      setSuccessNotice(`Đã cập nhật mã vận đơn "${code}". Trạng thái chuyển sang Đang giao hàng.`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const getStepperNode = (status: OrderStatus): number => {
    if (status === 'PENDING_PAYMENT') return 0;
    if (
      status === 'ESCROW_HOLDING' ||
      status === 'SHIPPING' ||
      status === 'DELIVERED' ||
      status === 'DISPUTED' ||
      status === 'RETURN_PENDING' ||
      status === 'RETURNING' ||
      status === 'RETURN_DELIVERED' ||
      status === 'RETURN_DISPUTED'
    ) {
      return 1;
    }
    return 2; // COMPLETED or CLOSED_REFUNDED
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
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Đơn hàng của tôi
          </h1>
        </div>

        {/* 2-Way Tab Switcher: Đơn tôi mua / Đơn tôi bán */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('BUY');
              setFilterStatus('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'BUY'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Đơn tôi mua ({orders.filter((o) => o.buyerId === currentUserId).length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('SELL');
              setFilterStatus('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'SELL'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Đơn tôi bán ({orders.filter((o) => o.sellerId === currentUserId).length})
          </button>
        </div>
      </div>

      {/* 2. Success Alert */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" className="text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. Status Filter Badges Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'WAITING', label: 'Chờ gửi hàng' },
          { id: 'SHIPPING', label: 'Đang giao' },
          { id: 'INSPECTING', label: 'Đang kiểm hàng 48h' },
          { id: 'DISPUTED', label: 'Khiếu nại / Trả hàng' },
          { id: 'COMPLETED', label: 'Hoàn tất' },
        ].map((f) => {
          const isActive = filterStatus === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id as FilterStatus)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200/80 hover:border-zinc-300 hover:text-zinc-900'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 4. Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-900">Không tìm thấy đơn hàng nào</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {activeTab === 'BUY'
              ? 'Bạn chưa có đơn mua nào trong mục này. Hãy khám phá các món đồ cũ chất lượng tại trang chủ!'
              : 'Bạn chưa có đơn bán nào trong mục này. Khi có người mua sản phẩm của bạn, đơn hàng sẽ hiển thị tại đây.'}
          </p>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Khám phá chợ đồ cũ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
              stepIndex: 1,
            };
            const trackNode = getStepperNode(order.status);

            return (
              <div
                key={order.id}
                className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs text-zinc-900 space-y-4 transition-shadow hover:shadow-sm"
              >
                {/* Top Row: Status badge + Order Code */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border ${statusConfig.badgeClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                      <span>{statusConfig.label}</span>
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500 font-medium">
                      Mã đơn: <strong className="text-zinc-900 tabular-nums">GM{order.orderCode}</strong>
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Main Product Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200/80 overflow-hidden flex-shrink-0">
                      {order.productImageUrl ? (
                        <img
                          src={order.productImageUrl}
                          alt={order.productTitle || 'Sản phẩm'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 line-clamp-1">
                        {order.productTitle || 'Sản phẩm đồ cũ'}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {activeTab === 'BUY' ? (
                          <>Người bán: <span className="font-medium text-zinc-800">{order.sellerName || 'Người bán'}</span></>
                        ) : (
                          <>Người mua: <span className="font-medium text-zinc-800">Khách hàng</span></>
                        )}
                        {order.shippingTrackingCode && (
                          <span className="ml-2 inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                            Mã vận đơn: <strong className="tabular-nums font-mono text-zinc-900">{order.shippingTrackingCode}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-xs text-zinc-500">Số tiền thanh toán</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(order.amount)}
                    </p>
                  </div>
                </div>

                {/* Fintech Stepper: 3-Node Money Holder Track */}
                <div className="pt-2">
                  <div className="relative h-9 flex items-center">
                    <div className="w-full mx-[16.666%] h-2 bg-zinc-100 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: trackNode === 0 ? '0%' : trackNode === 1 ? '50%' : '100%',
                        }}
                      />
                    </div>
                    <span
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-sm ring-4 ring-emerald-50 tabular-nums whitespace-nowrap transition-all duration-500 leading-none"
                      style={{
                        left: trackNode === 0 ? '16.666%' : trackNode === 1 ? '50%' : '83.333%',
                      }}
                    >
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 mt-1.5 text-center text-xs">
                    <span className={trackNode === 0 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                      Bạn thanh toán
                    </span>
                    <span className={trackNode === 1 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                      GudMarket giữ hộ
                    </span>
                    <span className={trackNode === 2 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                      Người bán nhận tiền
                    </span>
                  </div>
                </div>

                {/* Countdown & Context Banner */}
                {order.status === 'ESCROW_HOLDING' && (
                  <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">
                        {activeTab === 'BUY'
                          ? 'GudMarket đang giữ tiền an toàn • Chờ người bán gửi hàng'
                          : 'Bạn hãy đóng gói và gửi hàng cho người mua'}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {activeTab === 'BUY'
                          ? 'Nếu sau 72 giờ người bán chưa gửi mã vận đơn, GudMarket sẽ hoàn 100% tiền lại cho bạn.'
                          : 'Vui lòng gửi hàng và cập nhật mã vận đơn trong thời gian quy định.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <span className="text-[11px] font-medium text-emerald-700">Hạn chót:</span>
                      <CountdownTimer
                        deadlineAt={order.deadlineAt}
                        className="text-sm sm:text-base font-bold text-emerald-800"
                      />
                    </div>
                  </div>
                )}

                {order.status === 'DELIVERED' && (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">
                        {activeTab === 'BUY'
                          ? 'Hàng đã giao • Bạn có 48 giờ để kiểm tra sản phẩm'
                          : 'Người mua đã nhận hàng • Đang kiểm tra trong 48 giờ'}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {activeTab === 'BUY'
                          ? 'Kiểm tra kỹ tình trạng hàng. Nếu đúng mô tả, hãy bấm xác nhận. Nếu sai, hãy bấm Khiếu nại trước khi hết giờ.'
                          : 'Nếu sau 48 giờ người mua không khiếu nại, tiền bán hàng sẽ tự động chuyển vào số dư ví của bạn.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <span className="text-[11px] font-medium text-emerald-700">Thời gian còn lại:</span>
                      <CountdownTimer
                        deadlineAt={order.deadlineAt}
                        className="text-sm sm:text-base font-bold text-emerald-800"
                      />
                    </div>
                  </div>
                )}

                {/* Action Area by Role & Status */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-zinc-100">
                  {/* BUYER ACTIONS */}
                  {activeTab === 'BUY' && (
                    <>
                      {order.status === 'PENDING_PAYMENT' && onPayOrder && (
                        <button
                          type="button"
                          onClick={() => onPayOrder(order)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Thanh toán ngay bằng VietQR
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <>
                          {onRequestDispute && (
                            <button
                              type="button"
                              onClick={() => onRequestDispute(order)}
                              className="px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Hàng không đúng mô tả (Khiếu nại)
                            </button>
                          )}
                          {onConfirmReceived && (
                            <button
                              type="button"
                              onClick={() => onConfirmReceived(order.id)}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Đã nhận hàng &amp; Đồng ý chuyển tiền
                            </button>
                          )}
                        </>
                      )}

                      {order.status === 'COMPLETED' && (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>Giao dịch đã hoàn tất thành công</span>
                        </span>
                      )}
                    </>
                  )}

                  {/* SELLER ACTIONS */}
                  {activeTab === 'SELL' && (
                    <>
                      {order.status === 'ESCROW_HOLDING' && (
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nhập mã vận đơn (VD: VN849201)"
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) =>
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="h-9 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-lg focus:outline-none focus:border-zinc-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleTrackingSubmit(order.id)}
                            className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Xác nhận đã gửi hàng
                          </button>
                        </div>
                      )}

                      {order.status === 'SHIPPING' && (
                        <span className="text-xs text-blue-700 font-medium">
                          Đang giao hàng • Chờ đơn vị vận chuyển cập nhật đã giao
                        </span>
                      )}

                      {order.status === 'COMPLETED' && (
                        <span className="text-xs font-semibold text-emerald-700">
                          Đã nhận tiền bán hàng vào ví (+{formatCurrency(order.sellerNetAmount)})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

