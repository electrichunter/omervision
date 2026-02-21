# Çevre Değişkenleri (Environment Variables)

> ⚠️ **GÜVENLİK UYARISI:** `docker-compose.yml` içindeki varsayılan değerler yalnızca geliştirme ortamı içindir. Prodüksiyona almadan önce **tüm şifreleri ve gizli anahtarları** değiştirin.

---

## .env.example

Aşağıdaki içeriği `.env.example` olarak projenin kök dizinine kaydedin:

```env
# ─────────────────────────────────────────────
# VERİTABANI (MySQL)
# ─────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_DATABASE=blog_db
MYSQL_USER=blog_user
MYSQL_PASSWORD=your_strong_db_password

# SQLAlchemy bağlantı URL'si (backend tarafında kullanılır)
DATABASE_URL=mysql+pymysql://blog_user:your_strong_db_password@db/blog_db

# ─────────────────────────────────────────────
# REDIS
# ─────────────────────────────────────────────
REDIS_URL=redis://redis:6379/0

# ─────────────────────────────────────────────
# MinIO (Object Storage)
# ─────────────────────────────────────────────
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=your_minio_admin_user
MINIO_SECRET_KEY=your_minio_strong_password

# ─────────────────────────────────────────────
# JWT GİZLİ ANAHTAR (En az 32 karakter, rastgele)
# Üretmek için: openssl rand -hex 32
# ─────────────────────────────────────────────
SECRET_KEY=change_this_to_a_very_long_random_string_at_least_32chars

# ─────────────────────────────────────────────
# FRONTEND
# ─────────────────────────────────────────────
# Tarayıcının doğrudan backend'e erişmek için kullandığı URL (auth cookie için)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend konteynerinin backend'e dahili Docker ağı üzerinden erişmek için kullandığı URL
INTERNAL_API_URL=http://backend:8000
```

---

## Değişkenler Referans Tablosu

### Backend Değişkenleri

| Değişken | Gerekli | Örnek Değer | Açıklama |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `mysql+pymysql://blog_user:pass@db/blog_db` | SQLAlchemy bağlantı dizesi. Async sürücüye otomatik dönüştürülür (`aiomysql`). |
| `REDIS_URL` | ✅ | `redis://redis:6379/0` | Redis bağlantı dizesi. Token blacklist ve Arq job kuyruğu için kullanılır. |
| `MINIO_ENDPOINT` | ✅ | `minio:9000` | MinIO sunucu adresi (port dahil, şema dahil değil). |
| `MINIO_ACCESS_KEY` | ✅ | `minio_admin` | MinIO erişim anahtarı (kullanıcı adı). |
| `MINIO_SECRET_KEY` | ✅ | `minio_password` | MinIO gizli anahtarı (şifre). |
| `SECRET_KEY` | ✅ | `supersecret_...` | JWT imzalama anahtarı. **Prodüksiyonda mutlaka değiştirin.** |

### MySQL İçin

| Değişken | Gerekli | Örnek Değer | Açıklama |
|---|---|---|---|
| `MYSQL_ROOT_PASSWORD` | ✅ | `rootpassword` | MySQL root kullanıcı şifresi. |
| `MYSQL_DATABASE` | ✅ | `blog_db` | Otomatik oluşturulacak veritabanı adı. |
| `MYSQL_USER` | ✅ | `blog_user` | Uygulama veritabanı kullanıcısı. |
| `MYSQL_PASSWORD` | ✅ | `blog_password` | Uygulama kullanıcısı şifresi. |

### MinIO İçin

| Değişken | Gerekli | Örnek Değer | Açıklama |
|---|---|---|---|
| `MINIO_ROOT_USER` | ✅ | `minio_admin` | MinIO konsol giriş kullanıcı adı. |
| `MINIO_ROOT_PASSWORD` | ✅ | `minio_password` | MinIO konsol giriş şifresi (en az 8 karakter). |

### Frontend Değişkenleri

| Değişken | Gerekli | Örnek Değer | Açıklama |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Tarayıcının backend'e erişim adresi. Prodüksiyonda alan adınızla değiştirin (örn. `https://api.omervision.com`). |
| `INTERNAL_API_URL` | ✅ | `http://backend:8000` | Next.js'in sunucu tarafı (SSR) için backend adresi. Docker ağı içinde çözümlenir. **Değiştirmeyin.** |

---

## Güvenli Anahtar Üretimi

`SECRET_KEY` için güçlü ve rastgele bir değer üretmek amacıyla:

```bash
# Linux / macOS
openssl rand -hex 32

# Python ile (her sistemde)
python3 -c "import secrets; print(secrets.token_hex(32))"

# PowerShell (Windows)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Prodüksiyon Kontrol Listesi

- [ ] `SECRET_KEY` değiştirildi (en az 64 karakter)
- [ ] `MYSQL_ROOT_PASSWORD` güçlü bir şifreyle değiştirildi
- [ ] `MYSQL_PASSWORD` güçlü bir şifreyle değiştirildi
- [ ] `MINIO_ROOT_PASSWORD` güçlü bir şifreyle değiştirildi (en az 8 karakter)
- [ ] `NEXT_PUBLIC_API_URL` gerçek alan adına güncellendi
- [ ] Değişkenler `.env` dosyasından okunuyor, `docker-compose.yml` içine hardcode edilmedi
- [ ] `.env` dosyası `.gitignore`'a eklendi
