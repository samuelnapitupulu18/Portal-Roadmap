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

Buat file `backend/.env` dengan isi:

```
JIRA_BASE_URL=https://<workspace>.atlassian.net
JIRA_API_EMAIL=<email>
JIRA_API_TOKEN=<api-token>
```

Tanpa kredensial Jira, backend berjalan dengan data mock.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

## API

- `GET /api/v1/health` — health check
- `GET /api/v1/roadmap/stories` — daftar Epic (filter: `status`, `project`, `month`, `search`)
- `GET /api/v1/roadmap/stories/:id` — detail Epic beserta child work items dan activity
- `GET /api/v1/roadmap/attachment/:id` — proxy attachment Jira
