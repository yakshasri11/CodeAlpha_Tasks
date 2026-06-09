# ShopNest — Quick Start Guide

## ✅ Fixed Issues Summary

| # | Issue | Status |
|---|-------|--------|
| 1 | Homepage shows directory listing | ✅ Fixed — use the startup scripts below |
| 2 | Login lost on page refresh | ✅ Fixed — localStorage persistence + /me/ validation |
| 3 | Seller registration flow | ✅ Working — pending → admin approve → dashboard |
| 4 | Checkout: no address/payment step | ✅ Fixed — full address → UPI/COD → success flow |
| 5 | Backend URL mismatches | ✅ Fixed — all endpoints aligned |
| 6 | Dead code files | ✅ Removed (frontend/js/, frontend/pages/) |
| 7 | Missing admin endpoints | ✅ Added (admin/all/, admin/toggle/) |
| 8 | Order model missing address/payment | ✅ Added + migration applied |

---

## 🚀 How to Run

### Step 1 — Start the Backend (Terminal 1)

**Linux / macOS:**
```bash
cd shopnest_fixed
./start_backend.sh
```

**Windows:**
```
Double-click start_backend.bat
```

Backend URL: http://127.0.0.1:8000

---

### Step 2 — Start the Frontend (Terminal 2)

**Linux / macOS:**
```bash
cd shopnest_fixed
./start_frontend.sh
```

**Windows:**
```
Double-click start_frontend.bat
```

Frontend URL: **http://localhost:5500**

> ⚠️ Do NOT use VS Code Live Server — it serves from the wrong directory.
> Always use the startup scripts which correctly serve from frontend/.

---

## 🔑 Admin Login

```
URL:      http://127.0.0.1:8000/admin/
Username: admin
Password: admin123
```

*(Check db.sqlite3 — or run `python manage.py createsuperuser` to create one)*

---

## 🗺️ Feature Map

| Feature | How to access |
|---------|---------------|
| Browse products | Homepage → product grid |
| Search | Nav search bar |
| Filter by category | Category chips below hero |
| Product detail | Click any product card |
| Add to cart | "+" button on card or detail page |
| Checkout | Cart → Checkout → Address → Payment |
| UPI payment | Payment page → select UPI → enter UPI ID → Place Order |
| COD payment | Payment page → select COD (default) → Place Order |
| Register as buyer | Sign In → Create Account → "Buy products" |
| Register as seller | Sign In → Create Account → "Sell on ShopNest" |
| Seller dashboard | Approve seller first → Seller Dashboard link in nav |
| Admin dashboard | Admin Dashboard link in nav (admin users only) |
| Approve sellers | Admin Dashboard → Seller Applications tab |
| Manage products | Admin Dashboard → Pending Products / All Products tabs |

---

## 📁 Clean Project Structure

```
shopnest_fixed/
├── frontend/
│   ├── index.html          ← Single-page app (all HTML + CSS + JS)
│   └── css/
│       └── style.css       ← Additional styles
├── backend/
│   ├── manage.py
│   ├── db.sqlite3          ← SQLite database (seed data included)
│   ├── requirements.txt
│   ├── shopnest/           ← Django project config
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/              ← Auth, seller registration, admin user mgmt
│   ├── products/           ← Product CRUD, categories, admin approval
│   └── orders/             ← Order placement with address + payment
├── start_backend.sh / .bat
└── start_frontend.sh / .bat
```

---

## 🔗 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/products/ | List live products |
| GET | /api/products/categories/ | List categories |
| POST | /api/users/register/ | Register buyer or seller |
| POST | /api/users/login/ | Login |
| POST | /api/users/logout/ | Logout |
| GET | /api/users/me/ | Current user info |
| POST | /api/orders/ | Place order |
| GET | /api/products/seller/my/ | Seller's products |
| POST | /api/products/seller/my/ | Create product |
| GET | /api/users/seller-applications/ | Admin: list applications |
| POST | /api/users/seller-applications/{id}/review/ | Admin: approve/reject |
| GET | /api/products/admin/stats/ | Admin: dashboard stats |
| GET | /api/products/admin/all/ | Admin: all products |
| GET | /api/products/admin/pending/ | Admin: pending products |
