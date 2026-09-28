# AgroSense

AgroSense adalah aplikasi AI untuk diagnosis tanaman dan pencatatan keuangan pertanian, terdiri dari:

- **backend** — FastAPI (Python) yang menangani analisis (via Langflow) dan data keuangan (AstraDB).
- **frontend** — Next.js (TypeScript) sebagai antarmuka pengguna.

## Prasyarat

- [Docker](https://www.docker.com/) dan Docker Compose plugin (`docker compose`) sudah terinstal.
- Akun/kredensial AstraDB (untuk backend).
- Instance Langflow yang bisa diakses (lokal via host atau sebagai service).

## 1. Konfigurasi Environment

Backend membutuhkan file `.env`. Salin dari contoh yang tersedia lalu isi nilainya:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` dan isi variabel berikut:

| Variabel | Keterangan |
|---|---|
| `ASTRA_DB_APPLICATION_TOKEN` | Token aplikasi AstraDB |
| `ASTRA_DB_API_ENDPOINT` | Endpoint API AstraDB |
| `ASTRA_DB_KEYSPACE` | Keyspace AstraDB (default: `agrosense`) |
| `ASTRA_DB_COLLECTION` | Koleksi transaksi (default: `transactions`) |
| `ASTRA_DB_FINANCE_COLLECTION` | Koleksi entri keuangan (default: `finance_entries`) |
| `LANGFLOW_API_URL` | URL endpoint Langflow (lihat komentar di `.env.example` untuk pilihan sesuai OS/deployment) |
| `LANGFLOW_API_KEY` | API key Langflow (jika diperlukan) |

Catatan `LANGFLOW_API_URL` tergantung cara Langflow dijalankan:

- Docker Desktop (Mac/Windows), Langflow di host: `http://host.docker.internal:7860/api/v1/run/<flow-id>`
- Linux tanpa Docker Desktop: `http://172.17.0.1:7860/api/v1/run/<flow-id>`
- Langflow sebagai service di `docker-compose.yml`: `http://langflow:7860/api/v1/run/<flow-id>`
- Langflow cloud/remote: `https://your-langflow-instance.example.com/api/v1/run/<flow-id>`

## 2. Menjalankan dengan Docker (Production-like)

Build dan jalankan seluruh stack (backend + frontend):

```bash
docker compose up --build
```

Setelah container sehat (healthcheck backend lolos), akses:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

Jalankan di background (detached):

```bash
docker compose up --build -d
```

Hentikan stack:

```bash
docker compose down
```

## 3. Menjalankan dalam Mode Development (Hot Reload)

Gunakan `docker-compose.dev.yml` untuk live reload backend (uvicorn `--reload`) dan frontend (Next.js HMR):

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Perubahan file `.py` di `backend/` otomatis memicu restart uvicorn.
- Perubahan file `.tsx`/`.ts`/`.css` di `frontend/` otomatis memicu hot-reload browser.
- `node_modules` frontend diisolasi di dalam container (tidak menimpa folder host) melalui anonymous volume.

Hentikan stack dev:

```bash
docker compose -f docker-compose.dev.yml down
```

## 4. Melihat Log

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## 5. Build Ulang Setelah Perubahan Dependency

Jika mengubah `requirements.txt` (backend) atau `package.json` (frontend), rebuild image tanpa cache:

```bash
docker compose build --no-cache
docker compose up
```

## Struktur Proyek

```
agrosense/
├── backend/                 # FastAPI service
│   ├── Dockerfile            # image production
│   ├── Dockerfile.dev         # image development (hot reload)
│   ├── .env.example
│   └── ...
├── frontend/                # Next.js app
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── ...
├── docker-compose.yml        # stack production-like
└── docker-compose.dev.yml    # stack development (hot reload)
```

## Troubleshooting

- **Backend gagal healthcheck**: pastikan `backend/.env` sudah terisi lengkap dan valid.
- **Frontend tidak bisa mengakses backend**: pastikan service `backend` berstatus healthy sebelum `frontend` start (sudah diatur via `depends_on.condition: service_healthy`).
- **Langflow tidak terhubung dari container**: sesuaikan `LANGFLOW_API_URL` sesuai OS dan cara Langflow dijalankan (lihat bagian [Konfigurasi Environment](#1-konfigurasi-environment)).
