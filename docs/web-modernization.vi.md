# Hiện đại hóa Web và đánh giá Rust, Go, Tauri

**Trạng thái: kế hoạch, chưa phải quyết định đổi stack.** Baseline mã nguồn: `6b244ac`. Giữ Web chạy độc lập với desktop. Không lấy việc dịch hết C# làm tiêu chí thành công; tiêu chí là người dùng hoàn thành tác vụ đúng, nhanh, bảo toàn dữ liệu và có đường quay lại. MVP giới hạn ở UI quản trị, dữ liệu mẫu và chức năng đọc; không chuyển hay tối ưu engine chạy tự động, proxy hoặc kiểm tra thông tin đăng nhập.

## Prompt làm việc cho từng thay đổi

> Với [tác vụ người dùng], đọc nguồn và test bằng LeanREA. Chỉ rõ điều đã thấy, điều suy ra và điều chưa biết. Ghi hành vi hiện tại, quyền cần thiết và dữ liệu không được mất. Đo baseline trước khi chọn giải pháp; so sánh cả phương án giữ nguyên stack. Làm lát cắt nhỏ nhất có thể tắt độc lập. Test đường thành công, từ chối quyền, dữ liệu rỗng, lỗi I/O và phục hồi khi thích hợp. Báo cáo lệnh đã chạy, môi trường, kết quả, giới hạn và cách rollback. Nếu chưa đạt tiêu chí, không mở rộng phạm vi hay tuyên bố đã tối ưu.

## Điểm tựa trong checkout

- `OpenBullet2.Web/Controllers/HealthController.cs` chỉ trả `Ok()`: phù hợp kiểm tra wiring, **không** đại diện cho hiệu suất ứng dụng. `OpenBullet2.Web/Controllers/InfoController.cs` có phân quyền và DTO: dùng làm ví dụ khi chốt contract.
- `OpenBullet2.Web/appsettings.json` khai báo SQLite; `OpenBullet2.Web/Program.cs` chạy migration khi khởi động. Không để hai backend cùng quản lý schema trong thử nghiệm.
- `openbullet2-web-client/src/app/app-routing.module.ts` đã lazy-load `MainModule`; `src/app/main/main-routing.module.ts` trong client import trực tiếp nhiều màn hình. Cần đo chunk của route sau đăng nhập, không mặc định rằng chỉ cần bật lazy loading ở root.
- `openbullet2-web-client/angular.json` đã có budget initial warning 1 MB/error 2 MB. Đó là ngưỡng build, không phải thời gian tải đo trên máy người dùng.

## Phase và điều kiện chuyển tiếp

| Phase | Công việc và đầu ra | Điều kiện qua / khi không đạt |
|---|---|---|
| 0 · Tin được kết quả | Ghi phiên bản SDK/Node/browser, CI hiện tại, build release và lỗi baseline. Sửa việc CI có thể nuốt exit code test; kiểm tra mặc định xác thực và khôi phục updater trong các thay đổi riêng. Lập inventory theo màn hình → API → quyền → nơi lưu → test; phân loại giữ, trì hoãn, loại khỏi MVP. | Một project test lỗi phải làm CI đỏ. Backup/restore thử trên bản sao. Không rollout nếu lỗi quyền hoặc mất dữ liệu còn mở. |
| 1 · Đo hành trình Web | Dùng profile trình duyệt sạch và fixture giả cố định: đăng nhập → trang chủ → đọc thông tin phiên bản → đăng xuất. Đo tải lạnh và chuyển màn hình ấm, JS tải theo route, LCP, độ trễ tương tác, lỗi console; thử bàn phím và viewport hẹp. Lưu trace cùng commit và cấu hình throttle, không lưu token. | Có baseline lặp lại và danh sách điểm nghẽn theo tác động. Nếu thời gian chậm nằm ở render thì không đổi backend để chữa. |
| 2 · Cải thiện Angular trước | Theo trace, tách màn hình nặng khỏi đường tải đầu; sửa focus, nhãn, trạng thái tải/rỗng/lỗi và thông báo phiên hết hạn. Chia thay đổi theo hành trình thay vì viết lại toàn bộ giao diện. | E2E desktop/mobile cho hành trình mẫu, thao tác được bằng bàn phím, không mất focus. So sánh trace cùng điều kiện và giữ budget build hiện tại. |
| 3 · So .NET / Go / Rust | Chỉ khi còn vấn đề phía server: dùng cùng một API đọc metadata từ fixture SQLite read-only, cùng schema/DTO, quyền, index, giới hạn bộ nhớ và số client local. So .NET release với Go và Rust release. Đo p95, RSS, cold start, lỗi, độ phức tạp build/package. Tauri không phải lựa chọn thay thế HTTP server. | Contract test giống nhau cho cả ba; chạy warm-up rồi ít nhất 5 lượt độc lập, báo cả độ phân tán. Ngưỡng đề xuất phải chốt trước khi đo: cải thiện ≥20% chỉ số nút thắt, không làm chỉ số quan trọng khác xấu >5%. Nếu kết quả trong nhiễu hoặc chi phí bảo trì không đáng, giữ .NET. Ghi quyết định và dữ liệu vào ADR. |
| 4 · Di chuyển từng phần | Nếu phase 3 có lợi: chuyển **một** API đọc qua cờ tính năng, giữ route/DTO và quyền. So kết quả hai bản trên fixture, chuẩn hóa trường thời gian. Dùng .NET làm bên ghi duy nhất; tách mọi thay đổi schema thành quyết định riêng. | Test cả bật/tắt cờ, timeout, dữ liệu cũ và 401/403 theo contract. Tắt cờ phải quay về backend cũ mà không restore DB. Chỉ mở rộng sau khi đạt cả parity lẫn chỉ số đã chốt. |
| 5 · Desktop tùy nhu cầu | Nếu có nhu cầu desktop cụ thể, thử Tauri với cùng UI cho một màn hình chỉ đọc; giới hạn quyền native. So với WPF về startup, RSS, kích thước gói, bàn phím và công sức ký/phát hành. | Cài/gỡ/nâng cấp và quay về bản cũ trên hệ điều hành hỗ trợ; không bỏ WPF nếu chức năng người dùng cần chưa tương đương. Không bắt Web phụ thuộc Tauri. |

**Quy tắc phát hành:** mỗi thay đổi nêu baseline → diff → test → kết quả → rollback. Chạy thử với fixture trước, bật giới hạn sau, theo dõi lỗi và thời gian phản hồi; không merge vì benchmark đơn lẻ. Không dọn nhánh đang hoạt động; việc merge và dọn nhánh tạm chỉ thực hiện sau review, CI đạt và xác nhận phạm vi.
