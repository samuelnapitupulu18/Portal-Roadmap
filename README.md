# Portal Nusa Web

Dashboard roadmap internal yang menampilkan Epic dari Jira (project IS) beserta progress pengerjaannya.

## Struktur

- `backend/` — REST API (Express.js) yang menarik data Epic dan child work items dari Jira Cloud
- `frontend/` — Aplikasi React (Vite) untuk menampilkan roadmap

## Menjalankan

### Backend

```bash
cd backend
npm install
npm start
```

Salin `backend/.env.example` menjadi `backend/.env` lalu isi kredensial Jira:

```bash
copy .env.example .env
```

Tanpa kredensial Jira, backend berjalan dengan data mock. File `.env` berisi rahasia dan tidak boleh di-commit (sudah masuk `.gitignore`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Deploy

1. Backend: salin `.env.example` menjadi `.env` di server, isi nilainya, lalu jalankan `npm start`.
2. Frontend: jalankan `npm run build`, lalu serve isi folder `frontend/dist/` (folder ini hasil build, tidak di-commit — sudah masuk `.gitignore`).

## API

- `GET /api/v1/health` — health check
- `GET /api/v1/roadmap/stories` — daftar Epic (filter: `status`, `project`, `month`, `search`)
- `GET /api/v1/roadmap/stories/:id` — detail Epic beserta child work items dan activity
- `GET /api/v1/roadmap/attachment/:id` — proxy attachment Jira
