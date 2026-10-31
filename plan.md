# Kế hoạch dự án

## 1. Ý tưởng và bối cảnh

### Mô hình dự án

Xây dựng một sàn C2C theo mô hình Chợ Tốt, cho phép người dùng:

- Đăng tin bán sản phẩm.
- Tìm kiếm và xem chi tiết sản phẩm.
- Mua bán, trao đổi đồ cũ.
- Theo dõi đơn hàng và xử lý khiếu nại.

### Tính năng cốt lõi: thanh toán ký quỹ (Escrow)

Để hạn chế lừa đảo, tiền của người mua sẽ được sàn tạm giữ. Sàn chỉ giải ngân tiền cho người bán sau khi:

1. Người mua nhận và kiểm tra hàng thành công; hoặc
2. Hết thời hạn khiếu nại mà không phát sinh tranh chấp.

### Tên đề tài học thuật

> **Xây dựng sàn thương mại điện tử C2C tích hợp cơ chế thanh toán ký quỹ trung gian (Escrow) và giải quyết tranh chấp**

Đề tài có độ phức tạp phù hợp với đồ án nhờ các thành phần:

- State machine cho vòng đời đơn hàng.
- Cronjob tự động giải ngân.
- Database transaction và database locking.
- Quản lý biến động số dư ví.
- Quy trình khiếu nại, trả hàng và hoàn tiền.

## 2. Luồng nghiệp vụ end-to-end

```text
[1. Mua hàng]
        │
        ▼
Hệ thống tạo VietQR động qua payOS
(số tiền + mã đơn hàng)
        │
        ▼
[2. Thanh toán]
Buyer quét QR → Tiền vào tài khoản sàn → Webhook báo thành công
        │
        ▼
[3. Ký quỹ]
Order: ESCROW_HOLDING
Tiền được khóa trong hệ thống; Seller chưa nhận được tiền
        │
        ▼
[4. Giao hàng]
Shipper giao hàng thành công → Order: DELIVERED
→ Bắt đầu đếm ngược 48 giờ
        │
        ├──────────────────────────────────────────────┐
        ▼                                              ▼
[Nhánh A: Hài lòng]                          [Nhánh B: Khiếu nại]
Buyer bấm “Xác nhận”                         Buyer bấm “Khiếu nại”
hoặc Cronjob hết 48 giờ                      kèm video/ảnh bằng chứng
        │                                              │
        ▼                                              ▼
[5A. Giải ngân]                                [5B. Tranh chấp]
Order: COMPLETED                               Dừng đồng hồ 48 giờ
Trừ phí sàn, cộng tiền                         Order: DISPUTED
vào ví Seller                                  Admin đối soát bằng chứng
        │                                              │
        ▼                                              ├─ Bác bỏ khiếu nại
[6A. Rút tiền]                                  │   → Giải ngân cho Seller
Seller tạo lệnh rút tiền                        │
về tài khoản ngân hàng                          └─ Chấp thuận khiếu nại
                                                    → Chuyển sang trả hàng
                                                         │
                                                         ▼
                                                [6B. Trả hàng và hoàn tiền]
                                                Buyer nhập mã vận đơn trả hàng
                                                Seller xác nhận đã nhận hàng
                                                         │
                                                         ▼
                                                [7B. Hoàn tiền nội bộ]
                                                Order: CLOSED_REFUNDED
                                                Cộng tiền vào ví Buyer
                                                Buyer có thể mua hàng khác
                                                hoặc rút tiền
```

## 3. Thiết kế kỹ thuật

### 3.1. Frontend

#### Chức năng dành cho người dùng

- Đăng tin và quản lý tin đăng.
- Tìm kiếm sản phẩm.
- Xem trang chi tiết sản phẩm.
- Hiển thị modal quét VietQR để thanh toán.
- Quản lý đơn hàng và trạng thái giao hàng.
- Hiển thị đồng hồ đếm ngược 48 giờ sau khi nhận hàng.

#### Khiếu nại và trả hàng

- Form upload video bóc seal hoặc ảnh bằng chứng.
- Form mô tả lỗi sản phẩm.
- Form nhập mã vận đơn khi trả hàng.

#### Ví cá nhân

- Hiển thị số dư khả dụng: `balance`.
- Hiển thị số dư đang bị khóa: `locked_balance`.
- Tạo lệnh rút tiền về tài khoản ngân hàng.
- Theo dõi lịch sử rút tiền và hoàn tiền.

#### Admin Dashboard

- Duyệt và quản lý tin đăng.
- Xử lý tranh chấp.
- Xem video/ảnh bằng chứng.
- Bấm **Hoàn tiền** hoặc **Giải ngân**.
- Duyệt các yêu cầu rút tiền.

### 3.2. Backend và các tiến trình nền

#### Pay-in API và Webhook

1. Nhận yêu cầu mua hàng.
2. Gọi payOS để tạo VietQR.
3. Nhận webhook xác nhận giao dịch.
4. Chạy database transaction.
5. Cập nhật trạng thái đơn hàng thành `ESCROW_HOLDING`.

#### Cronjob Worker

Cronjob chạy định kỳ mỗi 30 giây đến 1 phút để tìm các đơn hàng thỏa mãn:

```sql
status = 'DELIVERED'
AND current_time > auto_release_at
```

Với mỗi đơn hàng phù hợp, hệ thống sẽ:

1. Tự động giải ngân tiền vào ví người bán.
2. Cập nhật trạng thái đơn hàng thành `COMPLETED`.

#### Dispute và Refund Service

- Dừng tiến trình tự động giải ngân khi người mua gửi khiếu nại.
- Chuyển đơn hàng sang trạng thái `DISPUTED`.
- Hỗ trợ admin xử lý bằng chứng.
- Hoàn tiền vào ví người mua nếu khiếu nại được chấp thuận.

### 3.3. Database schema tối thiểu

#### `Orders`

| Trường | Mô tả |
|---|---|
| `id` | ID đơn hàng |
| `order_code` | Mã đơn hàng |
| `buyer_id` | Người mua |
| `seller_id` | Người bán |
| `amount` | Giá trị đơn hàng |
| `status` | Trạng thái đơn hàng |
| `delivered_at` | Thời điểm giao hàng thành công |
| `auto_release_at` | Thời điểm tự động giải ngân |
| `return_tracking_code` | Mã vận đơn trả hàng |

Các trạng thái chính:

```text
PENDING_PAYMENT → ESCROW_HOLDING → SHIPPING → DELIVERED
                                      │
                                      ├─ COMPLETED
                                      └─ DISPUTED → RETURN_PENDING
                                                  → RETURNING
                                                  → CLOSED_REFUNDED
```

#### `Wallets`

| Trường | Mô tả |
|---|---|
| `user_id` | Chủ sở hữu ví |
| `balance` | Số dư có thể sử dụng |
| `locked_balance` | Số dư đang bị khóa, chờ xử lý rút tiền |

#### `Disputes`

| Trường | Mô tả |
|---|---|
| `id` | ID khiếu nại |
| `order_id` | Đơn hàng liên quan |
| `reason` | Lý do khiếu nại |
| `evidence_urls` | Đường dẫn video/ảnh bằng chứng |
| `status` | `OPEN`, `APPROVED`, `REJECTED` |

#### `WithdrawRequests`

| Trường | Mô tả |
|---|---|
| `id` | ID yêu cầu rút tiền |
| `user_id` | Người yêu cầu |
| `amount` | Số tiền muốn rút |
| `bank_name` | Tên ngân hàng |
| `account_no` | Số tài khoản |
| `account_name` | Tên chủ tài khoản |
| `status` | `PENDING`, `COMPLETED`, `REJECTED` |

## 4. Ví nội bộ và quản lý lệnh rút tiền

Do chưa có API tự động chuyển tiền ngân hàng ra ngoài, toàn bộ tiền nhận và tiền hoàn sẽ được xử lý qua ví nội bộ. Người dùng có thể tạo lệnh rút, sau đó admin chuyển khoản thủ công và xác nhận trên hệ thống.

### 4.1. Người dùng tạo lệnh rút tiền

Người dùng nhập:

- Số tiền cần rút.
- Tên ngân hàng.
- Số tài khoản.
- Tên chủ tài khoản.

Hệ thống chạy database transaction để khóa số tiền và tạo yêu cầu rút:

```sql
UPDATE Wallets
SET balance = balance - :amount,
    locked_balance = locked_balance + :amount
WHERE user_id = :user_id
  AND balance >= :amount;

INSERT INTO WithdrawRequests
    (user_id, amount, bank_name, account_no, account_name, status)
VALUES
    (:user_id, :amount, :bank_name, :account_no, :account_name, 'PENDING');
```

### 4.2. Admin duyệt và chuyển tiền

1. Admin xem danh sách yêu cầu rút tiền trên Dashboard.
2. Hệ thống tạo VietQR đích gồm số tài khoản và số tiền của người dùng.
3. Admin quét QR bằng ứng dụng ngân hàng để chuyển khoản thủ công.
4. Sau khi chuyển thành công, admin bấm **Xác nhận đã chuyển**.

```sql
UPDATE Wallets
SET locked_balance = locked_balance - :amount
WHERE user_id = :user_id;

UPDATE WithdrawRequests
SET status = 'COMPLETED'
WHERE id = :request_id;
```

### 4.3. Admin từ chối yêu cầu

Nếu thông tin tài khoản sai hoặc yêu cầu vi phạm chính sách, admin có thể từ chối:

```sql
UPDATE Wallets
SET balance = balance + :amount,
    locked_balance = locked_balance - :amount
WHERE user_id = :user_id;

UPDATE WithdrawRequests
SET status = 'REJECTED'
WHERE id = :request_id;
```

## 5. Giải pháp demo và xử lý rủi ro khi bảo vệ đồ án

### 5.1. Nạp tiền — Pay-in

- Đăng ký tài khoản cá nhân payOS bằng CCCD.
- Sử dụng giao dịch thật với số tiền nhỏ, khoảng 2.000–5.000 đồng.
- Quét QR bằng ứng dụng ngân hàng cá nhân.
- Kiểm tra webhook và trạng thái đơn hàng tự động chuyển sang `ESCROW_HOLDING` theo thời gian thực.

### 5.2. Đồng hồ đếm ngược 48 giờ

Trong môi trường demo, cấu hình thời gian chờ thành 60 giây thay vì 48 giờ:

1. Giả lập shipper giao hàng.
2. Đơn hàng chuyển sang `DELIVERED`.
3. Giao diện hiển thị đồng hồ 1 phút.
4. Cronjob tự động giải ngân khi hết thời gian.

### 5.3. Trả hàng

Tạo các nút mô phỏng để không cần vận chuyển hàng thật:

- Buyer bấm **Giả lập gửi mã vận đơn test**.
- Seller bấm **Xác nhận đã nhận hàng hoàn test**.
- Hệ thống lập tức kích hoạt quy trình hoàn tiền trên giao diện.

### 5.4. Rút tiền

Sử dụng hai tab trình duyệt để trình diễn:

- Tab User: tạo lệnh rút tiền.
- Tab Admin: duyệt và xác nhận lệnh rút.
- Tab User: tải lại dữ liệu để thấy `locked_balance` được giải phóng và lịch sử chuyển sang trạng thái thành công.

Không cần thực hiện chuyển khoản liên ngân hàng thật trong phần demo này.
