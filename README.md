# KAFE - Multi Server POS System (Fullstack)

Sistem Point of Sale (POS) berbasis web untuk multi-outlet kafe dengan fitur manajemen pesanan, stok, dan laporan.

## Features

✅ **Multi-Server Support** - Kelola beberapa kafe sekaligus
✅ **PIN-based Authentication** - Sekali pakai OTP untuk setiap user
✅ **Real-time Updates** - Socket.IO untuk notifikasi real-time
✅ **FIFO Stok Management** - Batch masuk paling lama dikurangi duluan
✅ **Order Tracking** - Dapur → Antar → Kasir → Selesai
✅ **Payment Processing** - Hitung kembalian, cetak struk
✅ **Chat System** - Komunikasi internal antar staff
✅ **Reporting** - Laporan omzet dan statistik
✅ **User Roles** - Waiter, Dapur, Kasir, Owner, Developer

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- Socket.IO (real-time)
- JWT (authentication)

**Frontend:**
- React (coming soon)
- TailwindCSS
- Socket.IO Client

## Setup

### Prerequisites
- Node.js v14+
- MongoDB

### Installation

```bash
# Clone repo
git clone https://github.com/mrsalt227-ui/kafe-multi-pos.git
cd kafe-multi-pos

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env dengan konfigurasi Anda
# DATABASE_URL=mongodb://localhost:27017/kafe-pos
# PORT=5000
# DEV_PIN=181920
```

### Run Backend

```bash
npm run dev  # Development (dengan nodemon)
npm start    # Production
```

### Run Frontend (Soon)

```bash
cd client
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login dengan PIN
- `POST /api/auth/dev-login` - Login Developer

### Servers
- `GET /api/servers` - Daftar semua server
- `POST /api/servers` - Buat server baru
- `PUT /api/servers/:serverId/change-id` - Ganti ID kafe

### Menu
- `GET /api/menu/:serverId` - Daftar menu
- `POST /api/menu/:serverId` - Tambah menu
- `DELETE /api/menu/:serverId/:menuId` - Hapus menu

### Stok
- `GET /api/stok/:serverId` - Lihat stok (FIFO)
- `POST /api/stok/:serverId/add` - Tambah stok batch
- `POST /api/stok/:serverId/deduct` - Kurangi stok (FIFO)
- `DELETE /api/stok/:serverId` - Reset stok

### Orders
- `GET /api/orders/:serverId` - Daftar pesanan
- `POST /api/orders/:serverId/create` - Buat pesanan
- `PUT /api/orders/:serverId/:orderId` - Update status
- `POST /api/orders/:serverId/:orderId/pay` - Bayar pesanan

### Laporan
- `GET /api/laporan/:serverId` - Lihat laporan
- `POST /api/laporan/:serverId` - Simpan laporan
- `DELETE /api/laporan/:serverId` - Reset laporan

### Pins
- `GET /api/pins/:serverId` - Daftar PIN
- `POST /api/pins/:serverId/generate` - Generate PIN role
- `DELETE /api/pins/:serverId/:pinId` - Revoke PIN

### Chat
- `GET /api/chat/:serverId` - Lihat chat
- `POST /api/chat/:serverId/send` - Kirim chat
- `DELETE /api/chat/:serverId` - Clear chat

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kafe-pos
DEV_PIN=181920
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## Default Dev PIN

```
181920
```

## License

MIT
