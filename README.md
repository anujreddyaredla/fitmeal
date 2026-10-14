# FitMeal AI

FitMeal AI is a full-stack nutrition and meal-planning application built with React and Spring Boot. It combines personal meal tracking, a searchable healthy-recipe catalog, weekly planning, grocery management, nutrition goals, progress analytics, and optional Groq-powered AI tools in a JWT-protected, multi-user application.

> **Deployment status:** local development only. This repository does not currently include a hosted environment or production deployment configuration.

## Verified Features

### Meals and recipes

- Create, view, edit, delete, search, and filter personal meals.
- Browse a seeded catalog of 24 healthy meals across Breakfast, Lunch, Snack, and Dinner.
- Search catalog meals by name and filter them by category.
- Open recipe pages with local meal photography, nutrition estimates, ingredients, equipment, preparation time, and beginner-friendly cooking steps.
- Add a catalog recipe directly to a selected day and meal slot in the weekly planner.
- Create custom planner entries when a suitable catalog meal is not available.

### Planning and tracking

- Manage a Monday-to-Sunday meal plan with breakfast, lunch, dinner, and snack slots.
- Maintain a categorized grocery list with add, edit, delete, and purchased-toggle actions.
- Save profile measurements and fitness goals.
- Calculate estimated calorie, protein, water, and BMI targets in the frontend.
- Track weight entries and view weight and seven-day nutrition trends with Recharts.
- View dashboard summaries for calories, protein, meals, hydration goals, planned meals, and goal completion.

### AI tools

- Generate meal recommendations from a fitness goal, calorie target, and protein target.
- Format recommendations into a seven-day AI planner and save the generated days to the planner.
- Chat with an AI nutrition coach using profile context and recent conversation history.
- Upload JPG, JPEG, or PNG food images for estimated calories, protein, carbohydrates, fat, serving size, confidence, tips, and alternatives.
- Save an analyzed food result as a personal meal.
- Continue using built-in fallback responses when Groq is not configured or a supported AI request fails.

### Authentication and data isolation

- Register and log in with BCrypt-hashed passwords.
- Authenticate protected API calls with a signed, 24-hour JWT Bearer token.
- Restore the frontend session from browser local storage and log out automatically after unauthorized protected requests.
- Keep meals, grocery items, meal plans, profiles, and weight entries scoped to the authenticated user.
- Provide email-verification and forgot/reset-password API foundations. Local registration currently auto-verifies users; outbound email delivery is not implemented.

## Architecture

```text
React 19 + Vite 8
        |
        | REST/JSON + JWT Bearer token
        v
Spring Boot 4 / Spring Security
        |
        | Spring Data JPA / Hibernate
        v
PostgreSQL

Spring Boot AI services ---> Groq Chat Completions API
                         `-> local fallback responses
```

The frontend uses React Router for authenticated client-side pages. The backend uses controllers, services, repositories, and JPA entities under the `com.fitmeal.backend` namespace. Spring Security derives the current user from the JWT rather than trusting ownership information from request bodies.

## Tech Stack

### Frontend

- React 19
- React Router 7
- Vite 8
- JavaScript, HTML, and CSS
- Recharts 3
- Browser `localStorage` for session restoration and AI Coach conversation persistence

### Backend

- Java 21
- Spring Boot 4.0.6
- Spring Web MVC
- Spring Security
- Spring Data JPA and Hibernate
- Jakarta Bean Validation
- PostgreSQL in local development
- H2 for automated tests
- BCrypt password hashing
- HMAC-SHA256 JWT signing
- Maven Wrapper

### AI integration

- Groq Chat Completions API
- Configurable text and vision model names
- JSON response parsing with safe fallback behavior

## Project Structure

```text
fitmeal/
|-- backend/
|   |-- src/main/java/com/fitmeal/backend/
|   |   |-- config/         Spring Security and JWT filter
|   |   |-- controller/     REST controllers and error handling
|   |   |-- dto/            Catalog response/request DTOs
|   |   |-- model/          JPA entities and API request/response models
|   |   |-- repository/     Spring Data JPA repositories
|   |   `-- service/        Business, authentication, catalog, and AI services
|   |-- src/main/resources/
|   |   |-- catalog/        Seeded meal-catalog JSON
|   |   `-- application.properties
|   |-- src/test/           Integration, security, catalog, and isolation tests
|   |-- .env.example
|   `-- pom.xml
|-- frontend/
|   |-- public/images/      FitMeal branding and 24 local recipe images
|   |-- src/
|   |   |-- api/            Focused API helpers
|   |   |-- components/     Shared UI and analytics components
|   |   |-- hooks/          Catalog data hooks
|   |   `-- pages/          Routed application pages
|   |-- .env.example
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Frontend Pages

Authenticated users can access these routes:

| Route | Purpose |
|---|---|
| `/dashboard` | Daily summaries, goals, weight entries, and nutrition charts |
| `/profile` | Profile measurements and nutrition goals |
| `/meal-library` | Searchable and categorized recipe catalog |
| `/meal-library/:slug` | Recipe nutrition, ingredients, equipment, steps, and planner action |
| `/meals` | Personal meal CRUD and filtering |
| `/planner` | Catalog-based and custom weekly meal planning |
| `/ai-picks` | AI meal recommendations |
| `/ai-planner` | AI-generated seven-day meal plan |
| `/ai-coach` | Conversational nutrition coach |
| `/food-analyzer` | Food-image nutrition analysis and save-as-meal workflow |
| `/grocery` | Grocery CRUD, categories, purchase status, and progress |

When no valid local user/token session exists, the application renders its login, registration, verification, forgot-password, and reset-password screens instead of the authenticated navigation.

## API Overview

Local backend base URL: `http://localhost:8080`

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Public endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/auth/verify-email?token={token}` | Verify an email token |
| `POST` | `/api/auth/forgot-password` | Create reset instructions when an account exists |
| `POST` | `/api/auth/reset-password` | Replace a password using a valid, unexpired reset token |
| `GET` | `/api/hello` | Basic public application response |

### Protected endpoints

| Area | Method | Endpoint | Purpose |
|---|---|---|---|
| Meal catalog | `GET` | `/api/catalog/meals` | List catalog meals; supports `category`, `search`, `page`, `size`, and `sort` |
| Meal catalog | `GET` | `/api/catalog/meals/{slug}` | Get full recipe details |
| Personal meals | `GET`, `POST` | `/api/meals` | List or create the current user's meals |
| Personal meals | `GET`, `PUT`, `DELETE` | `/api/meals/{id}` | Read, update, or delete an owned meal |
| Personal meals | `GET` | `/api/meals/type/{mealType}` | Filter owned meals by type, ignoring case |
| Meal plans | `GET`, `POST` | `/api/meal-plans` | List or create weekly plan records |
| Meal plans | `POST` | `/api/meal-plans/catalog` | Add a catalog meal to a day and meal slot |
| Meal plans | `PUT`, `DELETE` | `/api/meal-plans/{id}` | Update or delete an owned plan |
| Grocery list | `GET`, `POST` | `/api/grocery-list` | List or create grocery items |
| Grocery list | `PUT`, `DELETE` | `/api/grocery-list/{id}` | Update or delete an owned grocery item |
| Grocery list | `PATCH` | `/api/grocery-list/{id}/toggle` | Toggle purchased status |
| Profile | `GET`, `POST` | `/api/profile/me` | Read or save the authenticated user's profile |
| Weight tracking | `GET`, `POST` | `/api/weight-entries` | List or create weight entries |
| Weight tracking | `PUT`, `DELETE` | `/api/weight-entries/{id}` | Update or delete an owned weight entry |
| AI recommendations | `POST` | `/api/ai/recommendations` | Generate goal-based meal recommendations |
| AI Coach | `POST` | `/api/ai/coach` | Send a profile-aware nutrition conversation request |
| Food analysis | `POST` | `/api/ai/analyze-food` | Analyze multipart form field `image` |

## Prerequisites

- Java 21
- Node.js 20 or newer and npm
- PostgreSQL running on the configured host and port
- A PostgreSQL role that can access the application database
- Optional: a Groq API key for live AI responses

No separate Maven installation is required because the Maven Wrapper is included.

## Environment Configuration

Real `.env` files are ignored by Git. Copy the committed examples and replace placeholders locally. Never commit passwords, JWT secrets, tokens, or API keys.

### Backend variables

| Variable | Required | Safe example or placeholder |
|---|---|---|
| `DB_URL` | Yes for the intended database | `jdbc:postgresql://localhost:5432/mealmate_db` |
| `DB_USERNAME` | Yes | `postgres` |
| `DB_PASSWORD` | Yes for PostgreSQL | `<your-local-database-password>` |
| `JWT_SECRET` | Yes; minimum 32 characters | `<generate-a-long-random-secret>` |
| `GROQ_API_KEY` | Only for live Groq calls | `<optional-groq-api-key>` |
| `GROQ_MODEL` | Optional | `<supported-groq-text-model>` |
| `GROQ_VISION_MODEL` | Optional | `<supported-groq-vision-model>` |
| `CATALOG_SEED_ENABLED` | Optional | `true` |

The backend reads `backend/.env` when it starts from the `backend` directory. Operating-system environment variables and Java system properties take precedence over values in that file.

### Frontend variables

| Variable | Required | Safe local value |
|---|---|---|
| `VITE_API_BASE_URL` | Optional | `http://localhost:8080` |

The frontend already defaults to `http://localhost:8080` when `VITE_API_BASE_URL` is absent.

## Local Setup

The following commands use PowerShell from the repository root.

### 1. Create the PostgreSQL database

The checked-in configuration expects the existing local database name `mealmate_db`:

```powershell
psql -U postgres -c "CREATE DATABASE mealmate_db;"
```

If the database already exists, skip this command. A different database is supported by changing `DB_URL` in your private backend environment file.

### 2. Configure and run the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env`, replace the database-password and JWT-secret placeholders, and optionally provide Groq configuration. Then start Spring Boot:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend starts at `http://localhost:8080`. Hibernate uses `ddl-auto=update`, and the catalog seeder loads the 24 catalog recipes when `CATALOG_SEED_ENABLED` is enabled.

### 3. Configure and run the frontend

In a second PowerShell terminal from the repository root:

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

Open `http://localhost:5173`. The backend CORS configuration permits local Vite origins on ports `5173` and `5174`.

## Tests and Builds

### Backend

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```

The test source currently covers application startup, catalog listing/detail behavior, catalog seeding, catalog-to-planner integration, protected-route/profile behavior, and user-data isolation.

### Frontend

```powershell
cd frontend
npm run lint
npm run build
npm run preview
```

The production frontend output is written to `frontend/dist/` and is ignored by Git.

## Security Notes

- Passwords are persisted as BCrypt hashes and are not returned in authentication responses.
- JWTs are signed with `HmacSHA256`, expire after 24 hours, and require a configured secret of at least 32 characters.
- Spring Security is stateless and disables form login and HTTP Basic authentication.
- All application APIs except the documented authentication and hello endpoints require authentication.
- Ownership is resolved from the authenticated principal. Clients do not submit a trusted owner ID or email.
- CORS is currently limited to the two local Vite origins and must be configured separately for deployment.
- The frontend currently stores its JWT in `localStorage`; refresh tokens are not implemented.

## AI Behavior and Limitations

- AI recommendations and AI Coach use the configured Groq text model.
- Food analysis sends supported images to the configured Groq vision model as a data URL.
- AI responses are parsed into application response models; failures return local fallback content instead of crashing the endpoint.
- Nutrition estimates and AI guidance are informational and are not medical advice.
- Without `GROQ_API_KEY`, the application remains usable but returns fallback AI responses.
- Password-reset tokens are stored with a 15-minute expiry, but reset email delivery is not implemented. A real provider such as SendGrid, Resend, or SMTP is still required for a normal end-user reset flow.
- New registrations are automatically marked email-verified for local development. Production should require delivered verification links.

## Screenshots

No screenshots of the running application are currently committed. The recipe and branding files under `frontend/public/images/` are application assets, not UI screenshots.

Recommended future captures, with planned relative locations:

| Screen | Planned path |
|---|---|
| Dashboard and progress analytics | `docs/screenshots/dashboard.png` |
| Meal Library | `docs/screenshots/meal-library.png` |
| Recipe details | `docs/screenshots/recipe-details.png` |
| Weekly planner | `docs/screenshots/planner.png` |
| Grocery list | `docs/screenshots/grocery.png` |
| AI Coach or Food Analyzer | `docs/screenshots/ai-tools.png` |

These are placeholders only; they should be linked or embedded after captures from the working application are added.

## Deployment Status

FitMeal currently runs in local development only. No production host, container definition, reverse proxy, CI/CD pipeline, or managed database deployment is included. A production release would require environment-specific CORS, HTTPS, managed secrets, database migrations, persistent PostgreSQL hosting, frontend/backend hosting, and an email-delivery provider.

## Future Improvements

- Add real verification and password-reset email delivery.
- Replace browser-stored long-lived authentication with access/refresh token rotation and hardened cookie handling.
- Introduce Flyway or Liquibase migrations instead of relying on `ddl-auto=update`.
- Add OpenAPI/Swagger documentation.
- Add frontend component and end-to-end tests.
- Add Docker Compose for reproducible local startup.
- Add deployment profiles, production CORS configuration, and CI checks.
- Capture and publish screenshots from the working application.
