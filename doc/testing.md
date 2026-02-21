# Test Otomasyonu Rehberi (Testing Guide)

OmerVision projesinde hem backend hem de frontend için test altyapısı mevcuttur. Kaliteyi korumak için yeni özellik eklendiğinde test yazılması önerilir.

---

## 1. Backend Testleri (Pytest)

Backend testleri `backend/tests/` klasöründe bulunur ve `pytest` kütüphanesini kullanır.

### Testleri Çalıştırma (Konteyner İçinde)
Backend konteyneri çalışırken şu komutu kullanın:
```bash
docker exec blog_backend pytest
```

### Belirli bir dosyayı test etme
```bash
docker exec blog_backend pytest tests/test_health.py
```

### Önemli Dosyalar
- `backend/tests/conftest.py`: Test veritabanı (SQLite memory veya geçici DB) ve async client ayarlarını içerir.
- `backend/tests/test_health.py`: Sistemin temel yaşam kontrolünü test eder.

---

## 2. Frontend Testleri (Jest & RTL)

Frontend testleri `jest` ve `React Testing Library (RTL)` kütüphanelerini kullanır.

### Testleri Çalıştırma (Konteyner İçinde)
```bash
docker exec blog_frontend npm test
```

### İzleme Modunda Çalıştırma (Geliştirme Sırasında)
```bash
docker exec -it blog_frontend npm test -- --watch
```

---

## 3. CI/CD Entegrasyonu (GitHub Actions)

Proje her `push` edildiğinde otomatik testlerin çalışması için `.github/workflows/test.yml` (eğer yoksa oluşturulmalıdır) dosyası kullanılabilir.

### Örnek İş Akışı Mantığı
1. Bağımlılıkları yükle (`requirements.txt` ve `package.json`).
2. Backend testlerini `pytest` ile çalıştır.
3. Frontend build'ini ve testlerini çalıştır.
4. PaaS modülü için Docker kurulu bir runner kullan.

---

## 4. Test Yazma Standartları

- **Unit Testler:** Sadece bir fonksiyonu veya bileşeni dış dünyadan izole test edin.
- **Integration Testler:** API endpoint'lerinin veritabanı ile doğru haberleştiğini doğrulayın.
- **E2E Testler (Gelecek):** Playwright veya Cypress ile tam kullanıcı deneyimi testleri eklenebilir.

> **Not:** PaaS modülü dinamik konteynerler ürettiği için, bu modülün testleri sırasında sistemde Docker daemon'ın aktif olması şarttır.
