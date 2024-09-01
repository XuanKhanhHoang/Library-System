Thư viện/Hệ thống quản lý:

# Kiểm tra sách khi trả:

## Nếu sách bị hư hại:

- Đánh giá mức độ hư hại.
- Thông báo người mượn về mức phạt hư hại.
- Ghi nhận phạt và cập nhật trạng thái.

## Nếu sách bị mất:

- Xác định giá trị sách.
- Thông báo người mượn về mức phạt mất sách.
- Ghi nhận phạt và cập nhật trạng thái.

## Nếu trả sách quá hạn:

- Tính toán phí phạt quá hạn.
- Thông báo người mượn về mức phạt quá hạn.
- Ghi nhận phạt và cập nhật trạng thái.

```plaintext
|Khách hàng             |Thư viện                  |
|-----------------------|--------------------------|
|Mượn sách              |Kiểm tra thời hạn mượn sách|
|                       |Xác định quá hạn          |
|Nhận thông báo phạt    |Gửi thông báo phạt        |
|                       |Cập nhật trạng thái       |
```

```plaintext
| Khách hàng               | Thư viện                                  |
|--------------------------|--------------------------------------------|
| Mượn sách                | Kiểm tra thời hạn mượn sách                |
|                          | If (Quá hạn) -> Gửi thông báo phạt         |
|                          | Else -> Không phạt                         |
|                          | Cập nhật trạng thái                        |
| Nhận thông báo phạt      |                                            |

| Trả sách                 | Kiểm tra tình trạng sách                   |
|                          | If (Sách bị hư hại) -> Đánh giá mức độ hư hại|
|                          |     -> Thông báo mức phạt hư hại           |
|                          |     -> Ghi nhận phạt và cập nhật trạng thái|
|                          | If (Sách bị mất) -> Xác định giá trị sách   |
|                          |     -> Thông báo mức phạt mất sách         |
|                          |     -> Ghi nhận phạt và cập nhật trạng thái|
|                          | If (Quá hạn) -> Tính toán phí phạt quá hạn |
|                          |     -> Thông báo mức phạt quá hạn          |
|                          |     -> Ghi nhận phạt và cập nhật trạng thái|

```

# Các loại thống kê

```plaintext
|Thủ thư               |Hệ thống                   |
|----------------------|---------------------------|
|Yêu cầu thống kê      |Nhận yêu cầu thống kê      |
|                      |Truy xuất dữ liệu          |
|Xem kết quả thống kê  |Tạo báo cáo                |
|                      |Cung cấp kết quả           |

```

https://photos.app.goo.gl/SucDvDuDfzuygvHL7
