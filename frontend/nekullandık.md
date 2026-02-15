# Proje Teknolojileri ve Kullanım Rehberi (nekullandık.md)

Bu proje, modern ve ölçeklenebilir bir web uygulaması mimarisi üzerine inşa edilmiştir.

## 🛠 Kullanılan Teknolojiler

### Frontend (İstemci Tarafı)
- **Next.js 16 (App Router)**: React tabanlı framework. SEO dostu ve hızlı.
- **Tailwind CSS**: Hızlı ve esnek stillendirme için.
- **React Quill**: Zengin metin editörü (WYSIWYG) için. Yazarların içerik oluşturmasını sağlar.
- **Tremor / Recharts**: Dashboard veri görselleştirmesi için component kütüphanesi.
- **Lucide React**: Modern ve hafif ikon seti.
- **Axios**: Backend ile HTTP istekleri için.
- **Zustand / Context API**: (Planlanan) State yönetimi için.

### Backend (Sunucu Tarafı)
- **FastAPI**: Python tabanlı, çok hızlı, asenkron web framework. Swagger dokümantasyonu yerleşiktir.
- **SQLAlchemy (ORM)**: Veritabanı işlemleri için.
- **Pydantic**: Veri doğrulama (Validation) için.
- **MySQL / PostgreSQL**: İlişkisel veritabanı.
- **Redis**: Önbellekleme (Caching) ve hızlı veri erişimi için.
- **Docker**: Uygulamanın her ortamda aynı çalışmasını sağlayan konteynerizasyon.

## 🔐 Rol Tabanlı Erişim Kontrolü (RBAC)

Sistemde 4 temel rol bulunmaktadır. `minRole` mantığı ile çalışır (ID küçüldükçe yetki artar):

1. **Admin (ID: 1)**: Her yere erişebilir. Kullanıcıları yönetir.
2. **Editor (ID: 2)**: İçerikleri düzenleyebilir, yayına alabilir.
3. **Writer (ID: 3)**: Kendi yazılarını oluşturabilir.
4. **Reader (ID: 4)**: Sadece içerikleri okuyabilir.

### Güvenlik Akışı
- Frontend'de `RoleGuard` componenti ile sayfalar korunur.
- Backend'de `Depends` ve JWT token içindeki `role` bilgisi ile endpoint'ler korunur.

## 🚀 Kurulum & Çalıştırma

Tüm yapı Docker üzerinde çalışacak şekilde ayarlanmıştır.

```bash
docker-compose up --build
```

Frontend: `http://localhost:3000`
Backend Docs: `http://localhost:8000/docs`
