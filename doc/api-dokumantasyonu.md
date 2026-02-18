# 🔧 Backend API Dokümantasyonu

## 📋 Genel Bakış

OmerVision projesinin backend'i **FastAPI** framework'ü ile geliştirilmiştir. MySQL 9.0 veritabanı kullanmakta ve JWT tabanlı kimlik doğrulama sistemi içermektedir.

---

## 🏗️ Mimari Yapı

```
backend/
├── main.py           # Ana uygulama ve route'lar
├── models.py         # SQLAlchemy modelleri
├── schemas.py        # Pydantic şemaları
├── database.py       # Veritabanı bağlantısı
├── auth.py           # JWT ve şifreleme işlemleri
├── requirements.txt  # Bağımlılıklar
└── Dockerfile        # Container konfigürasyonu
```

---

## 🚀 Başlatma

### Geliştirme Ortamı:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker ile:
```bash
docker-compose up -d
```

---

## 📡 API Endpoint'leri

### 1. Kimlik Doğrulama (Authentication)

#### POST `/register`
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

**Not:** Kullanıcıya otomatik olarak "Reader" rolü atanır.

---

#### POST `/token`
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

#### GET `/users/me`
Mevcut kullanıcı bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "is_active": true,
  "roles": ["reader"],
  "created_at": "2026-02-16T12:00:00"
}
```

---

### 2. Blog Yazıları (Posts)

#### GET `/posts`
Tüm yazıları listeler (sayfalama destekli).

**Query Parameters:**
- `skip` (int): Kaç kayıt atlanacak (default: 0)
- `limit` (int): Kaç kayıt getirilecek (default: 10)
- `status` (str): Filtre - draft/published/archived

**Response:**
```json
[
  {
    "id": 1,
    "title": "İlk Blog Yazım",
    "slug": "ilk-blog-yazim",
    "excerpt": "Bu benim ilk blog yazım...",
    "content": "<p>Tam içerik...</p>",
    "status": "published",
    "author": {
      "id": 1,
      "username": "johndoe",
      "display_name": "John Doe"
    },
    "category": {
      "id": 1,
      "name": "Teknoloji",
      "slug": "teknoloji"
    },
    "tags": ["javascript", "react"],
    "view_count": 150,
    "like_count": 23,
    "published_at": "2026-02-16T12:00:00",
    "created_at": "2026-02-16T12:00:00"
  }
]
```

---

#### GET `/posts/{slug}`
Belirli bir yazıyı slug ile getirir.

**Response:** Tek post objesi (yukarıdakiyle aynı yapı)

---

#### POST `/posts`
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

**Yetki:** Author, Editor, Admin

---

#### PUT `/posts/{post_id}`
Yazıyı günceller (Yetkilendirme gerekli).

**Yetki:** Kendi yazısı (Author) | Tüm yazılar (Editor, Admin)

---

#### DELETE `/posts/{post_id}`
Yazıyı siler (Yetkilendirme gerekli).

**Yetki:** Kendi yazısı (Author) | Tüm yazılar (Editor, Admin)

---

### 3. Kategoriler (Categories)

#### GET `/categories`
Tüm kategorileri listeler.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Teknoloji",
    "slug": "teknoloji",
    "description": "Teknoloji haberleri",
    "color": "#3B82F6",
    "post_count": 15
  }
]
```

---

#### POST `/categories`
Yeni kategori oluşturur (Admin/Editor).

**Request Body:**
```json
{
  "name": "Yeni Kategori",
  "slug": "yeni-kategori",
  "description": "Açıklama",
  "color": "#FF5733",
  "icon": "code"
}
```

---

### 4. Etiketler (Tags)

#### GET `/tags`
Tüm etiketleri listeler.

#### POST `/tags`
Yeni etiket oluşturur.

---

### 5. Yorumlar (Comments)

#### GET `/posts/{post_id}/comments`
Yazının yorumlarını getirir.

**Response:**
```json
[
  {
    "id": 1,
    "body": "Harika yazı!",
    "user": {
      "id": 2,
      "username": "janedoe",
      "display_name": "Jane Doe"
    },
    "created_at": "2026-02-16T14:30:00",
    "replies": []
  }
]
```

---

#### POST `/posts/{post_id}/comments`
Yoruma yorum ekler.

**Request Body:**
```json
{
  "body": "Yorum metni...",
  "parent_id": null  // Cevap ise parent yorum ID
}
```

---

### 6. Beğeniler (Likes)

#### POST `/posts/{post_id}/like`
Yazıyı beğenir/beğeniyi kaldırır (toggle).

**Headers:**
```
Authorization: Bearer <token>
```

---

### 7. Admin İşlemleri

#### GET `/admin/users`
Tüm kullanıcıları listeler (Admin only).

#### PUT `/admin/users/{user_id}/roles`
Kullanıcı rolünü günceller (Admin only).

**Request Body:**
```json
{
  "role_ids": [1, 2]  // Admin ve Editor
}
```

---

#### GET `/admin/stats`
Dashboard istatistiklerini getirir.

**Response:**
```json
{
  "total_users": 150,
  "total_posts": 45,
  "total_comments": 230,
  "total_views": 12500,
  "posts_this_week": 5,
  "active_users_today": 23
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

### İzinler:

| İzin | Slug | Admin | Editor | Author | Reader |
|------|------|-------|--------|--------|--------|
| Yazı Oluştur | create_post | ✅ | ✅ | ✅ | ❌ |
| Yazı Düzenle | edit_post | ✅ | ✅ | ❌ | ❌ |
| Kendi Yazısını Düzenle | edit_own_post | ✅ | ✅ | ✅ | ❌ |
| Yazı Sil | delete_post | ✅ | ✅ | ❌ | ❌ |
| Yazı Yayınla | publish_post | ✅ | ✅ | ❌ | ❌ |
| Kategori Yönet | manage_categories | ✅ | ✅ | ❌ | ❌ |
| Etiket Yönet | manage_tags | ✅ | ✅ | ❌ | ❌ |
| Yorum Sil | delete_comment | ✅ | ✅ | ❌ | ❌ |
| Kullanıcı Yönet | manage_users | ✅ | ❌ | ❌ | ❌ |
| Rol Ata | assign_roles | ✅ | ❌ | ❌ | ❌ |

---

## 🗄️ Veritabanı Şeması

### Tablolar:

1. **users** - Kullanıcı bilgileri
2. **roles** - Roller (Admin, Editor, Author, Reader)
3. **permissions** - İzinler
4. **role_permissions** - Rol-izin eşleştirmeleri
5. **user_roles** - Kullanıcı-rol eşleştirmeleri
6. **categories** - Kategoriler
7. **tags** - Etiketler
8. **posts** - Blog yazıları
9. **post_tags** - Yazı-etiket ilişkisi
10. **comments** - Yorumlar
11. **post_likes** - Beğeniler
12. **sessions** - Oturum yönetimi

Detaylı şema için: `database/schema.sql`

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

### Rate Limiting:
- **Login attempts:** 5 deneme / 15 dakika
- **API calls:** 100 istek / dakika

---

## 🧪 Test Kullanıcıları

### Admin Kullanıcı:
```
Email: admin@omerfaruk.vision
Şifre: admin123
Username: omerfaruk
```

### Test Kullanıcısı (Reader):
```
Email: test@example.com
Şifre: test123
Username: testuser
```

---

## 📊 Performans

### Optimizasyonlar:
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
| 409 | Conflict - Çakışma (örn: email kayıtlı) |
| 422 | Validation Error - Doğrulama hatası |
| 500 | Internal Server Error - Sunucu hatası |

---

## 📚 Swagger UI

API dokümantasyonunu görüntülemek için:

```
http://localhost:8000/docs
```

Alternatif:
```
http://localhost:8000/redoc
```

---

## 🔧 Ortam Değişkenleri

`.env` dosyası:

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
ENVIRONMENT=development  # production, staging
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

*Son Güncelleme: 16 Şubat 2026*
*Versiyon: 1.0.0*
