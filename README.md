# OmerVision

Kişisel portföy ve blog platformu. Git tabanlı izole proje barındırma (PaaS) özelliği ile birlikte Next.js frontend, FastAPI backend, MySQL, Redis ve MinIO'dan oluşan tam yığın uygulama.

## Hızlı Başlangıç

```bash
# Repoyu klonla
git clone https://github.com/electrichunter/omervision.git
cd omervision

# Ortam değişkenlerini hazırla
cp .env.example .env

# Sistemi başlat
docker compose up --build -d
```

## Servisler

| Servis | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API & Swagger | http://localhost:8000/docs |
| Admin Panel | http://localhost:3000/dashboard |
| MinIO Konsol | http://localhost:9001 |
| phpMyAdmin | http://localhost:8080 |

## Teknoloji Stack

| Katman | Teknoloji | Sürüm |
|---|---|---|
| **Frontend** | Next.js | 16.x |
| **Frontend** | Tailwind CSS | 4.x |
| **Frontend** | Framer Motion | latest |
| **Backend** | FastAPI | 0.129.0 |
| **Backend** | SQLAlchemy (async) | 2.0.36 |
| **ORM Sürücüsü** | aiomysql | 0.2.0 |
| **Cache & Queue** | Redis | alpine |
| **Veritabanı** | MySQL | 9.0 |
| **Object Storage** | MinIO | latest |
| **Konteynerizasyon** | Docker Compose | 2.x |

## Özellikler

- 📝 Blog ve Proje yönetimi (CRUD)
- 🔐 JWT tabanlı kimlik doğrulama (access + refresh token, HttpOnly cookie)
- 🛡️ Rol tabanlı yetkilendirme (RBAC — admin / user)
- 🚀 **PaaS Modülü:** Git reposunu yapıştır, sistem otomatik olarak tespit, build ve çalıştırır
- 🖼️ MinIO ile resim yükleme (S3 uyumlu)
- ⚡ Redis üzerinde Arq iş kuyruğu (e-posta gönderimi test edilmedi)
- 🌗 Karanlık mod destekli modern arayüz

## Dökümantasyon

Detaylı teknik dökümantasyon için [`doc/`](./doc/) klasörüne bakın:

| Belge | Açıklama |
|---|---|
| [Mimari Genel Bakış](./doc/architecture.md) | Sistem bileşenleri ve haberleşme diyagramı |
| [Ön Koşullar](./doc/prerequisites.md) | Gerekli araçlar ve kurulum |
| [Hızlı Başlangıç](./doc/quickstart.md) | Adım adım başlatma rehberi |
| [Çevre Değişkenleri](./doc/environment.md) | Ortam değişkenleri referans tablosu |
| [Servisler & Portlar](./doc/services.md) | Tüm endpoint ve URL listesi |
| [Geliştirici İş Akışı](./doc/developer-workflow.md) | Model, sayfa ve PaaS geliştirme rehberi |
| [Canlıya Alma Rehberi](./doc/deployment.md) | VPS, Nginx ve SSL kurulumu |
| [Test Otomasyonu](./doc/testing.md) | Pytest ve Jest testleri |
| [Veritabanı Yönetimi](./doc/database.md) | Şema yönetimi ve yedekleme |
| [API Referansı](./doc/api-reference.md) | Auth akışı ve mimari mantık |

---

> **Güvenlik Notu:** `docker-compose.yml` içindeki varsayılan şifreler yalnızca geliştirme ortamı içindir. Prodüksiyona almadan önce `.env` dosyasındaki tüm şifreleri ve `SECRET_KEY`'i değiştirin. Detaylar: [environment.md](./doc/environment.md)
