import React, { useState } from 'react';
import type { Order } from '../api/types';
import { formatCurrency } from '../api/types';

interface DisputeModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (orderId: string, reason: string, evidenceUrls: string[]) => void;
}

const COMMON_REASONS = [
  'Hàng bị nứt vỡ, trầy xước nặng do vận chuyển',
  'Sản phẩm không hoạt động / lỗi kỹ thuật',
  'Sản phẩm khác xa so với hình ảnh & mô tả',
  'Thiếu phụ kiện quan trọng kèm theo',
  'Nghi vấn hàng nhái / không chính hãng',
  'Lý do khác',
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmitDispute,
}) => {
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [description, setDescription] = useState('');
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidencePreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (newImageUrl.trim()) {
      setEvidencePreviews((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidencePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Vui lòng mô tả chi tiết tình trạng hàng lỗi để GudMarket hỗ trợ bạn tốt nhất!');
      return;
    }
    if (evidencePreviews.length === 0) {
      alert('Vui lòng cung cấp ít nhất 1 hình ảnh hoặc video mở hộp làm bằng chứng!');
      return;
    }

    setIsSubmitting(true);
    const fullReason = `[${selectedReason}] ${description.trim()}`;
    setTimeout(() => {
      onSubmitDispute(order.id, fullReason, evidencePreviews);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200/90 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                Báo lỗi / Yêu cầu hoàn tiền
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Đơn hàng <strong className="text-zinc-900 tabular-nums">GM{order.orderCode}</strong> • {order.productTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Safe Holding Guarantee Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200/70 rounded-xl text-rose-900 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
              <span>GudMarket sẽ tạm giữ số tiền {formatCurrency(order.amount)}</span>
            </p>
            <p className="text-rose-700 leading-relaxed text-[11px]">
              Khi bạn gửi yêu cầu, hệ thống sẽ <strong>lập tức tạm dừng</strong> việc chuyển tiền cho người bán. Tiền của bạn được bảo toàn tuyệt đối cho đến khi vấn đề được giải quyết công bằng.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label htmlFor="dispute-reason" className="block text-xs font-semibold text-zinc-700">
              Vấn đề bạn gặp phải:
            </label>
            <select
              id="dispute-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
            >
              {COMMON_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Detail Description */}
          <div className="space-y-1.5">
            <label htmlFor="dispute-desc" className="block text-xs font-semibold text-zinc-700">
              Mô tả chi tiết tình trạng sản phẩm:
            </label>
            <textarea
              id="dispute-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Mở hộp thấy màn hình bị kẻ sọc, cắm sạc không lên nguồn, khác với mô tả còn mới 98% của người bán..."
              className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200/90 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Evidence Upload Previews */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700">
              Ảnh chụp / Video làm bằng chứng ({evidencePreviews.length}):
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {evidencePreviews.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl bg-zinc-100 border border-zinc-200/80 overflow-hidden group"
                >
                  <img src={url} alt={`Bằng chứng ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(index)}
                    aria-label="Xóa ảnh này"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-zinc-900/80 text-white text-[10px] flex items-center justify-center opacity-80 group-hover:opacity-100 hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload New Evidence Button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors p-2 text-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[11px] font-medium mt-1">Tải ảnh/video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Quick URL Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                placeholder="Hoặc dán đường dẫn ảnh bằng chứng (URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 h-8 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-800"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="h-8 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Thêm link
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Đang gửi khiếu nại...</span>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>Gửi yêu cầu &amp; Tạm giữ tiền</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

