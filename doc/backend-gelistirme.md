# ⚡ Backend Geliştirme Dokümantasyonu

## 📋 Genel Bakış

OmerVision projesinin backend'i **FastAPI** framework'ü ile geliştirilmiştir. MySQL 9.0 veritabanı kullanmakta ve JWT tabanlı kimlik doğrulama sistemi içermektedir.

---

## 🏗️ Mimari Yapı

```
backend/
├── main.py              # Ana uygulama ve route'lar
├── models.py            # SQLAlchemy modelleri (Veritabanı tabloları)
├── schemas.py           # Pydantic şemaları (Veri doğrulama)
├── database.py          # Veritabanı bağlantı yapılandırması
├── auth.py              # JWT ve şifreleme işlemleri
├── requirements.txt     # Python bağımlılıkları
└── Dockerfile           # Docker container konfigürasyonu
```

---

## 🚀 Başlatma

### 1. Geliştirme Ortamı

```bash
# Backend klasörüne git
cd backend

# Python sanal ortamı oluştur
python -m venv venv

# Sanal ortamı aktif et
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Sunucuyu başlat
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Docker ile Başlatma

```bash
# Tüm projeyi Docker ile başlat (MySQL + Redis + Backend)
docker-compose up -d
```

---

## 📡 API Endpoint'leri

### Kimlik Doğrulama (Authentication)

#### `POST /register`
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "display_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "is_active": true,
  "created_at": "2026-02-16T12:00:00"
}
```

**Not:** Kullanıcıya otomatik olarak "Reader" (Okuyucu) rolü atanır.

---

#### `POST /token`
Kullanıcı girişi ve JWT token alma.

**Request:**
```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=securepassword123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

#### `GET /users/me`
Mevcut kullanıcı bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Blog Yazıları (Posts)

#### `GET /posts`
Tüm yazıları listeler.

**Query Parameters:**
- `skip`: Kaç kayıt atlanacak (default: 0)
- `limit`: Kaç kayıt getirilecek (default: 10)
- `status`: Filtre - draft/published/archived
- `category_id`: Kategori ID'sine göre filtrele

---

#### `GET /posts/{slug}`
Slug'a göre yazı getirir.

---

#### `POST /posts`
Yeni yazı oluşturur (Yetkilendirme gerekli).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Yeni Yazı Başlığı",
  "content": "<p>Yazı içeriği...</p>",
  "excerpt": "Kısa özet",
  "category_id": 1,
  "tags": ["python", "fastapi"],
  "status": "draft"
}
```

---

### Kategoriler (Categories)

#### `GET /categories`
Tüm kategorileri listeler.

---

### Admin İşlemleri

#### `GET /admin/stats`
Dashboard istatistiklerini getirir.

**Response:**
```json
{
  "total_users": 150,
  "total_posts": 45,
  "total_comments": 230,
  "total_views": 12500,
  "posts_this_week": 5
}
```

---

## 🔐 Yetkilendirme (RBAC)

### Rol Hiyerarşisi:

1. **Admin** (id: 1)
   - Tüm yetkiler
   - Kullanıcı yönetimi
   - Rol atama

2. **Editor** (id: 2)
   - Tüm yazıları yönetme
   - Kategori/etiket yönetimi
   - Yorum moderasyonu

3. **Author** (id: 3)
   - Kendi yazılarını oluşturma/düzenleme/silme
   - Yorum yapma

4. **Reader** (id: 4) - *Varsayılan*
   - Yazıları okuma
   - Yorum yapma
   - Beğenme

---

## 🗄️ Veritabanı Şeması

### Tablolar:

| Tablo | Açıklama |
|-------|----------|
| `users` | Kullanıcı bilgileri |
| `roles` | Roller (Admin, Editor, Author, Reader) |
| `permissions` | İzinler |
| `role_permissions` | Rol-izin eşleştirmeleri |
| `user_roles` | Kullanıcı-rol eşleştirmeleri |
| `categories` | Kategoriler |
| `tags` | Etiketler |
| `posts` | Blog yazıları |
| `post_tags` | Yazı-etiket ilişkisi |
| `comments` | Yorumlar |
| `post_likes` | Beğeniler |
| `sessions` | Oturum yönetimi |

Detaylı şema için: `../database/schema.sql`

---

## 🔒 Güvenlik

### JWT Token:
- **Algorithm:** HS256
- **Expiration:** 30 dakika
- **Secret Key:** Environment variable'dan alınır

### Şifreleme:
- **Algorithm:** bcrypt
- **Salt Rounds:** 12

### CORS:
- **Allowed Origins:** http://localhost:3000
- **Credentials:** Enabled
- **Methods:** GET, POST, PUT, DELETE, OPTIONS

---

## 🧪 Test Kullanıcıları

### Admin Kullanıcı:
```
Email: admin@omerfaruk.vision
Şifre: admin123
Username: omerfaruk
```

---

## 📊 Performans Optimizasyonları

- ✅ Database connection pooling
- ✅ Redis caching (sık erişilen veriler)
- ✅ SQLAlchemy lazy loading
- ✅ Pagination (sayfalama)
- ✅ Index'ler (username, email, slug)

---

## 🐛 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Bad Request - Geçersiz istek |
| 401 | Unauthorized - Yetkisiz erişim |
| 403 | Forbidden - Yasaklı erişim |
| 404 | Not Found - Kaynak bulunamadı |
| 409 | Conflict - Çakışma |
| 422 | Validation Error - Doğrulama hatası |
| 500 | Internal Server Error - Sunucu hatası |

---

## 📚 Swagger UI

API dokümantasyonunu görüntülemek için:

```
http://localhost:8000/docs
```

Alternatif (ReDoc):
```
http://localhost:8000/redoc
```

---

## 🔧 Ortam Değişkenleri

`.env` dosyası oluşturun:

```env
# Database
DATABASE_URL=mysql+mysqlconnector://blog_user:blog_password@localhost:3306/blog_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
```

---

## 🔌 Frontend ile Entegrasyon

### Login İsteği:
```javascript
const response = await fetch("http://localhost:8000/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    username: email,
    password: password,
  }),
});

const data = await response.json();
localStorage.setItem("token", data.access_token);
```

### Korumalı Endpoint:
```javascript
const response = await fetch("http://localhost:8000/users/me", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  }
});
```

---

## 🚀 Production Checklist

- [ ] Güçlü SECRET_KEY ayarla
- [ ] HTTPS aktif et
- [ ] Rate limiting yapılandır
- [ ] Loglama ekle
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Backup stratejisi
- [ ] SSL sertifikası
- [ ] Environment variables güncelle

---

## 📦 Bağımlılıklar

```txt
fastapi==0.129.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
mysql-connector-python==9.1.0
redis==5.2.0
python-dotenv==1.0.1
passlib[bcrypt]
python-jose[cryptography]
python-multipart
```

---

*Son Güncelleme: 16 Şubat 2026*
*Versiyon: 1.0.0*
*MySQL: 9.0*
*Python: 3.11+*
