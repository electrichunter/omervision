# API Referansı ve Mimari Mantık

Bu belge, OmerVision backend API'sinin çalışma prensiplerini ve frontend ile güvenli iletişim kurma yöntemini açıklar.

---

## 1. Kimlik Doğrulama (Authentication) Akışı

OmerVision, **Double Token (Access + Refresh)** ve **HttpOnly Cookie** mekanizmasını kullanır. Bu yapı, XSS (Cross-Site Scripting) saldırılarına karşı güvenlidir.

### Giriş Süreci
1. Kullanıcı `/api/auth/login` endpoint'ine `email` ve `password` ile istek atar.
2. Backend doğrulamayı yapar ve iki token üretir:
   - **Access Token:** Kısa ömürlü (15 dk), içeriği şifrelenmiş.
   - **Refresh Token:** Uzun ömürlü (7 gün), veritabanında saklanır.
3. Bu token'lar yan yana JSON olarak dönmek yerine, tarayıcıya **HttpOnly ve SameSite=Lax/Strict** özellikli cookie'ler olarak kaydedilir.
   - *Not:* JavaScript bu cookie'leri okuyamaz, sadece tarayıcı backend isteklerine otomatik ekler.

### Token Yenileme
Access token süresi dolduğunda, frontend otomatik olarak `/api/auth/refresh` endpoint'ini çağırır. Eğer Refresh Token geçerliyse yeni bir Access Token üretilir.

---

## 2. Next.js ile API İletişimi

Projede iki farklı iletişim senaryosu vardır:

### Senaryo A: Client-Side Fetching (Tarayıcıdan)
Kullanıcı etkileşimi (örn: yorum yapma, proje başlatma) sırasında kullanılır.
- **URL:** `NEXT_PUBLIC_API_URL` (örn: `http://localhost:8000`)
- **Güvenlik:** Tarayıcı, auth cookie'lerini otomatik olarak isteğe ekler (`credentials: 'include'`).

### Senaryo B: Server-Side Rendering — SSR (Next.js Sunucusundan)
Sayfa ilk yüklendiğinde verilerin backend'den çekilmesi için kullanılır.
- **URL:** `INTERNAL_API_URL` (örn: `http://backend:8000`)
- **Neden:** Docker ağı içinde konteynerler arası iletişim daha hızlıdır ve dışarıya kapalıdır.
- **Header İletimi:** Next.js sunucusu, tarayıcıdan gelen cookie'leri backend'e manuel olarak iletmelidir ki backend isteği yapanın kim olduğunu bilsin.

---

## 3. PaaS API Mantığı

PaaS modülü izole çalıştığı için bazı endpoint'ler arka planda uzun süreli işlemler başlatır:

- **Deployment (`POST /api/paas`):** Bir "Background Task" başlatır. Hemen 202 Accepted döner, ancak build işlemi arkada devam eder.
- **Log Takibi (`GET /api/paas/{id}/logs`):** Konteynerin canlı loglarını veri tabanından anlık okur.
- **Port Yönetimi:** Sistem boş bir portu (`find_available_port`) bulur ve hem tabloya kaydeder hem de Docker'a `ports={...}` olarak geçer.

---

## 4. Swagger Dokümantasyonu

Tüm method, parametre ve şema detayları için canlı dökümantasyona erişebilirsiniz:
- **URL:** http://localhost:8000/docs
- **Alternatif:** http://localhost:8000/redoc
