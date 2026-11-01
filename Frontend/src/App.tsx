import { useState } from 'react';
import type { Product, Order, User, ProductStatus } from './api/types';
import { formatCurrency, ORDER_STATUS_LABELS } from './api/types';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { AuthModal } from './components/AuthModal';
import { CreateListingModal } from './components/CreateListingModal';
import { UserMenuDropdown } from './components/UserMenuDropdown';
import { MyListingsView } from './pages/MyListingsView';
import { setAuthToken } from './api/client';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-macbook-m1',
    sellerId: 'seller-tran-minh',
    sellerName: 'Trần Minh',
    sellerLocation: 'Cầu Giấy, Hà Nội',
    title: 'MacBook Air M1 2020 (8GB/256GB) Chính Hãng',
    description: 'Đẹp 98% • Pin 91% • Đầy đủ hộp và sạc zin theo máy.',
    price: 11500000,
    imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sofa-felt',
    sellerId: 'seller-2',
    sellerName: 'Lê Hoàng',
    sellerLocation: 'TP.HCM',
    title: 'Sofa Văng Nỉ Xanh Rêu 1m8 Khung Gỗ Sồi',
    description: 'Dùng 8 tháng • Còn mới • Khung gỗ sồi chắc chắn.',
    price: 2450000,
    imageUrls: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'],
    status: 'RESERVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sony-a6400',
    sellerId: 'seller-3',
    sellerName: 'Đức Anh',
    sellerLocation: 'Đà Nẵng',
    title: 'Máy ảnh Sony A6400 + Lens Kit 16-50mm',
    description: '6.000 shot • Hoạt động hoàn hảo • Đà Nẵng.',
    price: 14200000,
    imageUrls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'],
    status: 'SOLD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-breville-870',
    sellerId: 'seller-4',
    sellerName: 'Phạm Trang',
    sellerLocation: 'Hà Nội',
    title: 'Máy Pha Cà Phê Breville 870XL Gia Đình',
    description: 'Đầy đủ phụ kiện • Áp suất tốt • Máy sạch đẹp.',
    price: 8900000,
    imageUrls: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80'],
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-walnut-table',
    sellerId: 'seller-5',
    sellerName: 'Vũ Nam',
    sellerLocation: 'TP.HCM',
    title: 'Bàn Trà Gỗ Óc Chó Chân Tiện Tròn',
    description: 'Gỗ tự nhiên • Trầy nhẹ • Bề mặt mịn đẹp.',
    price: 850000,
    imageUrls: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80'],
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-apple-watch-s8',
    sellerId: 'seller-6',
    sellerName: 'Minh Quang',
    sellerLocation: 'Hà Nội',
    title: 'Apple Watch Series 8 Bản Nhôm 41mm GPS',
    description: 'Như mới 99% • Đủ phụ kiện sạc zin theo máy.',
    price: 4600000,
    imageUrls: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'],
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SAMPLE_ORDER: Order = {
  id: 'order-sample',
  orderCode: 849201,
  productId: 'prod-macbook-m1',
  productTitle: 'MacBook Air M1 2020 (8GB/256GB) Chính Hãng',
  buyerId: 'user-buyer',
  sellerId: 'user-seller',
  sellerName: 'Trần Minh',
  amount: 11500000,
  platformFee: 575000,
  sellerNetAmount: 10925000,
  status: 'ESCROW_HOLDING',
  deadlineAt: '2026-11-04T18:00:00.000Z',
  createdAt: '2026-11-01T18:00:00.000Z',
  updatedAt: '2026-11-01T18:00:00.000Z',
};

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-default',
    email: 'nguyenvanan@gmail.com',
    fullName: 'Nguyễn Văn An',
    role: 'USER',
    balance: 2500000,
    lockedBalance: 0,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  });

  const [currentView, setCurrentView] = useState<'CATALOG' | 'MY_LISTINGS'>('CATALOG');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [modalView, setModalView] = useState<'NONE' | 'STATE_A' | 'STATE_B' | 'STATE_C'>('NONE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Active transaction tracker banner
  const [activeOrder, setActiveOrder] = useState<Order>(SAMPLE_ORDER);
  const [trackNode, setTrackNode] = useState<number>(1);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const openProductDetail = (p: Product) => {
    setSelectedProduct(p);
    setModalView('STATE_A');
  };

  const handleConfirmOrder = () => {
    if (selectedProduct) {
      setActiveOrder({
        ...activeOrder,
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        amount: selectedProduct.price,
        orderCode: Math.floor(100000 + Math.random() * 900000),
      });
    }
    setModalView('STATE_B');
  };

  const handlePaidConfirmation = () => {
    setTrackNode(1);
    setModalView('STATE_C');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const handleCreateProduct = (data: {
    title: string;
    description: string;
    price: number;
    location: string;
    imageUrls: string[];
  }) => {
    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      sellerId: currentUser?.id || 'anonymous',
      sellerName: currentUser?.fullName || 'Người bán',
      sellerLocation: data.location,
      title: data.title,
      description: data.description,
      price: data.price,
      imageUrls: data.imageUrls,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts([newProduct, ...products]);
    alert('Đăng bán thành công! Món đồ của bạn đã hiển thị trên chợ.');
  };

  const handleToggleListingStatus = (productId: string, newStatus: ProductStatus) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, status: newStatus } : item))
    );
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 text-zinc-900 selection:bg-zinc-900 selection:text-white">
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
          <div className="hidden sm:flex items-center gap-5 text-zinc-500 font-medium flex-shrink-0">
            <a href="#quy-dinh" className="hover:text-zinc-900 transition-colors">Cách thức giữ tiền</a>
            <a href="#chinh-sach-48h" className="hover:text-zinc-900 transition-colors">Chính sách 48h kiểm hàng</a>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-6">
          <button
            type="button"
            onClick={() => setCurrentView('CATALOG')}
            className="flex items-center gap-2.5 flex-shrink-0 rounded-lg cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white text-xs font-bold inline-flex items-center justify-center tracking-tight">
              GM
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900">GudMarket</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-600">
              Chợ đồ cũ an toàn
            </span>
          </button>

          {/* Search Bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            role="search"
            className="order-3 sm:order-none w-full sm:w-auto sm:flex-1 max-w-md"
          >
            <label htmlFor="search-input" className="sr-only">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <input
                id="search-input"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm điện thoại, bàn ghế, đồ gia dụng, máy ảnh…"
                className="w-full h-10 bg-zinc-100/80 border border-transparent focus:bg-white focus:border-zinc-300 rounded-full pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:outline-none"
              />
              <svg
                width="16"
                height="16"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </form>

          {/* User Nav */}
          <nav aria-label="Điều hướng người dùng" className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {currentUser ? (
              <>
                <div aria-label="Số dư ví hiện tại" className="inline-flex h-9 px-3 items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100/80 border border-zinc-200/60 rounded-lg">
                  <span className="hidden md:inline">Số dư ví:</span>
                  <span className="text-zinc-900 font-semibold tabular-nums">
                    {formatCurrency(currentUser.balance)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('MY_LISTINGS')}
                  className={`h-9 px-3 inline-flex items-center text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'MY_LISTINGS' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                  }`}
                >
                  Tin của tôi
                </button>
                <button
                  type="button"
                  onClick={() => setModalView('STATE_C')}
                  className="h-9 px-3 inline-flex items-center text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg transition-colors cursor-pointer"
                >
                  Đơn mua
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateListingOpen(true)}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <svg width="15" height="15" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Đăng bán</span>
                </button>

                {/* User Avatar Pill with Dropdown Panel */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Menu tài khoản"
                    className="h-9 px-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
                      {currentUser.fullName
                        ? currentUser.fullName
                            .split(' ')
                            .map((w) => w[0])
                            .slice(-2)
                            .join('')
                            .toUpperCase()
                        : 'U'}
                    </div>
                    <span className="hidden sm:inline text-sm font-semibold text-zinc-900 max-w-[100px] truncate">
                      {currentUser.fullName.split(' ').slice(-1)[0]}
                    </span>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="text-zinc-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <UserMenuDropdown
                    user={currentUser}
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                    onLogout={handleLogout}
                    onOpenMyListings={() => setCurrentView('MY_LISTINGS')}
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="h-9 px-4 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 3. MAIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {currentView === 'MY_LISTINGS' ? (
          <MyListingsView
            listings={products.filter((p) => p.sellerId === currentUser?.id || p.sellerName === currentUser?.fullName)}
            onOpenCreateModal={() => setIsCreateListingOpen(true)}
            onToggleListingStatus={handleToggleListingStatus}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* FILTER SIDEBAR */}
            <aside aria-label="Bộ lọc sản phẩm" className="order-2 lg:order-1 lg:col-span-3 space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">Danh mục</p>
                <ul className="space-y-0.5">
                  {[
                    { id: 'all', name: 'Tất cả mặt hàng', count: products.length },
                    { id: 'tech', name: 'Đồ điện tử & Công nghệ', count: 42 },
                    { id: 'furniture', name: 'Nội thất & Bàn ghế', count: 35 },
                    { id: 'kitchen', name: 'Đồ gia dụng & Nhà bếp', count: 24 },
                    { id: 'fashion', name: 'Thời trang & Phụ kiện', count: 18 },
                    { id: 'camera', name: 'Máy ảnh & Sưu tầm', count: 9 },
                  ].map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => setActiveCategory(cat.id)}
                          className={`w-full flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                            active
                              ? 'bg-zinc-900 text-white font-medium'
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className={`text-xs tabular-nums ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>
                            {cat.count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="pt-5 border-t border-zinc-200/80">
                <label htmlFor="location-filter" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Khu vực người bán
                </label>
                <select
                  id="location-filter"
                  defaultValue="all"
                  className="w-full h-9 bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-lg px-3 text-sm font-medium text-zinc-800 focus:border-zinc-900 cursor-pointer transition-colors"
                >
                  <option value="all">Toàn quốc</option>
                  <option value="hn">Hà Nội</option>
                  <option value="hcm">TP. Hồ Chí Minh</option>
                  <option value="dn">Đà Nẵng</option>
                </select>
              </div>

              <div className="pt-5 border-t border-zinc-200/80">
                <fieldset>
                  <legend className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Tình trạng</legend>
                  <div className="space-y-1.5">
                    <label className="min-h-[32px] flex items-center gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-300" />
                      <span>Còn như mới (95% – 99%)</span>
                    </label>
                    <label className="min-h-[32px] flex items-center gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-300" />
                      <span>Đang dùng tốt, trầy nhẹ</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            </aside>

            {/* PRODUCT LISTING SECTION */}
            <section className="order-1 lg:order-2 lg:col-span-9 space-y-4">
              {/* Active Escrow Banner (State C Widget from template) */}
              <div className="bg-white border border-zinc-200/80 border-l-4 border-l-emerald-600 rounded-xl p-4 shadow-xs text-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                        <span>{ORDER_STATUS_LABELS[activeOrder.status].label}</span>
                      </span>
                      <span className="text-zinc-400" aria-hidden="true">·</span>
                      <span className="font-medium text-zinc-600">
                        Mã đơn <strong className="font-semibold text-zinc-900 tabular-nums">GM{activeOrder.orderCode}</strong>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-zinc-900 text-balance">
                      GudMarket đang giữ hộ <span className="text-emerald-700 font-bold tabular-nums">{formatCurrency(activeOrder.amount)}</span> cho {activeOrder.productTitle}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100 flex-shrink-0">
                    <span className="text-[11px] font-medium text-zinc-500">Thời gian để người bán gửi hàng</span>
                    <span className="text-base font-semibold text-zinc-900 tabular-nums">71:58:42</span>
                  </div>
                </div>

                {/* Precision 3-Node Stepper */}
                <div className="pt-3 border-t border-zinc-100">
                  <div className="relative h-10 flex items-center">
                    <div className="w-full mx-[16.666%] h-2 bg-zinc-100 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: trackNode === 0 ? '0%' : trackNode === 1 ? '50%' : '100%' }}
                      />
                    </div>
                    <span
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-700 text-white text-sm font-bold px-3.5 py-1.5 rounded-full shadow-md ring-4 ring-emerald-50 tabular-nums whitespace-nowrap transition-all duration-500 leading-none"
                      style={{
                        left: trackNode === 0 ? '16.666%' : trackNode === 1 ? '50%' : '83.333%',
                      }}
                    >
                      {formatCurrency(activeOrder.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 mt-2 text-center text-xs">
                    <span className={trackNode === 0 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>Bạn thanh toán</span>
                    <span className={trackNode === 1 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>GudMarket giữ hộ</span>
                    <span className={trackNode === 2 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>Người bán nhận tiền</span>
                  </div>
                </div>
              </div>

              {/* Single-row Catalog Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Tin đăng mới nhất</h1>
                <div className="flex items-center gap-2 text-xs">
                  <label htmlFor="sort-by" className="text-zinc-500 font-medium">Sắp xếp:</label>
                  <select id="sort-by" defaultValue="newest" className="h-8 bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-lg px-2.5 text-xs font-medium text-zinc-800 cursor-pointer transition-colors">
                    <option value="newest">Mới đăng gần nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                  </select>
                </div>
              </div>

              {/* 3-Step Escrow Horizontal Info Strip */}
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

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pt-1">
                {filteredProducts.map((p) => {
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
                              onClick={() => {
                                if (isAvailable) openProductDetail(p);
                                else if (isReserved) setModalView('STATE_C');
                              }}
                              className={`text-left after:absolute after:inset-0 ${isAvailable || isReserved ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              {p.title}
                            </button>
                          </h2>
                          <p className="text-xs text-zinc-500 mt-1">{p.description}</p>
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
                          {isReserved && (
                            <span className="bg-emerald-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span>Đang giao dịch</span>
                            </span>
                          )}
                          {isSold && (
                            <span className="bg-zinc-100 text-zinc-600 border border-zinc-200/60 text-[11px] font-medium px-2 py-0.5 rounded-full">
                              Đã bán
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSubmit={handleCreateProduct}
      />

      {/* 4. MODALS (STATE A, STATE B, STATE C) */}
      {modalView !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white sm:rounded-2xl shadow-xl sm:border border-zinc-200/80 overflow-hidden text-zinc-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 px-5 h-14 border-b border-zinc-200/80 flex-shrink-0">
              <h2 className="font-semibold text-sm text-zinc-900 truncate">
                {modalView === 'STATE_A' && 'Chi tiết & Xác nhận đơn hàng'}
                {modalView === 'STATE_B' && 'Thanh toán qua mã VietQR'}
                {modalView === 'STATE_C' && 'GudMarket giữ tiền hộ bạn'}
              </h2>
              <button
                type="button"
                onClick={() => setModalView('NONE')}
                aria-label="Đóng cửa sổ"
                className="h-8 w-8 -mr-1 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STATE A */}
            {modalView === 'STATE_A' && selectedProduct && (
              <section className="flex-1 min-h-0 flex flex-col">
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
                      <p className="text-xs text-zinc-500 mt-1">{selectedProduct.description}</p>
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
                    <p className="text-sm font-medium text-zinc-900">
                      {currentUser?.fullName || 'Nguyễn Văn A'} · 0901 234 567
                    </p>
                    <p className="text-zinc-500">Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội</p>
                  </div>

                  {/* 48h Safe Timeline */}
                  <div className="rounded-xl bg-white border border-zinc-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Mua sắm an toàn cùng GudMarket</p>
                      <span className="text-[11px] font-medium text-emerald-700">GudMarket giữ tiền hộ bạn</span>
                    </div>
                    <ol className="space-y-2.5 text-xs">
                      <li className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center justify-center flex-shrink-0 tabular-nums">1</span>
                        <p className="text-zinc-600"><strong className="font-medium text-zinc-900">Bạn thanh toán cho GudMarket.</strong> Tiền được giữ hộ an toàn, chưa chuyển ngay cho người bán.</p>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold inline-flex items-center justify-center flex-shrink-0 tabular-nums">2</span>
                        <p className="text-zinc-600"><strong className="font-medium text-zinc-900">Người bán gửi hàng trong 72 giờ.</strong> Nếu quá hạn chưa gửi, bạn được hoàn lại 100% tiền.</p>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold inline-flex items-center justify-center flex-shrink-0 tabular-nums">3</span>
                        <p className="text-zinc-600"><strong className="font-medium text-zinc-900">Kiểm tra hàng thoải mái trong 48 giờ.</strong> Nếu hàng không đúng mô tả, bấm Báo lỗi / Yêu cầu hoàn tiền kèm video mở hộp.</p>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold inline-flex items-center justify-center flex-shrink-0 tabular-nums">4</span>
                        <p className="text-zinc-600"><strong className="font-medium text-zinc-900">Chuyển tiền cho người bán.</strong> Nếu hàng đúng mô tả, GudMarket sẽ chuyển tiền cho người bán khi bạn xác nhận hoặc sau 48 giờ.</p>
                      </li>
                    </ol>
                  </div>

                  {/* Payment selector */}
                  <fieldset>
                    <legend className="text-xs font-semibold text-zinc-900 mb-2">Phương thức thanh toán</legend>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50/60 cursor-pointer">
                        <input type="radio" name="payment_method" defaultChecked className="mt-0.5 w-4 h-4" />
                        <span className="text-sm flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <strong className="font-medium text-zinc-900 text-xs sm:text-sm">Chuyển khoản nhanh qua mã VietQR</strong>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-white">Khuyên dùng</span>
                          </span>
                          <span className="block text-xs text-zinc-500 mt-0.5">Quét mã bằng ứng dụng ngân hàng bất kỳ, tự động xác nhận tức thì</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-100/60 cursor-not-allowed">
                        <input type="radio" name="payment_method" disabled className="mt-0.5 w-4 h-4" />
                        <span className="text-sm flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <strong className="font-medium text-zinc-500 text-xs sm:text-sm">Số dư ví GudMarket</strong>
                            <span className="text-xs font-semibold text-zinc-600 tabular-nums">
                              {currentUser ? formatCurrency(currentUser.balance) : '0 đ'}
                            </span>
                          </span>
                          <span className="block text-xs font-medium text-amber-800 mt-1 tabular-nums">
                            Không đủ số dư ví. Vui lòng chọn chuyển khoản VietQR.
                          </span>
                        </span>
                      </label>
                    </div>
                  </fieldset>
                </div>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-zinc-600">Tổng thanh toán (GudMarket giữ tiền hộ bạn)</span>
                    <span className="text-lg font-bold text-zinc-900 tabular-nums">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    className="w-full h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Tạo mã VietQR thanh toán
                  </button>
                </div>
              </section>
            )}

            {/* STATE B */}
            {modalView === 'STATE_B' && (
              <section className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Đang giữ sản phẩm cho bạn</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Mã thanh toán tự động hết hạn sau</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200/80 text-base font-bold text-zinc-900 tabular-nums shadow-2xs">
                      14:52
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
                      <svg width="144" height="144" viewBox="0 0 120 120" fill="#18181B">
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
                    <p className="text-xs text-zinc-500">Quét bằng ứng dụng ngân hàng hoặc sao chép thông tin bên dưới</p>
                  </div>

                  <dl className="rounded-xl border border-zinc-200/80 divide-y divide-zinc-200/80 text-xs sm:text-sm bg-white">
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-zinc-500">Ngân hàng thụ hưởng</dt>
                      <dd className="font-medium text-zinc-900">Vietcombank (VCB)</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-zinc-500">Số tài khoản</dt>
                      <dd className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 tabular-nums">9988 7766 55</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('9988776655', 'acc')}
                          className="px-2 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-md transition-colors cursor-pointer"
                        >
                          {copyFeedback === 'acc' ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-zinc-500">Chủ tài khoản</dt>
                      <dd className="font-medium text-zinc-900">CTCP GUDMARKET VIỆT NAM</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-zinc-500">Số tiền chuyển khoản</dt>
                      <dd className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 tabular-nums">{formatCurrency(activeOrder.amount)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(activeOrder.amount), 'amount')}
                          className="px-2 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-md transition-colors cursor-pointer"
                        >
                          {copyFeedback === 'amount' ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-emerald-50/40">
                      <dt className="text-zinc-700 font-medium">Nội dung chuyển khoản</dt>
                      <dd className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700 tabular-nums">GM{activeOrder.orderCode}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`GM${activeOrder.orderCode}`, 'memo')}
                          className="px-2 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          {copyFeedback === 'memo' ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalView('STATE_A')}
                    className="h-11 px-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200/80 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Quay lại đơn hàng
                  </button>
                  <button
                    type="button"
                    onClick={handlePaidConfirmation}
                    className="h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Tôi đã chuyển khoản
                  </button>
                </div>
              </section>
            )}

            {/* STATE C */}
            {modalView === 'STATE_C' && (
              <section className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                        <span>Đã thanh toán • Chờ người bán gửi hàng</span>
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-zinc-500 font-medium">Mã đơn <strong className="text-zinc-900 tabular-nums">GM{activeOrder.orderCode}</strong></span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 text-balance">
                      GudMarket đang giữ hộ <span className="text-emerald-700 tabular-nums">{formatCurrency(activeOrder.amount)}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Kiểm tra hàng thoải mái trong 48 giờ sau khi nhận. Nếu hàng đúng mô tả, GudMarket sẽ chuyển tiền cho người bán.
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 px-4 pt-4 pb-3 space-y-2">
                    <div className="relative h-10 flex items-center">
                      <div className="w-full mx-[16.666%] h-2 bg-zinc-100 rounded-full overflow-hidden" aria-hidden="true">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: trackNode === 0 ? '0%' : trackNode === 1 ? '50%' : '100%' }}
                        />
                      </div>
                      <span
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-700 text-white text-sm font-bold px-3.5 py-1.5 rounded-full shadow-md ring-4 ring-emerald-50 tabular-nums whitespace-nowrap transition-all duration-500 leading-none"
                        style={{
                          left: trackNode === 0 ? '16.666%' : trackNode === 1 ? '50%' : '83.333%',
                        }}
                      >
                        {formatCurrency(activeOrder.amount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 mt-2 text-center text-xs">
                      <span className={trackNode === 0 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>Bạn thanh toán</span>
                      <span className={trackNode === 1 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>GudMarket giữ hộ</span>
                      <span className={trackNode === 2 ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>Người bán nhận tiền</span>
                    </div>
                  </div>

                  {/* Countdown Card */}
                  <div className="rounded-xl border border-zinc-200/80 p-4 flex items-center justify-between gap-4 bg-white">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Thời gian để người bán gửi hàng</p>
                      <p className="text-xs text-zinc-500 mt-1">Nếu sau 72 giờ người bán chưa gửi hàng, GudMarket hoàn lại 100% tiền cho bạn</p>
                    </div>
                    <span className="text-xl font-bold text-zinc-900 tabular-nums flex-shrink-0">71:58:42</span>
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50 flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalView('NONE')}
                    className="h-11 px-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200/80 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng & Xem ngoài trang
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackNode(2)}
                    className="h-11 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Xem thử: Chuyển tiền cho người bán
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="mt-16 border-t border-zinc-200/80 bg-white py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GudMarket — Chợ mua bán đồ cũ, giữ tiền hộ an toàn 48 giờ.</p>
          <div className="flex gap-6">
            <a href="#dieu-khoan" className="hover:text-zinc-900 transition-colors">Điều khoản giao dịch</a>
            <a href="#quy-dinh-hoan-tien" className="hover:text-zinc-900 transition-colors">Báo lỗi / Yêu cầu hoàn tiền</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
