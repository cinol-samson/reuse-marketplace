# Reuse Marketplace

A desktop-first web application designed for laptop screens (1280–1440 px), connecting community members, makers, artists, and rag pickers to list unused items to **sell, donate, or upcycle**.

## Architecture & Visual System

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + TanStack Query + React Router.
- **Backend**: FastAPI (Python) + SQLAlchemy 2.0 + PostgreSQL.
- **Design Aesthetic**: **Wabi-Sabi × Conceptual Sketch** — Warm ivory and earthy palette, natural paper textures, restrained borders, Playfair Display + Inter typography, and hand-drawn line-art sketches.
- **Dev Style Guide**: View all tokens, typography, and reusable components at `/styleguide`.

---

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** & npm
- **Docker & Docker Compose** (for PostgreSQL)

---

## Quickstart

### 1. Database (Docker Compose)
Start the PostgreSQL services (dev DB on port 5432, test DB on port 5433):
```bash
docker compose up -d
```

### 2. Backend Setup & Run
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000/api/v1`
- Health check: `http://localhost:8000/api/v1/healthz`
- OpenAPI Docs: `http://localhost:8000/api/docs`

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
cp .env.example .env

# Run Vite dev server:
npm run dev
```
- Web App: `http://localhost:5173`
- Style Guide: `http://localhost:5173/styleguide`

---

## Running Tests & Quality Checks

### Backend Quality Suite
```bash
cd backend

# Unit & Acceptance Tests (with coverage report):
pytest

# Code Linter & Formatting:
ruff check .

# Static Type Safety:
mypy app
```

### Frontend Quality Suite
```bash
cd frontend

# Component & Unit Tests (Vitest):
npm run test

# Linter:
npm run lint

# TypeScript Type Check:
npm run type-check
```

---

## Environment Variables

All configuration is driven by environment variables documented in `backend/.env.example` and `frontend/.env.example`. 
