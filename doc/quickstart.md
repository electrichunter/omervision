# Hızlı Başlangıç (Quick Start)

Bu rehber, sıfırdan sistemi ayağa kaldırmak için gereken minimum adımları içerir.

---

## Adım 1 — Depoyu Klonla

```bash
git clone https://github.com/electrichunter/omervision.git
cd omervision
```

---

## Adım 2 — Ortam Değişkenlerini Ayarla

```bash
# .env.example'ı kopyalayarak .env oluşturun
cp .env.example .env
```

Ardından `.env` dosyasını bir text editörüyle açıp **kritik değişkenleri** değiştirin (en azından `SECRET_KEY`). Detaylar için [environment.md](./environment.md) dosyasına bakın.

> **Windows PowerShell için:**
> ```powershell
> Copy-Item .env.example .env
> ```

---

## Adım 3 — Sistemi Başlat

```bash
docker compose up --build -d
```

Bu komut:
1. Tüm Docker image'larını build eder (ilk seferde 5–10 dakika sürebilir)
2. MySQL, Redis, MinIO, Backend, Frontend ve phpMyAdmin konteynerlerini başlatır
3. Konteynerler arası sağlık kontrollerini bekler
4. Backend, MySQL hazır olana kadar otomatik olarak yeniden bağlantı dener (10 deneme × 3 saniye)

---

## Adım 4 — Sistemi Doğrula

Aşağıdaki adreslere tarayıcınızdan erişerek sistemin çalıştığını doğrulayın:

```
Frontend  →  http://localhost:3000
Backend   →  http://localhost:8000/api/health
Swagger   →  http://localhost:8000/docs
MinIO     →  http://localhost:9001
phpMyAdmin→  http://localhost:8080
```

Backend sağlık kontrolü başarılı yanıtı:
```json
{ "status": "ok", "service": "backend", "maintenance": false }
```

---

## Adım 5 — İlk Admin Kullanıcısı

Sistem ilk başlatıldığında `seed_rbac.py` betiği otomatik çalışarak varsayılan rolleri (admin, user) oluşturur.

İlk admin kullanıcısını oluşturmak için kayıt olun ve ardından phpMyAdmin veya aşağıdaki komutla rolünü admin yapın:

```bash
docker exec blog_mysql mysql -u blog_user -pblog_password -e \
  "USE blog_db; UPDATE users SET role_id = (SELECT id FROM roles WHERE slug='admin') WHERE email='sizin@email.com';"
```

---

## Yararlı Docker Komutları

```bash
# Tüm konteynerlerin durumunu gör
docker compose ps

# Tüm logları canlı izle
docker compose logs -f

# Sadece backend loglarını izle
docker logs blog_backend -f

# Sistemi durdur (veri kaybolmaz)
docker compose stop

# Sistemi tamamen kaldır (veri dahil!)
docker compose down -v

# Sadece backend konteynerini yeniden başlat
docker compose restart backend

# Sadece backend image'ını yeniden build et
docker compose build backend && docker compose up -d backend
```

---

## Sorun Giderme

### Backend "ECONNREFUSED" hatası alıyorum
Backend, MySQL tam ayağa kalkmadan başlamaya çalışmış olabilir. Otomatik yeniden deneme mekanizması mevcuttur, ancak yine de hata alırsanız:
```bash
docker compose restart backend
```

### Frontend sayfalar yüklenmiyor
```bash
docker logs blog_frontend --tail 50
```

### MySQL'e bağlanamıyorum
```bash
docker exec blog_mysql mysqladmin -u root -prootpassword ping
```

### PaaS modülü Docker image build edemiyor
Backend konteyneri Docker socket'e erişemiyor olabilir. Kontrol edin:
```bash
docker exec blog_backend docker ps
```
Hata alıyorsanız `/var/run/docker.sock` bağlamını `docker-compose.yml` içinde kontrol edin.
