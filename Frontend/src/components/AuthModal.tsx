import React, { useState } from 'react';
import type { User } from '../api/types';
import { setAuthToken } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }
    if (mode === 'REGISTER' && !fullName) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự');
      return;
    }

    setLoading(true);

    // Frontend authentic user session handler
    setTimeout(() => {
      const dummyUser: User = {
        id: 'usr_' + Date.now(),
        email,
        fullName: mode === 'REGISTER' ? fullName : (email.split('@')[0] || 'Người dùng'),
        role: email.includes('admin') ? 'ADMIN' : 'USER',
        balance: 2500000,
        lockedBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAuthToken('token_' + Date.now());
      setLoading(false);
      onSuccess(dummyUser);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden text-zinc-900">
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-100">
          <h2 className="font-semibold text-sm text-zinc-900">
            {mode === 'LOGIN' ? 'Đăng nhập GudMarket' : 'Đăng ký tài khoản'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 -mr-1 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/60 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : mode === 'LOGIN' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              {mode === 'LOGIN' ? (
                <>Chưa có tài khoản? <span className="font-semibold text-zinc-900 underline">Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span className="font-semibold text-zinc-900 underline">Đăng nhập</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

