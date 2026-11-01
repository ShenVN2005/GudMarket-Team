import React, { useState } from 'react';
import type { User, WalletTransaction, WithdrawRequest } from '../api/types';
import { formatCurrency, WALLET_TX_LABELS } from '../api/types';

interface WalletViewProps {
  user: User;
  transactions: WalletTransaction[];
  withdrawRequests: WithdrawRequest[];
  onBackToMarketplace: () => void;
  onRequestWithdraw: (
    amount: number,
    bankName: string,
    accountNo: string,
    accountName: string
  ) => void;
}

const POPULAR_BANKS = [
  'Vietcombank (VCB)',
  'MB Bank (Quân Đội)',
  'Techcombank (TCB)',
  'BIDV (Đầu tư & Phát triển)',
  'VietinBank (Công Thương)',
  'ACB (Á Châu)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'TPBank (Tiên Phong)',
  'Agribank (Nông Nghiệp)',
  'Sacombank (Sài Gòn Thương Tín)',
  'HDBank (Phát triển TP.HCM)',
  'VIB (Quốc Tế)',
];

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  transactions,
  withdrawRequests,
  onBackToMarketplace,
  onRequestWithdraw,
}) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankName, setBankName] = useState(POPULAR_BANKS[0]);
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [amountInputStr, setAmountInputStr] = useState('');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleQuickAmount = (amount: number) => {
    const validAmount = Math.min(amount, user.balance);
    setWithdrawAmount(validAmount);
    setAmountInputStr(String(validAmount));
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNo.trim()) {
      alert('Vui lòng nhập số tài khoản ngân hàng!');
      return;
    }
    if (!accountName.trim()) {
      alert('Vui lòng nhập tên chủ tài khoản!');
      return;
    }
    if (withdrawAmount < 10000) {
      alert('Số tiền rút tối thiểu là 10.000 đ!');
      return;
    }
    if (withdrawAmount > user.balance) {
      alert('Số tiền rút vượt quá số dư khả dụng hiện có!');
      return;
    }

    onRequestWithdraw(
      withdrawAmount,
      bankName,
      accountNo.trim(),
      accountName.trim().toUpperCase()
    );

    setNoticeMessage(
      `Đã tạo yêu cầu rút ${formatCurrency(withdrawAmount)} về ngân hàng ${bankName}. Số dư đang được tạm giữ để xử lý!`
    );
    setIsWithdrawOpen(false);
    setWithdrawAmount(0);
    setAmountInputStr('');
    setAccountNo('');
    setAccountName('');
    setTimeout(() => setNoticeMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header */}
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
            Ví GudMarket
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0H3m-1.5 0h1.5m0 0h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 21H3a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5z" />
          </svg>
          <span>Rút tiền về tài khoản ngân hàng</span>
        </button>
      </div>

      {/* Success Notification */}
      {noticeMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" className="text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Wallet Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Available Balance Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Số dư khả dụng</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">
              {formatCurrency(user.balance)}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Dùng để mua sắm hoặc rút về ATM</span>
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Rút tiền ngay →
            </button>
          </div>
        </div>

        {/* Locked / Pending Balance Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Đang chờ chuyển / Đang chờ rút</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-700 tabular-nums">
              {formatCurrency(user.lockedBalance)}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-zinc-100 text-xs text-zinc-500">
            Số tiền đang trong lệnh rút ngân hàng hoặc bảo đảm giao dịch
          </div>
        </div>
      </div>

      {/* 3. Withdrawal Modal / Slide Form */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200/90 w-full max-w-lg p-5 sm:p-6 text-zinc-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  Rút tiền về tài khoản ngân hàng
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Số dư khả dụng: <strong className="text-zinc-900 tabular-nums">{formatCurrency(user.balance)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Bank Name */}
              <div className="space-y-1.5">
                <label htmlFor="bank-select" className="block text-xs font-semibold text-zinc-700">
                  Ngân hàng thụ hưởng:
                </label>
                <select
                  id="bank-select"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl focus:outline-none focus:border-zinc-900 cursor-pointer"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label htmlFor="acc-no" className="block text-xs font-semibold text-zinc-700">
                  Số tài khoản ngân hàng:
                </label>
                <input
                  id="acc-no"
                  type="text"
                  placeholder="VD: 1029384756"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl focus:outline-none focus:border-zinc-900 tabular-nums"
                  required
                />
              </div>

              {/* Account Name */}
              <div className="space-y-1.5">
                <label htmlFor="acc-name" className="block text-xs font-semibold text-zinc-700">
                  Tên chủ tài khoản (in hoa, không dấu):
                </label>
                <input
                  id="acc-name"
                  type="text"
                  placeholder="VD: NGUYEN VAN AN"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl focus:outline-none focus:border-zinc-900 uppercase"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="amount-withdraw" className="font-semibold text-zinc-700">
                    Số tiền muốn rút (đ):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(user.balance)}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Rút toàn bộ ({formatCurrency(user.balance)})
                  </button>
                </div>
                <input
                  id="amount-withdraw"
                  type="number"
                  placeholder="Tối thiểu 10.000 đ"
                  value={amountInputStr}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmountInputStr(e.target.value);
                    setWithdrawAmount(val);
                  }}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl focus:outline-none focus:border-zinc-900 tabular-nums font-semibold text-zinc-900"
                  required
                />

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[100000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAmount(amt)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free fee notice */}
              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] text-zinc-500 space-y-0.5">
                <p className="font-medium text-zinc-700">✓ Miễn phí hoàn toàn phí rút tiền</p>
                <p>Tiền sẽ được chuyển khoản nhanh 24/7 sau khi hệ thống xử lý.</p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="h-10 px-4 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Xác nhận rút tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Active Withdraw Requests List */}
      {withdrawRequests.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Yêu cầu rút tiền đang xử lý</span>
          </h2>
          <div className="space-y-2.5">
            {withdrawRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900">
                    Rút {formatCurrency(req.amount)} về {req.bankName}
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    STK: <span className="font-mono text-zinc-800">{req.accountNo}</span> • Chủ TK: <span className="font-medium text-zinc-800">{req.accountName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {req.status === 'COMPLETED'
                      ? 'Đã chuyển tiền'
                      : req.status === 'REJECTED'
                      ? 'Bị từ chối'
                      : 'Đang chờ xử lý'}
                  </span>
                  <span className="text-zinc-400 tabular-nums text-[11px]">
                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Transaction History Table */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-zinc-900">
          Lịch sử tiền ra vào ví
        </h2>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Chưa có biến động số dư nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Nội dung giao dịch</th>
                  <th className="py-2.5 px-3 text-right">Biến động</th>
                  <th className="py-2.5 px-3 text-right">Số dư sau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((tx) => {
                  const txConfig = WALLET_TX_LABELS[tx.type] || {
                    label: tx.description,
                    isPositive: tx.amount >= 0,
                  };
                  const isPlus = tx.amount > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3 tabular-nums text-zinc-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-zinc-900">{txConfig.label}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{tx.description}</p>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                          isPlus ? 'text-emerald-700' : 'text-zinc-900'
                        }`}
                      >
                        {isPlus ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-zinc-500 font-medium whitespace-nowrap">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

