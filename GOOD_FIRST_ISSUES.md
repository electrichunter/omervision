# Good First Issues / İlk Katkı Fırsatları

Aşağıda projenize yeni katkıda bulunmak isteyen geliştiriciler (open source contributors) için GitHub "Issues" kısmına açabileceğiniz 5 adet "Good First Issue" önerisi bulunmaktadır. Bunları doğrudan kopyalayıp GitHub'da issue olarak açabilirsiniz.

---

## 1. [Frontend] "Yukarı Çık" (Scroll to Top) Butonu Ekleme

**Etiketler:** `good first issue`, `frontend`, `enhancement`

**Açıklama:**
Kullanıcı deneyimini artırmak için uzun sayfalarda (örneğin blog yazıları veya proje listesi) çalışacak bir "Yukarı Çık" butonu eklemeliyiz.
- Kullanıcı sayfayı belirli bir miktar (örneğin 300px) aşağı kaydırdığında sağ alt köşede görünür olmalı.
- Tıklandığında sayfayı yumuşak bir animasyonla (smooth scroll) en üste taşımalıdır.
- Framer Motion ve Tailwind CSS kullanılarak projeyle uyumlu şık bir tasarım yapılabilir.

**Beklenen Çıktı:**
Tüm sayfalarda (veya sadece uzun sayfalarda) çalışan, projenin karanlık/aydınlık temasıyla uyumlu bir buton komponenti.

---

## 2. [Backend] API Endpointleri için Swagger Dökümantasyonunu Geliştirme

**Etiketler:** `good first issue`, `backend`, `documentation`, `fastapi`

**Açıklama:**
Şu anda API'miz (`/docs`) çalışıyor ancak endpoint'lerin açıklamaları yetersiz. FastAPI'nin sunduğu harika Swagger UI özelliklerinden daha fazla faydalanmalıyız.
- Rotlardaki (routers) endpoint'lere `summary`, `description` ve varsa `response_description` parametreleri eklenmeli.
- Hangi endpoint'in ne işe yaradığı, hangi parametreleri aldığı OpenAPI standartlarına uygun olarak detaylandırılmalı.

**Beklenen Çıktı:**
`/docs` adresine girildiğinde yetkilendirme, blog ve proje endpointlerinin hepsinin detaylı ve anlaşılır bir şekilde belgelenmiş olması.

---

## 3. [Frontend] Liste Sayfaları İçin Skeleton Yükleyiciler (Loaders) Ortaya Çıkarma

**Etiketler:** `good first issue`, `frontend`, `ui/ux`

**Açıklama:**
Mevcut durumda veritabanından projeler veya blog yazıları çekilirken ekranda basit bir "Yükleniyor..." metni veya spinner görünüyor olabilir. Bunu daha modern bir hale getirmek istiyoruz.
- Blog listesi, proje listesi ve detay sayfaları yüklenirken Tailwind'in `animate-pulse` sınıfını kullanan Skeleton yapılar eklenmeli.
- Veri gelene kadar gerçek kartların şekline bürünen gri/koyu tonlarda yer tutucular görünmeli.

**Beklenen Çıktı:**
Gecikmeli ağ bağlantılarında kullanıcıya sayfa düzenini önceden hissettiren şık yükleme (skeleton) animasyonları.

---

## 4. [Araçlar] Kod Formatlama İçin Pre-commit Hook Ekleme

**Etiketler:** `good first issue`, `tooling`, `devops`

**Açıklama:**
Projeye katkıda bulunan herkesin aynı kod standartlarına uymasını sağlamak için git `pre-commit` hook'larına ihtiyacımız var.
- Proje ana dizininde bir `.pre-commit-config.yaml` dosyası oluşturulmalı.
- Python kodları için `black` ve `isort`.
- Frontend (TS/JS/CSS) kodları için `prettier` çalışacak şekilde yapılandırılmalı.

**Beklenen Çıktı:**
Herhangi bir PR veya commit öncesinde kodların otomatik formatlanarak depoya temiz kod gönderilmesinin garanti altına alınması.

---

## 5. [Backend] `/health` (Sağlık Kontrolü) Endpointi Ekleme

**Etiketler:** `good first issue`, `backend`, `fastapi`

**Açıklama:**
Sistemin doğru çalışıp çalışmadığını, Docker konteynerlerinin ayakta olup olmadığını kontrol edebilmek için basit bir sağlık kontrolü rotasına ihtiyacımız var.
- `main.py` içerisine dışa açık, kimlik doğrulama gerektirmeyen bir `GET /health` endpointi eklenmeli.
- Bu endpoint sadece uygulamanın durumunu (örneğin: `{"status": "ok", "version": "1.0.0"}`) JSON olarak dönmeli. (İleri seviyede DB ve Redis bağlantısı test edilebilir ama başlangıç için basit bir yanıt yeterli).

**Beklenen Çıktı:**
Tarayıcıdan `/health` adresine gidildiğinde sistemin ayakta olduğunu gösteren statik bir JSON yanıtı alınması.
