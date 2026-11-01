import React, { useRef, useEffect } from 'react';
import type { User } from '../api/types';
import { formatCurrency } from '../api/types';

interface UserMenuDropdownProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenAccount?: () => void;
  onOpenMyOrders?: () => void;
  onOpenFavorites?: () => void;
  onOpenReviews?: () => void;
  onOpenMyListings?: () => void;
  onOpenAdmin?: () => void;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onOpenAccount,
  onOpenMyOrders,
  onOpenFavorites,
  onOpenReviews,
  onOpenAdmin,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'GM';

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-2 z-50 text-zinc-900 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* 1. Header Profile */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 truncate">{user.fullName}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* 2. Wallet Balance Summary Card */}
      <div className="mx-3 my-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-zinc-500 font-medium">
          <span>Số dư ví hiện tại</span>
          <span className="font-bold text-zinc-900 tabular-nums text-sm">
            {formatCurrency(user.balance)}
          </span>
        </div>
        {user.lockedBalance > 0 && (
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Đang chờ chuyển:</span>
            <span className="tabular-nums font-semibold text-zinc-600">
              {formatCurrency(user.lockedBalance)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Five Primary Navigation Items */}
      <div className="py-1 text-sm font-medium text-zinc-700">
        {/* [Tài khoản của tôi] */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAccount) onOpenAccount();
            else alert('Thông tin cá nhân & Tài khoản ngân hàng nhận tiền');
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-3 cursor-pointer transition-colors"
        >
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span>Tài khoản của tôi</span>
        </button>

        {/* [Đơn hàng của tôi] */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMyOrders) onOpenMyOrders();
            else alert('Xem các đơn mua & đơn bán đang thực hiện');
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-3 cursor-pointer transition-colors"
        >
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span className="flex-1">Đơn hàng của tôi</span>
        </button>

        {/* [Danh sách yêu thích và gian hàng đã theo dõi] */}
        <button
          type="button"
          onClick={() => {
            if (onOpenFavorites) onOpenFavorites();
            else alert('Danh sách các sản phẩm và người bán bạn đang theo dõi');
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-3 cursor-pointer transition-colors"
        >
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="truncate">Danh sách yêu thích &amp; đã theo dõi</span>
        </button>

        {/* [Nhận xét của tôi] */}
        <button
          type="button"
          onClick={() => {
            if (onOpenReviews) onOpenReviews();
            else alert('Đánh giá và nhận xét uy tín của bạn');
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-3 cursor-pointer transition-colors"
        >
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>Nhận xét của tôi</span>
        </button>

        {/* [Quản trị sàn (Admin)] */}
        {user.role === 'ADMIN' && onOpenAdmin && (
          <button
            type="button"
            onClick={() => {
              onOpenAdmin();
              onClose();
            }}
            className="w-full px-4 py-2.5 text-left bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 flex items-center gap-3 cursor-pointer transition-colors font-semibold"
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-emerald-700 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
            <span className="flex-1">Quản trị viên sàn</span>
            <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>
          </button>
        )}
      </div>

      {/* 4. [Đăng xuất] */}
      <div className="pt-1.5 mt-1 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 cursor-pointer transition-colors"
        >
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
