# 🚗 Car Service Manager

A full-stack web application for tracking car maintenance, service records, and reminders. Built with **Laravel 10** (API) and **React 19** (SPA).

## ✨ Features

- **Car Management** — Add, edit, delete cars with details (brand, model, year, mileage, plate, color)
- **Service Records** — Track maintenance history with cost, provider, notes, and receipt photos
- **Reminders** — Auto-created reminders for upcoming/overdue services
- **Dashboard** — Charts (monthly spending, services by type), stats, and CSV export
- **Dark Mode** — Toggle with persistent preference
- **Multi-Language** — English + Arabic with RTL support
- **PWA** — Installable as a mobile app
- **Notifications** — Browser notifications + email alerts for overdue services
- **Search & Pagination** — Filter and paginate all data
- **Secure Auth** — Registration, login, password reset, rate limiting

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 10, Sanctum |
| Frontend | React 19, Recharts, Lucide Icons |
| Database | MySQL |
| Auth | Token-based (Sanctum) |
| Styling | TailwindCSS v4 |

## 🚀 Setup

### Prerequisites
- PHP 8.1+, Composer, Node.js 18+, MySQL

### Backend
```bash
cd car_service
composer install
cp .env.example .env
php artisan key:generate
# Configure database in .env
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend
```bash
cd car-service-frontend
npm install
# Set API URL in .env (optional)
# REACT_APP_API_URL=http://localhost:8000/api
npm start
```

### Build for Production
```bash
cd car-service-frontend
npm run build
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_URL` | Backend URL | `http://localhost:8000` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `REACT_APP_API_URL` | API base URL (frontend) | `http://localhost:8000/api` |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register (rate limited: 3/5min) |
| POST | `/api/login` | Login (rate limited: 5/min) |
| POST | `/api/logout` | Logout |
| GET | `/api/user` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/password` | Change password |

### Cars
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cars` | List (search, paginate) |
| POST | `/api/cars` | Create |
| GET | `/api/cars/{id}` | Show |
| PUT | `/api/cars/{id}` | Update |
| DELETE | `/api/cars/{id}` | Delete |
| GET | `/api/cars/{id}/stats` | Car statistics |

### Service Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-records` | List (filter by car, type, date) |
| POST | `/api/service-records` | Create (supports image upload) |
| GET | `/api/service-records/{id}` | Show |
| PUT | `/api/service-records/{id}` | Update |
| DELETE | `/api/service-records/{id}` | Delete |

### Reminders & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List pending |
| GET | `/api/reminders/overdue` | List overdue |
| PUT | `/api/reminders/{id}` | Update status |
| GET | `/api/dashboard/charts` | Chart data |
| GET | `/api/service-records/export/csv` | Export CSV |

## 🧪 Testing

```bash
php artisan test
# 28 tests, 45 assertions
```

## 📋 Scheduled Commands

```bash
# Check overdue reminders (runs daily at 8am)
php artisan reminders:check

# Run scheduler
php artisan schedule:work
```

## 📄 License

MIT
