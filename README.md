# FitMeal

FitMeal is a full-stack nutrition and meal-planning application. It combines a React dashboard with a Spring Boot API, PostgreSQL persistence, JWT authentication, user-scoped data, progress analytics, and optional Groq-backed AI features.

## Features

- Secure user registration and login
- JWT authentication with BCrypt password hashing
- Registration, login, email-verification, and forgot/reset-password API flows
- Multi-user isolated meals, grocery items, meal plans, weight entries, and profile data
- Meal CRUD with search and meal-type filtering
- Editable grocery list with purchased tracking
- Editable weekly meal planner
- AI weekly planner generation and save-to-planner workflow
- AI meal recommendations powered by Groq with safe fallback responses
- AI Nutrition Coach chat with local conversation persistence
- AI Food Image Analyzer with nutrition estimates and save-as-meal workflow
- Profile and nutrition goals with BMI, calorie, protein, and water calculations
- Progress Analytics dashboard with Recharts weight and nutrition trends
- Responsive FitMeal green/white UI

## Architecture

```text
React + Vite Frontend
        |
        | REST API + JWT Bearer token
        v
Spring Boot Backend
        |
        | Spring Data JPA / Hibernate
        v
PostgreSQL

Spring Boot Backend
        |
        | Groq API with fallback behavior
        v
AI recommendations, coach chat, and food image analysis
```

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML/CSS
- Recharts
- LocalStorage for JWT/user session restoration

### Backend

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- BCrypt
- JWT
- Maven Wrapper

### AI

- Groq Chat Completions API
- Text model: `llama-3.1-8b-instant`
- Vision model default: `meta-llama/llama-4-scout-17b-16e-instruct`
- Safe fallback responses when Groq is unavailable or not configured

## Project Structure

```text
fitmeal/
|-- backend/               Spring Boot API, persistence, security, and tests
|-- frontend/              React + Vite application
|-- .gitignore
`-- README.md
```

## Backend API Summary

Base URL for local development:

```text
http://localhost:8080
```

### Public Auth APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/verify-email?token=TOKEN` | Email verification foundation |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/hello` | Public health/test endpoint |

### Protected APIs

All protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

| Resource | Endpoints |
|---|---|
| Meals | `GET/POST /api/meals`, `GET/PUT/DELETE /api/meals/{id}`, `GET /api/meals/type/{mealType}` |
| Grocery | `GET/POST /api/grocery-list`, `PUT/DELETE /api/grocery-list/{id}`, `PATCH /api/grocery-list/{id}/toggle` |
| Meal Plans | `GET/POST /api/meal-plans`, `PUT/DELETE /api/meal-plans/{id}` |
| Profile | `GET/POST /api/profile/me` |
| Weight Entries | `GET/POST /api/weight-entries`, `PUT/DELETE /api/weight-entries/{id}` |
| AI Recommendations | `POST /api/ai/recommendations` |
| AI Coach | `POST /api/ai/coach` |
| Food Analyzer | `POST /api/ai/analyze-food` |

## Security

- Passwords are hashed with BCrypt.
- JWT tokens protect application APIs.
- Frontend stores the active token as `fitMealToken` and user info as `fitMealUser`.
- Backend determines ownership from Spring Security authentication, not from frontend request bodies.
- Meals, grocery items, meal plans, weight entries, and profile data are user-scoped.
- Users cannot read, update, or delete another user's scoped records through the service layer.
- Global error handling returns clean JSON messages instead of stack traces.
- No real secrets should be committed. Use environment variables for credentials and API keys.

## Multi-User Isolation

FitMeal uses authenticated user ownership for user-created data.

- `Meal`, `GroceryItem`, and `MealPlan` use an `AppUser` owner relationship.
- `WeightEntry` is scoped by authenticated user email.
- Controllers read the authenticated principal from Spring Security.
- Frontend requests do not send `userId`, owner email, or ownership fields.
- Existing global rows with no owner are hidden from authenticated users until migrated.

Optional local migration for old rows:

```sql
UPDATE meals SET owner_id = (SELECT id FROM users WHERE email = 'your@email.com') WHERE owner_id IS NULL;
UPDATE grocery_items SET owner_id = (SELECT id FROM users WHERE email = 'your@email.com') WHERE owner_id IS NULL;
UPDATE meal_plans SET owner_id = (SELECT id FROM users WHERE email = 'your@email.com') WHERE owner_id IS NULL;
```

## AI Features

- AI Meal Recommendations generate meals from goal, calories, and protein target.
- AI Weekly Planner formats AI recommendations into a seven-day plan and saves it to the user's planner.
- AI Coach answers nutrition questions using profile context and recent chat history.
- Food Image Analyzer accepts JPG/JPEG/PNG uploads and estimates nutrition from food images.
- Groq failures or missing API keys return safe fallback responses so the app keeps working.

## Environment Variables

Do not commit real `.env` files. Commit only `.env.example`.

### Backend `.env.example`

```env
DB_URL=jdbc:postgresql://localhost:5432/mealmate_db
DB_USERNAME=postgres
DB_PASSWORD=change_me
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

Create a private local configuration from the template:

```powershell
cd backend
Copy-Item .env.example .env
```

Replace `DB_PASSWORD` and `JWT_SECRET` in `backend/.env`. Add `GROQ_API_KEY` only when testing the AI-backed responses. The backend reads this local file during startup; `.env` is ignored by Git.

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:8080
```

To override the frontend API URL, copy the template to `frontend/.env` and edit the value. The frontend defaults to `http://localhost:8080` when the variable is not set.

## Local Setup

### Prerequisites

- Java 21
- Node.js 20+ and npm
- PostgreSQL
- Maven Wrapper included with backend

### Database

Create the local database:

```sql
CREATE DATABASE mealmate_db;
```

Configure `backend/.env` from the template as described above. PostgreSQL must be reachable using the configured URL, username, and password.

### Run Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:8080
```

## Verification Commands

Backend:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd -DskipTests package
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Screenshots

No application screenshots are currently checked into the repository. Useful screens to capture later are:

- Login and registration
- Dashboard analytics
- Meal, grocery-list, and weekly-planner workflows
- Profile and nutrition goals
- AI recommendations and AI Coach
- Food Analyzer
- Progress analytics

Store future captures under `docs/screenshots/` and reference only screenshots taken from the working application.

## Deployment Status

This repository does not currently include production deployment manifests or a hosted environment. A deployment would need separate frontend and backend hosting, managed PostgreSQL, production environment variables, production CORS configuration, and HTTPS.

## Development Notes

- New users are automatically marked verified for local development. The verification endpoint remains available, but real email delivery is not configured.
- Forgot/reset-password endpoints exist, but reset email delivery still requires an email provider.
- Hibernate currently uses `ddl-auto=update`; versioned database migrations are not configured.
- Backend CORS permits the local Vite origins `http://localhost:5173` and `http://localhost:5174`.
- The browser stores the JWT in `localStorage`; refresh tokens are not implemented.
- Groq is optional. Recommendation services use fallback behavior when the API key or model response is unavailable.

## GitHub Safety Checklist

- `.env` files are ignored.
- `target/`, `node_modules/`, and `dist/` are ignored.
- Real `GROQ_API_KEY`, `DB_PASSWORD`, and `JWT_SECRET` values should not be committed.
- `.env.example` files are committed as templates only.
- README is safe to publish and contains no real credentials.

## Future Improvements

- Add refresh tokens
- Add real email delivery with SendGrid, Resend, or SMTP
- Add OpenAPI/Swagger documentation
- Add Flyway/Liquibase migrations
- Add Docker Compose for local full-stack startup
- Add role-based admin screens
- Add more controller-level integration tests
- Add deployment-specific CORS profiles

## Resume-Friendly Summary

FitMeal AI is a full-stack health-tech application built with React, Vite, Spring Boot, PostgreSQL, Spring Security, JWT, BCrypt, Recharts, and Groq AI. It supports secure multi-user meal tracking, grocery management, weekly planning, profile goals, progress analytics, AI meal recommendations, AI nutrition coaching, and AI food image analysis. The project demonstrates REST API design, authentication, database modeling, user-owned data isolation, AI integration, responsive UI engineering, and production-readiness practices.
