# Imaginex AI

A modern full-stack AI web application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **FastAPI** — powered by **IBM Granite** foundation models.

---

## 🗂 Project Structure

```
imaginex-ai/
├── frontend/                  # Next.js 15 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (dark theme)
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── login/page.tsx        # Sign-in
│   │   │   ├── register/page.tsx     # Sign-up
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx        # Sidebar + Topbar shell
│   │   │       ├── page.tsx          # Dashboard overview
│   │   │       ├── projects/page.tsx # Project management
│   │   │       ├── generate/page.tsx # AI Studio
│   │   │       ├── gallery/page.tsx  # Image gallery
│   │   │       └── settings/page.tsx # Account settings
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── WorkflowStep.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardTopbar.tsx
│   │   └── lib/
│   │       ├── api.ts                # Axios client + typed API helpers
│   │       └── utils.ts              # cn(), formatDate(), truncate()
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
└── backend/                   # FastAPI + IBM Granite
    ├── app/
    │   ├── main.py                   # FastAPI app factory
    │   ├── db.py                     # In-memory store (swap for real DB)
    │   ├── schemas.py                # Pydantic request/response models
    │   ├── core/
    │   │   ├── config.py             # Pydantic-settings (reads .env)
    │   │   └── security.py           # JWT + bcrypt helpers
    │   ├── routers/
    │   │   ├── auth.py               # /api/auth/* endpoints
    │   │   ├── projects.py           # /api/projects/* endpoints
    │   │   └── granite.py            # /api/granite/* AI endpoints
    │   └── services/
    │       └── granite.py            # IBM Watsonx async client
    ├── requirements.txt
    ├── run.py
    └── .env.example
```

---

## 🚀 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your IBM Watsonx credentials

# Run the API
python run.py        # http://localhost:8000
# Swagger UI → http://localhost:8000/docs
```

---

## 🤖 IBM Granite Integration

The backend is pre-wired for **IBM Watsonx** via [`backend/app/services/granite.py`](backend/app/services/granite.py).

Set the following in `backend/.env`:

| Variable | Description |
|---|---|
| `WATSONX_API_KEY` | IBM Cloud API key |
| `WATSONX_PROJECT_ID` | Watsonx project ID |
| `WATSONX_URL` | Regional endpoint (default: `us-south`) |

### Available endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/granite/generate` | Text generation (Granite 13B) |
| `POST` | `/api/granite/generate/stream` | Streaming SSE text generation |
| `POST` | `/api/granite/imagine` | Image generation stub (configure endpoint) |

---

## 🎨 Design System

- **Dark theme** with `#0d0d1a` base
- **Purple → Blue gradient** accents (`#7c3aed` → `#2563eb`)
- **Glass-morphism** cards with backdrop blur
- **Inter** font family
- Fully **responsive** — mobile-first with sidebar collapse

---

## 🔐 Auth

JWT-based authentication with bcrypt password hashing.  
Tokens are stored in `localStorage` and attached via an Axios request interceptor.

---

## 📄 License

MIT © Imaginex AI
