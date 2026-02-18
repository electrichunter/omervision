# 📚 Proje Dokümantasyonu

Bu klasör, OmerVision Blog & Portfolio projesinin teknik dokümantasyonlarını içerir.

## 📄 Dokümanlar

### 1. [Teknolojiler](teknolojiler.md)
Proje genelinde kullanılan teknolojilerin ve mimarinin detaylı açıklaması.

### 2. [Frontend Geliştirme](frontend-gelistirme.md)
Frontend tarafında yapılan tüm geliştirmeler:
- Next.js 16 kurulumu
- Bileşen yapısı
- Animasyonlar
- Responsive tasarım
- Türkçe-only yapılandırma

### 3. [Backend Geliştirme](backend-gelistirme.md)
Backend API geliştirmesi:
- FastAPI kurulumu
- Endpoint'ler
- Kimlik doğrulama (JWT)
- MySQL 9.0 entegrasyonu
- Rol tabanlı yetkilendirme (RBAC)

### 4. [API Dokümantasyonu](api-dokumantasyonu.md)
REST API endpoint'lerinin detaylı dokümantasyonu:
- Tüm endpoint'ler
- Request/Response örnekleri
- Yetkilendirme kuralları
- Hata kodları

## 🎯 Proje Özeti

**OmerVision**, modern bir blog ve portfolio platformudur.

### Teknoloji Stack:
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion
- **Backend:** FastAPI, SQLAlchemy, MySQL 9.0, Redis
- **Kimlik Doğrulama:** JWT, bcrypt
- **Yetkilendirme:** Rol tabanlı (RBAC)

### Rol Yapısı:
1. 👑 **Admin** - Tam yetki
2. ✏️ **Editor** - İçerik yönetimi
3. 📝 **Author** - Yazı oluşturma
4. 👀 **Reader** - Sadece okuma (varsayılan)

## 🚀 Başlatma

### Geliştirme:
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Docker:
```bash
docker-compose up -d
```

## 📞 İletişim

**Proje Sahibi:** Ömer Faruk
**Email:** admin@omerfaruk.vision
**Website:** http://omerfaruk.vision

---

*Son Güncelleme: 16 Şubat 2026*
