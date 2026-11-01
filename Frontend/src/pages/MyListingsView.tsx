import React, { useState } from 'react';
import type { Product, ProductStatus } from '../api/types';
import { formatCurrency, PRODUCT_STATUS_LABELS } from '../api/types';

interface MyListingsViewProps {
  listings: Product[];
  onOpenCreateModal: () => void;
  onToggleListingStatus: (productId: string, currentStatus: ProductStatus) => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  listings,
  onOpenCreateModal,
  onToggleListingStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SOLD' | 'HIDDEN'>('ALL');

  const filtered = listings.filter((item) => {
    if (filter === 'ACTIVE') return item.status === 'AVAILABLE' || item.status === 'RESERVED';
    if (filter === 'SOLD') return item.status === 'SOLD';
    if (filter === 'HIDDEN') return item.status === 'HIDDEN' || item.status === 'PENDING_APPROVAL';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Tin đăng của tôi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Quản lý các mặt hàng đồ cũ bạn đang đăng bán trên GudMarket
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <svg width="15" height="15" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Đăng món đồ mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs pb-2">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'ACTIVE', label: 'Đang hiển thị' },
          { key: 'SOLD', label: 'Đã bán' },
          { key: 'HIDDEN', label: 'Đang ẩn / Chờ duyệt' },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as 'ALL' | 'ACTIVE' | 'SOLD' | 'HIDDEN')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Listings Table / Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 space-y-3">
          <p className="text-sm font-medium text-zinc-600">Bạn chưa có tin đăng nào trong mục này</p>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            + Đăng bán một món đồ cũ ngay
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const statusMeta = PRODUCT_STATUS_LABELS[item.status] || {
              label: item.status,
              badgeClass: 'bg-zinc-100 text-zinc-700',
            };

            return (
              <div
                key={item.id}
                className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    className="w-20 h-16 rounded-lg object-cover bg-zinc-100 border border-zinc-200/80 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                      <span className="text-xs text-zinc-400">·</span>
                      <span className="text-xs text-zinc-500">{item.sellerLocation || 'Hà Nội'}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs font-bold text-zinc-900 tabular-nums">{formatCurrency(item.price)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-100">
                  {item.status === 'AVAILABLE' && (
                    <button
                      type="button"
                      onClick={() => onToggleListingStatus(item.id, 'HIDDEN')}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      Tạm ẩn tin
                    </button>
                  )}
                  {item.status === 'HIDDEN' && (
                    <button
                      type="button"
                      onClick={() => onToggleListingStatus(item.id, 'AVAILABLE')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Mở bán lại
                    </button>
                  )}
                  {item.status === 'SOLD' && (
                    <span className="text-xs font-medium text-zinc-400 px-2 py-1">Đã giao dịch thành công</span>
                  )}
                  {item.status === 'PENDING_APPROVAL' && (
                    <span className="text-xs font-medium text-amber-700 px-2 py-1">Đang chờ ban quản trị duyệt</span>
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
