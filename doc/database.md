# Veritabanı Yönetimi (Database Management)

Bu proje ana veritabanı olarak **MySQL 9.0** kullanmaktadır.

---

## 1. Veritabanı Şeması ve Modeller

Şemalar `backend/models.py` dosyasında SQLAlchemy modelleri olarak tanımlanmıştır.

- **Tablolar:** `users`, `roles`, `projects`, `blogs`, `newsletter_subscriptions`, `comments`, `paas_projects`.
- **Otomatik Oluşturma:** Uygulama her başladığında `database.py` içindeki `init_db()` fonksiyonu, eğer tablolar yoksa `Base.metadata.create_all` komutuyla tabloları otomatik oluşturur.

---

## 2. Şema Değişiklikleri ve Migration

Projede henüz Alembic entegrasyonu bulunmamaktadır. Mevcut tablolar üzerinde yapılacak küçük değişiklikler (sütun tipi değiştirme, yeni sütun ekleme) için şu yöntemler kullanılır:

### Yöntem A: Manuel SQL (Önerilen)
Küçük değişiklikler için phpMyAdmin veya `docker exec` ile SQL çalıştırın:
```bash
docker exec blog_mysql mysql -u blog_user -p$MYSQL_PASSWORD -e \
"USE blog_db; ALTER TABLE blogs ADD COLUMN summary TEXT;"
```

### Yöntem B: Migration Script
`backend/migrate_db.py` dosyasına async SQL komutları ekleyerek çalıştırın:
```bash
docker exec blog_backend python migrate_db.py
```

---

## 3. Yedekleme (Backup) ve Geri Yükleme (Restore)

Verilerinizin güvenliği için düzenli yedek almanız önerilir.

### Yedek Alma (Export)
```bash
docker exec blog_mysql mysqldump -u blog_user -p$MYSQL_PASSWORD blog_db > backup_$(date +%F).sql
```

### Yedeği Geri Yükleme (Import)
```bash
cat backup_dosyasi.sql | docker exec -i blog_mysql mysql -u blog_user -p$MYSQL_PASSWORD blog_db
```

---

## 4. phpMyAdmin Erişimi

Görsel bir veritabanı yönetimi için **http://localhost:8080** adresini kullanabilirsiniz.
- **Kullanıcı:** `.env` dosyasındaki `MYSQL_USER`
- **Şifre:** `.env` dosyasındaki `MYSQL_PASSWORD`

---

## 5. Kritik Modeller Arası İlişkiler
- `User` -> `Role`: Çoktan teke (Her kullanıcının bir rolü vardır).
- `User` -> `PaaSProject`: Bir kullanıcının birden fazla PaaS projesi olabilir.
- `Blog` -> `Comment`: Bir blog yazısına birden fazla yorum yapılabilir.
