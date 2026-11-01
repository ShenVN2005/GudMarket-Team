import React, { useRef, useEffect } from 'react';
import type { User } from '../api/types';
import { formatCurrency } from '../api/types';

interface UserMenuDropdownProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenMyListings: () => void;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onOpenMyListings,
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
      className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-2 z-50 text-zinc-900 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* User Header Profile */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 truncate">{user.fullName}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* Wallet Balance Summary Card */}
      <div className="mx-3 my-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-zinc-500 font-medium">
          <span>Số dư khả dụng</span>
          <span className="font-bold text-zinc-900 tabular-nums text-sm">
            {formatCurrency(user.balance)}
          </span>
        </div>
        {user.lockedBalance > 0 && (
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Đang chờ rút:</span>
            <span className="tabular-nums font-semibold text-zinc-600">
              {formatCurrency(user.lockedBalance)}
            </span>
          </div>
        )}
      </div>

      {/* Actions & Settings List */}
      <div className="py-1 text-sm font-medium text-zinc-700">
        <button
          type="button"
          onClick={() => {
            onOpenMyListings();
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2.5 cursor-pointer transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span>Quản lý tin đăng bán</span>
        </button>

        <button
          type="button"
          onClick={() => {
            alert('Thông tin tài khoản & Đổi mật khẩu sẽ có trong mục Cài đặt!');
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2.5 cursor-pointer transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span>Thông tin cá nhân & Tài khoản</span>
        </button>

        <button
          type="button"
          onClick={() => {
            alert('Trang quản lý liên kết tài khoản ngân hàng để rút tiền!');
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2.5 cursor-pointer transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <span>Tài khoản ngân hàng nhận tiền</span>
        </button>
      </div>

      {/* Logout Bottom Item */}
      <div className="pt-1.5 mt-1 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </div>
  );
};

