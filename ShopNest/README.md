# ShopNest — Full Stack E-Commerce

Django (Python) backend + Vanilla JS frontend | CodeAlpha Internship Task 1

## Project Structure

```
shopnest/
│
├── backend/                        ← Django project
│   ├── manage.py                   ← Django CLI entry point
│   ├── requirements.txt
│   ├── seed_data.py                ← Populate DB with demo products
│   │
│   ├── shopnest/                   ← Django project config
│   │   ├── settings.py             ← Database, CORS, DRF config
│   │   ├── urls.py                 ← Root URL routing
│   │   └── wsgi.py
│   │
│   ├── products/                   ← Products Django app
│   │   ├── models.py               ← Product, Category models
│   │   ├── serializers.py          ← DRF serializers (model → JSON)
│   │   ├── views.py                ← API view functions
│   │   ├── urls.py                 ← /api/products/ routes
│   │   └── admin.py                ← Django admin config
│   │
│   ├── users/                      ← Auth Django app
│   │   ├── serializers.py          ← RegisterSerializer, UserSerializer
│   │   ├── views.py                ← register, login, logout, me
│   │   └── urls.py                 ← /api/users/ routes
│   │
│   └── orders/                     ← Orders Django app
│       ├── models.py               ← Order, OrderItem models
│       ├── serializers.py          ← OrderSerializer
│       ├── views.py                ← list/create/detail orders
│       └── urls.py                 ← /api/orders/ routes
│
└── frontend/                       ← Pure HTML/CSS/JS (no framework)
    ├── index.html                  ← Single HTML file (all pages/sections)
    ├── css/
    │   └── style.css               ← All styles (variables, layout, components)
    └── js/
        ├── app.js                  ← ENTRY POINT: routing, event binding, state
        ├── api.js                  ← All fetch() calls to Django REST API
        ├── cart.js                 ← Cart data logic (localStorage)
        ├── ui.js                   ← DOM rendering helpers (no API calls)
        └── auth.js                 ← Login/register/logout form logic
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/products/ | List products (?category= &search=) |
| GET | /api/products/<id>/ | Single product detail |
| GET | /api/products/categories/ | All categories |
| POST | /api/users/register/ | Create account |
| POST | /api/users/login/ | Sign in |
| POST | /api/users/logout/ | Sign out |
| GET | /api/users/me/ | Current user info |
| GET | /api/orders/ | User's order history |
| POST | /api/orders/ | Place a new order |

## Setup & Run

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python seed_data.py          # populates products + admin user
python manage.py runserver   # starts on http://127.0.0.1:8000
```

Admin panel: http://127.0.0.1:8000/admin  
Login: admin / admin1234

### 2. Frontend
Open `frontend/index.html` in a browser via a local server:
```bash
# Option A — Python (simplest)
cd frontend
python -m http.server 5500
# Open: http://localhost:5500

# Option B — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

> **Important**: Open via http://localhost (not file://) so ES6 modules and
> CORS cookies work correctly.

## How Frontend ↔ Backend Connect

1. `app.js` boots → calls `api.js` functions
2. `api.js` sends `fetch()` to `http://127.0.0.1:8000/api/...` with `credentials:'include'`
3. Django CORS headers allow the request (CORS_ALLOW_ALL_ORIGINS = True in dev)
4. Django session cookie is returned and stored in the browser
5. All subsequent auth-protected requests send the cookie automatically

## Demo Account
- Superuser: admin / admin1234 (Django admin only)
- Create a regular account via the Sign In → Create Account tab in the frontend
