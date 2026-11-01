import React, { useState } from 'react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    price: number;
    location: string;
    imageUrls: string[];
  }) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Hà Nội');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numPrice = Number(price.replace(/\D/g, ''));
    if (!title.trim()) {
      setError('Vui lòng nhập tên món đồ');
      return;
    }
    if (numPrice < 2000) {
      setError('Giá bán tối thiểu từ 2.000 đ');
      return;
    }
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả tình trạng sản phẩm');
      return;
    }

    const fallbackImg = imageUrl.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      location,
      imageUrls: [fallbackImg],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden text-zinc-900 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-100 flex-shrink-0">
          <h2 className="font-semibold text-sm text-zinc-900">Đăng bán đồ cũ mới</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 -mr-1 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/60 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Tên món đồ cần bán *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bàn làm việc gỗ thông 1m2, Máy xay sinh tố Philips..."
              className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Giá bán mong muốn (đ) *</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ví dụ: 350000"
                className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm tabular-nums focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Khu vực *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Toàn quốc">Toàn quốc</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Đường dẫn ảnh sản phẩm (URL)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (để trống sẽ dùng ảnh mặc định)"
              className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Mô tả chi tiết tình trạng đồ *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu rõ tình trạng (mới bao nhiêu %, có vết xước không, mua từ khi nào, phụ kiện đi kèm)..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-3 text-xs text-zinc-600">
            <span className="font-semibold text-zinc-900">Cam kết người bán:</span> Sau khi khách nhận hàng, người mua có 48 giờ kiểm tra. Tiền sẽ được GudMarket chuyển thẳng vào ví của bạn khi người mua hài lòng hoặc sau 48h.
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="h-10 px-5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs cursor-pointer"
            >
              Đăng tin ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
