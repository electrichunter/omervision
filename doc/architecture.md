# Mimari Genel Bakış (Architecture Overview)

## Sistem Nedir?

OmerVision, bir Full Stack geliştirici portföy platformudur. İki temel katmandan oluşur:

1. **Portfolyo Katmanı** — Blog yazıları, projeler, hakkımda ve iletişim sayfalarını yöneten içerik sistemi.
2. **PaaS Katmanı** — Git reposundaki herhangi bir projeyi otomatik olarak Docker konteynerinde çalıştıran, izole barındırma motoru.

---

## Bileşenler

```
┌─────────────────────────────────────────────────────────────┐
│                         KULLANICI                           │
│                    (Tarayıcı / Browser)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ :3000
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND — Next.js 14 (App Router)             │
│  - SSR + Client Components                                  │
│  - Tailwind CSS + Framer Motion                             │
│  - /dashboard/* (yönetici paneli)                           │
│  - /projects, /blog, /about, /contact (halka açık)          │
│  - /paas/[id] (izole proje önizleme)                        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP Proxy via Next.js /api/[...path]
                 │ INTERNAL: http://backend:8000
                 │ :8000
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND — FastAPI (Python 3.10)                │
│  - SQLAlchemy Async (aiomysql driver)                       │
│  - JWT Kimlik Doğrulama (python-jose)                       │
│  - Role-Based Access Control (RBAC)                         │
│  - Argon2 Parola Hashleme                                   │
│  - Arq (Redis destekli) Arka Plan İş Kuyruğu               │
│  - MinIO ile nesne depolama (resim yükleme)                 │
│  - PaaS Motoru: Git Clone → Docker Build → Run             │
└───┬────────────────────┬────────────────┬───────────────────┘
    │                    │                │
    │ :3306              │ :6379          │ :9000
    ▼                    ▼                ▼
┌──────────┐       ┌──────────┐     ┌──────────────┐
│  MySQL   │       │  Redis   │     │    MinIO     │
│  9.0     │       │ Alpine   │     │ Object Store │
│ blog_db  │       │          │     │  :9001 UI    │
└──────────┘       └──────────┘     └──────────────┘
    │                    │
    ▼                    ▼
┌──────────┐       ┌─────────────────────────────────┐
│phpMyAdmin│       │  Arq Worker (arka plan e-posta) │
│  :8080   │       │  Redis üzerinden job kuyruğu    │
└──────────┘       └─────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │           PaaS MOTORU (Docker-in-Docker)  │
        │                                          │
        │  Backend konteyneri → Docker.sock bağlı  │
        │                                          │
        │  [Admin işlemi başlatır]                 │
        │   1. Git repo klonlanır                  │
        │   2. Proje tipi otomatik tespit edilir   │
        │      - package.json → next → nextjs      │
        │      - requirements.txt → fastapi        │
        │      - index.html → static (nginx)       │
        │   3. Dockerfile otomatik oluşturulur     │
        │      (ya da repodaki kullanılır)         │
        │   4. Docker image build edilir           │
        │   5. Konteyner kaynak sınırıyla başlar:  │
        │      - max 256 MB RAM                    │
        │      - max 50% CPU (cpu_quota=50000)     │
        │      - restart: on-failure (max 3)       │
        │   6. Rastgele host portu atanır          │
        │   7. host_url DB'ye kaydedilir           │
        │                                          │
        │  Kullanıcı → /paas/[id] iframe görünümü │
        └──────────────────────────────────────────┘
```

---

## Haberleşme Akışı

| Kaynak | Hedef | Protokol | Açıklama |
|---|---|---|---|
| Tarayıcı | Frontend (Next.js) | HTTPS/3000 | Tüm sayfa istekleri |
| Frontend | Backend (FastAPI) | HTTP dahili /8000 | API proxy (docker ağı `backend:8000`) |
| Tarayıcı | Backend | HTTP/8000 | `NEXT_PUBLIC_API_URL` aracılığıyla auth cookie iletimi |
| Backend | MySQL | TCP/3306 | SQLAlchemy async + aiomysql |
| Backend | Redis | TCP/6379 | Oturum token blacklist, Arq job kuyruğu, skills/about cache |
| Backend | MinIO | HTTP/9000 | Resim yükleme (aioboto3 ile S3 protokolü) |
| Backend | Docker Daemon | Unix Socket `/var/run/docker.sock` | PaaS konteyner yönetimi |
| Tarayıcı | PaaS Konteynerleri | HTTP/dinamik port | Sadece iframe aracılığıyla, port kullanıcıdan gizlenir |

---

## Teknoloji Stack

### Backend
| Kütüphane | Versiyon | Amaç |
|---|---|---|
| FastAPI | 0.129.0 | REST API çatısı |
| SQLAlchemy | 2.0.36 | ORM (async) |
| aiomysql | 0.2.0 | Async MySQL sürücüsü |
| Redis | 5.2.0 | Cache ve job queue |
| python-jose | latest | JWT token imzalama |
| argon2-cffi | 23.1.0 | Güvenli parola hashleme |
| arq | 0.26.1 | Async arka plan iş kuyruğu |
| aioboto3 | 12.3.0 | S3/MinIO async istemci |
| docker | 7.1.0 | PaaS Docker SDK |
| GitPython | 3.1.43 | Git repo operasyonları |

### Frontend
| Teknoloji | Versiyon | Amaç |
|---|---|---|
| Next.js | 15.x | React SSR çatısı |
| Tailwind CSS | 4.x | Utility-first CSS |
| Framer Motion | latest | Animasyonlar |
| Lucide React | latest | İkon seti |
| TipTap | latest | Zengin içerik editörü |

---

## Güvenlik Notları

- **Kimlik doğrulama:** Access token (15 dk) + Refresh token (7 gün) çift token sistemi, HttpOnly cookie ile iletilir.
- **JWT Blacklist:** Çıkış yapıldığında token Redis'e eklenir ve invalidate edilir.
- **PaaS izolasyonu:** Her kullanıcı projesi ayrı bir Docker konteynerinde çalışır. Konteynerler birbirinden ve ana sistemden izole edilmiştir.
- **Kaynak sınırlaması:** Her PaaS konteyneri 256 MB RAM ve 50% CPU ile sınırlandırılmıştır.
