# Servisler ve Erişim Noktaları (Services & Endpoints)

---

## Konteyner Listesi

| Konteyner Adı | Image | Port (Host → Container) | Açıklama |
|---|---|---|---|
| `blog_frontend` | Custom (Next.js) | `3000 → 3000` | Kullanıcı arayüzü |
| `blog_backend` | Custom (FastAPI) | `8000 → 8000` | REST API sunucusu |
| `blog_mysql` | `mysql:9.0` | `3306 → 3306` | İlişkisel veritabanı |
| `blog_redis` | `redis:alpine` | `6379 → 6379` | Cache ve iş kuyruğu |
| `blog_minio` | `minio/minio` | `9000 → 9000` (API), `9001 → 9001` (Konsol) | Nesne depolama |
| `blog_pma` | `phpmyadmin/phpmyadmin` | `8080 → 80` | MySQL web yönetimi |

---

## Erişim Adresleri

### Kullanıcı Arayüzü

| Servis | URL | Açıklama |
|---|---|---|
| **Frontend** | http://localhost:3000 | Ana portfolyo ve blog sitesi |
| **Hakkımda** | http://localhost:3000/about | Hakkımda sayfası |
| **Projeler** | http://localhost:3000/projects | Canlı PaaS projeleri |
| **Blog** | http://localhost:3000/blog | Blog yazıları |
| **İletişim** | http://localhost:3000/contact | İletişim formu |
| **Proje Görüntüleyici** | http://localhost:3000/paas/[id] | İzole PaaS proje önizlemesi |

### Yönetici Paneli (Giriş Gerektirir)

| Servis | URL | Açıklama |
|---|---|---|
| **Dashboard** | http://localhost:3000/dashboard | Ana kontrol paneli |
| **PaaS Yönetimi** | http://localhost:3000/dashboard/paas | Git projelerini yönet ve yayınla |
| **İçerik** | http://localhost:3000/dashboard/content | Blog ve proje yönetimi |
| **Yorumlar** | http://localhost:3000/dashboard/comments | Yorum yönetimi |
| **Profil** | http://localhost:3000/dashboard/profile | Hakkımda ve Yetenekler yönetimi |

### Backend API

| Servis | URL | Açıklama |
|---|---|---|
| **Swagger UI** | http://localhost:8000/docs | Tüm API endpoint'lerinin etkileşimli dokümantasyonu |
| **ReDoc** | http://localhost:8000/redoc | Alternatif API dokümantasyonu |
| **Sağlık Kontrolü** | http://localhost:8000/api/health | Sistem durumu |
| **OpenAPI JSON** | http://localhost:8000/openapi.json | OpenAPI şeması |

### Altyapı Servisleri

| Servis | URL | Giriş Bilgileri | Açıklama |
|---|---|---|---|
| **phpMyAdmin** | http://localhost:8080 | Kullanıcı: `blog_user`, Şifre: `blog_password` | MySQL web yönetim paneli |
| **MinIO Konsol** | http://localhost:9001 | Kullanıcı: `minio_admin`, Şifre: `minio_password` | Nesne depolama yönetimi |
| **Redis** | `localhost:6379` | Şifre yok (geliştirme) | Doğrudan TCP bağlantısı (Redis Insight gibi araçlarla) |

---

## Temel API Endpoint'leri

### Kimlik Doğrulama

| Metod | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş, JWT cookie set eder |
| POST | `/api/auth/logout` | Çıkış, JWT cookie siler ve token'ı blacklist'e ekler |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |
| POST | `/api/auth/refresh` | Access token yenileme |

### PaaS

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/paas/projects` | Herkese açık | Çalışan PaaS projelerini listele |
| GET | `/api/paas` | Admin | Kendi PaaS projelerini listele |
| POST | `/api/paas` | Admin | Yeni proje oluştur ve deploy et |
| GET | `/api/paas/{id}` | Admin | Proje detayını getir |
| PUT | `/api/paas/{id}` | Admin | Proje bilgilerini güncelle |
| POST | `/api/paas/{id}/start` | Admin | Projeyi başlat / yeniden başlat |
| POST | `/api/paas/{id}/stop` | Admin | Projeyi durdur |
| DELETE | `/api/paas/{id}` | Admin | Projeyi ve konteynerini sil |

### İçerik (Blog & Projeler)

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/blogs` | Herkese açık | Blog yazılarını listele |
| GET | `/api/blogs/{slug}` | Herkese açık | Blog yazısı detayı |
| POST | `/api/blogs` | Admin | Yeni blog yazısı oluştur |
| PUT | `/api/blogs/{id}` | Admin | Blog yazısı güncelle |
| DELETE | `/api/blogs/{id}` | Admin | Blog yazısını sil |
| GET | `/api/projects` | Herkese açık | Projeleri listele |

---

## Konteyner Başlatma Sırası

```
MySQL ──(sağlıklı)──► Redis ──(sağlıklı)──► MinIO ──(sağlıklı)──► Backend ──(başladı)──► Frontend
                                                                       │
                                                                 phpMyAdmin
```

Her servis, bir önceki servis sağlık kontrolünden geçene kadar bekler. Bu `depends_on` + `healthcheck` mekanizması ile sağlanır.
