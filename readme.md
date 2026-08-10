# HUST Academic Virtual Assistant

Hệ thống **HUST Academic Virtual Assistant** là hệ thống trợ lý ảo hỗ trợ hỏi đáp thông tin học phần của Trường Đại học Bách khoa Hà Nội. Hệ thống được xây dựng theo kiến trúc microservices và triển khai bằng Docker Compose.

## 1. Cấu trúc project

```text
hust_academic_virtual_assistant/
├── authen-service/
├── chat-app/
├── chat-cms/
├── chat-service/
├── chat-session-service/
├── cloud-gateway/
├── crawler_service/
├── database/
├── eureka-server/
├── report-service/
├── user-service/
├── docker-compose.yml
└── pom.xml
```

## 2. Các service và port

| Service                   |            Port |
| ------------------------- | --------------: |
| Eureka Server             |          `8671` |
| Cloud Gateway             |          `9898` |
| Chat Service              |          `1923` |
| Crawler JobRunr Dashboard |          `8101` |
| Chat App                  |          `5173` |
| MySQL                     |   `3307 → 3306` |
| MongoDB                   | `27018 → 27017` |
| ChromaDB                  |          `8000` |

Các backend service còn lại được truy cập thông qua **API Gateway**.

---

## 3. Build toàn bộ hệ thống

Mở Terminal tại thư mục gốc:

```bash
cd hust_academic_virtual_assistant
```

Build toàn bộ Docker image:

```bash
docker compose build
```

Nếu muốn build lại hoàn toàn và không sử dụng cache:

```bash
docker compose build --no-cache
```

---

## 4. Chạy toàn bộ hệ thống

Khởi động các container:

```bash
docker compose up -d
```

Hoặc vừa build vừa chạy:

```bash
docker compose up -d --build
```

---

## 5. Kiểm tra container

Kiểm tra trạng thái các service:

```bash
docker compose ps
```

Hoặc:

```bash
docker ps
```

Đảm bảo các container cần thiết đều ở trạng thái `Up`.

---

## 6. Import dữ liệu ban đầu

Sau khi toàn bộ service và database đã chạy thành công, tiến hành import dữ liệu có sẵn trong thư mục:

```text
database/
```

Dữ liệu cần được import tương ứng vào ba hệ quản trị cơ sở dữ liệu:

- Dữ liệu **MySQL** → import vào MySQL.
- Dữ liệu **MongoDB** → import vào MongoDB.
- Dữ liệu **ChromaDB** → import vào ChromaDB.

> **Lưu ý:** Chỉ thực hiện import dữ liệu sau khi các container MySQL, MongoDB và ChromaDB đã chạy thành công.

Sau khi import hoàn tất, hệ thống sẽ sử dụng dữ liệu này để phục vụ các chức năng quản lý, thống kê, thu thập dữ liệu và hỏi đáp thông tin học phần.

---

## 7. Xem log

### Toàn bộ hệ thống

```bash
docker compose logs -f
```

### Crawler Service

```bash
docker compose logs -f hust-assistant-crawler-service
```

### Report Service

```bash
docker compose logs -f hust-assistant-report-service
```

### Chat Service

```bash
docker compose logs -f hust-assistant-chat-service
```

### Eureka Server

```bash
docker compose logs -f hust-assistant-eureka-server
```

### Cloud Gateway

```bash
docker compose logs -f hust-assistant-cloud-gateway
```

Nhấn `Ctrl + C` để thoát chế độ theo dõi log.

---

## 8. Build lại riêng một service

Khi chỉ thay đổi source code của một service, không cần build lại toàn bộ hệ thống.

### Crawler Service

```bash
docker compose up -d --build hust-assistant-crawler-service
```

### Report Service

```bash
docker compose up -d --build hust-assistant-report-service
```

### User Service

```bash
docker compose up -d --build hust-assistant-user-service
```

### Chat Service

```bash
docker compose up -d --build hust-assistant-chat-service
```

### Chat App

```bash
docker compose up -d --build hust-assistant-chat-app
```

---

## 9. Địa chỉ truy cập

Sau khi hệ thống khởi động thành công:

| Thành phần                | Địa chỉ                 |
| ------------------------- | ----------------------- |
| Eureka Dashboard          | `http://localhost:8671` |
| API Gateway               | `http://localhost:9898` |
| Chat App                  | `http://localhost:5173` |
| Chat Service              | `http://localhost:1923` |
| Crawler JobRunr Dashboard | `http://localhost:8101` |
| ChromaDB                  | `http://localhost:8000` |
| MySQL                     | `localhost:3307`        |
| MongoDB                   | `localhost:27018`       |

---

## 10. Dừng hệ thống

Dừng toàn bộ container:

```bash
docker compose down
```

Lệnh này chỉ dừng và xóa container/network được tạo bởi Docker Compose.

**Dữ liệu trong Docker Volume vẫn được giữ lại.**

---

## 11. Xóa toàn bộ container và database local

Nếu muốn xóa cả container và dữ liệu đang được lưu trong Docker Volume:

```bash
docker compose down -v
```

> ⚠️ **Cảnh báo:** Lệnh trên sẽ xóa dữ liệu MySQL, MongoDB và ChromaDB đang được lưu trong Docker Volume.

Không sử dụng `-v` nếu muốn giữ lại dữ liệu.

---

## 12. Khởi động lại hệ thống

Nếu các Docker image đã được build trước đó:

```bash
docker compose up -d
```

Nếu source code có thay đổi:

```bash
docker compose up -d --build
```

Kiểm tra lại trạng thái:

```bash
docker compose ps
```

---

## 13. Giao tiếp giữa các container

Các container giao tiếp với nhau thông qua Docker Network.

> **Không sử dụng `localhost` để một container gọi sang container khác.**

Các hostname được sử dụng trong hệ thống:

```text
hust-assistant-eureka-server
hust-assistant-mysql-container
hust-assistant-mongodb-container
hust-assistant-chroma-db-container
hust-assistant-chat-session-service
```

### MySQL

Kết nối từ bên trong Docker:

```text
jdbc:mysql://hust-assistant-mysql-container:3306/hust_assistant
```

Kết nối từ máy local:

```text
localhost:3307
```

### MongoDB

Kết nối từ bên trong Docker:

```text
hust-assistant-mongodb-container:27017
```

Kết nối từ máy local:

```text
localhost:27018
```

### Eureka Server

```text
http://hust-assistant-eureka-server:8671/eureka/
```

### ChromaDB

```text
hust-assistant-chroma-db-container:8000
```

Từ máy local:

```text
http://localhost:8000
```

---

## 14. Trình tự chạy khuyến nghị

### Bước 1 — Build hệ thống

```bash
docker compose build
```

### Bước 2 — Khởi động hệ thống

```bash
docker compose up -d
```

### Bước 3 — Kiểm tra container

```bash
docker compose ps
```

Đảm bảo các container cần thiết đều đã chạy.

### Bước 4 — Import dữ liệu

Import dữ liệu MySQL, MongoDB và ChromaDB tương ứng từ:

```text
database/
```

### Bước 5 — Kiểm tra Eureka

Mở:

```text
http://localhost:8671
```

Kiểm tra các microservice đã đăng ký thành công với Eureka Server.

### Bước 6 — Truy cập ứng dụng

Mở:

```text
http://localhost:5173
```

### Bước 7 — Kiểm tra log nếu có lỗi

```bash
docker compose logs -f
```

---

## 15. Một số lệnh Docker thường dùng

Xem container đang chạy:

```bash
docker ps
```

Xem tất cả container:

```bash
docker ps -a
```

Xem Docker Volume:

```bash
docker volume ls
```

Xem Docker image:

```bash
docker images
```

Restart toàn bộ hệ thống:

```bash
docker compose restart
```

Restart một service:

```bash
docker compose restart <service-name>
```

Xem log một service:

```bash
docker compose logs -f <service-name>
```

Dừng hệ thống nhưng giữ dữ liệu:

```bash
docker compose down
```

Dừng hệ thống và xóa cả dữ liệu:

```bash
docker compose down -v
```

---

## 16. Xử lý lỗi

Nếu một service không chạy, kiểm tra trạng thái:

```bash
docker compose ps
```

Sau đó kiểm tra log của service:

```bash
docker compose logs -f <service-name>
```

Nếu cần build lại service:

```bash
docker compose up -d --build <service-name>
```

Nếu muốn build lại hoàn toàn:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Sau khi khởi động lại, kiểm tra:

```bash
docker compose ps
```

và:

```bash
docker compose logs -f
```

---

## 17. Yêu cầu môi trường

Máy chạy hệ thống cần cài đặt:

- Docker
- Docker Compose
- Git

Kiểm tra Docker:

```bash
docker --version
```

Kiểm tra Docker Compose:

```bash
docker compose version
```

Sau khi Docker hoạt động bình thường, có thể triển khai toàn bộ hệ thống thông qua file `docker-compose.yml`.
