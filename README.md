# FastAPI Product Frontend

A responsive frontend application built with **React** and **TypeScript**, following a Clean Architecture-inspired structure.

The project provides authentication, role-based authorization, product and stock management, tag management, profile management, activity logs, user administration, and analytics screens for the FastAPI Product API.

## Tech Stack

- React
- TypeScript
- Vite
- Ant Design
- React Router
- Oxlint

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

`VITE_API_BASE_URL` must point to the running FastAPI backend.

## Backend Requirement

Start the backend project before running the frontend. By default, the frontend expects the API at:

```text
http://localhost:8000
```

The backend Swagger UI is available at:

```text
http://localhost:8000/docs
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Lint

Run the linter:

```bash
npm run lint
```

## Application Routes

- `/login` — Login and registration
- `/products` — Product and stock management
- `/profile` — Current user profile
- `/activity-logs` — Activity history
- `/analytics` — User analytics
- `/tags` — Tag management for administrators
- `/users` — User management for administrators
- `/profiles/:userPublicId` — User profile management for administrators

## Project Structure

```text
src/
├── application/      # Use cases and application ports
├── domain/           # Entities and repository contracts
├── infrastructure/   # HTTP repositories, storage and service composition
└── presentation/     # Pages, components, layouts and routing
```

Authentication tokens are stored in browser local storage. Current-user display and role information are stored in session storage. API requests use the backend response contracts and automatically attempt access-token renewal when required.
