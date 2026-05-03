# Plan: Student Data Validation (Lokal vs. API Dapodik/PTKIN)

Website ini bertujuan untuk memvalidasi data siswa dari sekolah (lokal) dengan menarik dan mencocokkan data langsung dari sistem pusat (Dapodik / EMIS PTKIN) melalui integrasi API.

## 1. Arsitektur Folder & Struktur
Berikut adalah rencana struktur folder yang akan digunakan:

```text
src/
├── components/           # UI Components (Shadcn, Custom)
│   ├── ui/               # Base components from shadcn
│   ├── FileUpload.tsx    # Upload component untuk data lokal
│   ├── ResultTable.tsx   # Tabel hasil perbandingan data
│   └── SummaryCards.tsx  # Statistik ringkas (Match, Mismatch, dll)
├── features/
│   ├── parser/           # Excel/CSV parsing logic (Data Lokal)
│   ├── api/              # Integrasi API (Auth Token & Fetch Data PTKIN/Dapodik)
│   └── validator/        # Matching logic (Lokal vs API Data)
├── integrations/
│   ├── trpc/             # Backend API definitions (BFF untuk fetch API eksternal)
│   └── tanstack-query/   # State management & Caching
├── routes/               # Pages & Routing (TanStack Router)
│   ├── index.tsx         # Dashboard / Entry point
│   ├── upload.tsx        # Halaman Upload Data Lokal
│   └── results.tsx       # Halaman Hasil Detail
└── lib/                  # Utilities (formatting, schema)
```

## 2. Fitur Utama

### A. Upload Data Lokal
- **Data Sekolah:** Pengguna hanya mengunggah 1 file Excel/CSV yang berisi data siswa dari sistem lokal.
- **Mapping Kolom:** Penentuan mana kolom yang menjadi *Primary Key* (seperti NISN).

### B. Integrasi API (Otomatisasi Tarik Data)
- Sistem akan menggunakan `PTKIN_TOKEN_URL`, `PTKIN_TOKEN_USERNAME`, dan `PTKIN_TOKEN_PASSWORD` untuk mendapatkan akses API.
- Sistem secara otomatis menarik data dari pusat (berdasarkan NISN atau secara bulk) untuk disandingkan dengan data lokal yang diunggah.
- *Catatan:* Pemanggilan API Eksternal dengan kredensial ini dilakukan di sisi server (tRPC / backend function) agar rahasia tidak bocor ke client/browser.

### C. Proses Validasi (Matching Engine)
- **Primary Key:** NISN.
- **Atribut yang divalidasi:**
  - Nama Lengkap
  - Tempat & Tanggal Lahir
  - Jenis Kelamin
  - Nama Ibu Kandung
- **Status Hasil:**
  - ✅ **Sesuai:** Data lokal persis sama dengan data dari API Pusat.
  - ⚠️ **Selisih:** NISN ditemukan di API, tapi ada perbedaan detail identitas.
  - ❌ **Tidak Ditemukan:** Data (NISN) ada di lokal tapi tidak terdaftar di database Pusat API.

### D. Dashboard & Visualisasi
- Ringkasan statistik proses validasi.
- Tabel Interaktif yang menampilkan status kecocokan dan detail kolom yang selisih.

### E. Ekspor Hasil
- Unduh laporan hasil komparasi dalam format Excel untuk bahan rekonsiliasi data.

## 3. Langkah Implementasi (Roadmap Terbaru)

### Phase 1: Setup & UI (Selesai)
- [x] Install library pendukung (`xlsx`, `papaparse`, `lucide-react`).
- [x] Setup komponen dasar shadcn.

### Phase 2: Core Logic & Backend Integration (Revisi)
- [ ] Ubah alur upload: Hapus fitur upload file kedua (file Dapodik), cukup satu file lokal saja.
- [ ] Setup fungsi backend di tRPC untuk:
  - Otentikasi ke server PTKIN/Dapodik untuk mendapatkan Token.
  - Endpoint internal untuk mem-fetch data siswa dari API Pusat.
- [ ] Sesuaikan Validation Engine untuk menerima array data API sebagai pembanding.

### Phase 3: Reporting & Features
- [ ] Integrasikan proses pengecekan menggunakan TanStack Query (menampilkan *loading progress* saat fetch API per siswa/batch).
- [ ] Tampilkan hasil perbandingan pada Dashboard (`/results`).
- [ ] Fitur Export ke Excel dari data hasil validasi.

### Phase 4: Polish & Deploy
- [ ] Perbaikan UI/UX (Progress bar saat fetch data dari API).
- [ ] Deployment memastikan *environment variables* (Credentials) tersimpan aman di platform hosting (Cloudflare Pages/Workers).
