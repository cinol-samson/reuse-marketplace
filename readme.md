# Reuse Marketplace

A desktop-first web application designed for laptop screens (1280-1440 px), connecting community members, makers, artists, and rag pickers to list unused items to **sell, donate, or upcycle**.

## Architecture and Visual System

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + TanStack Query + React Router.
- **Backend**: FastAPI (Python) + SQLAlchemy 2.0 + PostgreSQL.
- **Design aesthetic**: **Wabi-Sabi x Conceptual Sketch** - warm ivory and earthy palette, natural paper textures, restrained borders, Playfair Display + Inter typography, and hand-drawn line-art sketches.
- **Dev style guide**: View the app tokens and reusable components in the placeholder home page and shared styling files.

---

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** and npm
- **Docker and Docker Compose** (for local PostgreSQL)

---

## Quickstart

### 1. Copy environment templates

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 2. Start PostgreSQL services

```powershell
docker compose up -d
```

This starts the main database on port `5432` and the test database on port `5433`.

### 3. Backend setup and run

```powershell
cd backend
python -m venv .venv
# Windows PowerShell:
. .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

# Run the FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000/api/v1`
- Health check: `http://localhost:8000/api/v1/healthz`
- OpenAPI docs: `http://localhost:8000/api/docs`

### 4. Frontend setup and run

```powershell
cd frontend
npm install

# Run the Vite dev server:
npm run dev
```

- Web app: `http://localhost:5173`

---

## Running Tests and Quality Checks

### Backend

```powershell
cd backend
python -m pytest tests/test_health.py -q
python -m ruff check .
```

### Frontend

```powershell
cd frontend
npm test -- --run
npm run lint
npm run type-check
```

The backend health test is the checkpoint-3 proof test for the API. The full backend suite still contains later-stage authentication tests that are not part of this checkpoint.

---

## Environment Variables

The project uses environment files in the repository root, backend, and frontend:

- `.env.example` for Docker Compose defaults
- `backend/.env.example` for FastAPI settings and the database URLs
- `frontend/.env.example` for the frontend API URL

Keep the values consistent with the active Docker services and the current application configuration.
