# Hospital Booking System — Backend API

A production-ready REST API for hospital appointment booking built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas cloud)
- **Auth:** JWT + bcrypt
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

## Getting Started

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd hospital-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URL and JWT secret

# 4. Run in development
npm run dev

# 5. Run in production
npm start
```

## API Endpoints

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/register-doctor | Public |
| POST | /api/auth/login | Public |

### Users
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/users/profile | Authenticated |
| PATCH | /api/users/profile | Authenticated |
| GET | /api/users | Admin |
| DELETE | /api/users/:id | Admin |

### Doctors
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/doctors | Public |
| GET | /api/doctors/:id | Public |
| POST | /api/doctors | Admin |
| PATCH | /api/doctors/:id | Admin |
| DELETE | /api/doctors/:id | Admin |

### Appointments
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/appointments | Patient |
| GET | /api/appointments | Authenticated |
| GET | /api/appointments/:id | Authenticated |
| PATCH | /api/appointments/:id/status | Doctor/Admin |
| DELETE | /api/appointments/:id | Patient/Admin |

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 8000) |
| NODE_ENV | development or production |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRES_IN | Token expiry (e.g., 7d) |

## Security Features

- Password hashing (bcrypt, 10 salt rounds)
- JWT authentication
- Role-based access control (PATIENT, DOCTOR, ADMIN)
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Helmet security headers
- CORS configured
- Input validation (Joi schemas)
- No password in API responses

## Deployment

Deploy to Render.com (free):
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
