# Geliştirici İş Akışı (Developer Workflow)

---

## Genel Prensipler

- Tüm geliştirme Docker konteynerlerinde hot-reload ile yapılır.
- Backend `uvicorn --reload` ile çalışır; kod değişikliği anında yüklenir.
- Frontend `next dev` ile çalışır; kod değişikliği anında yüklenir.
- Her iki servisin kaynak klasörü (`./backend`, `./frontend`) Docker volume ile konteynere bind mount edilir.

```
Yerel disk: ./backend/*.py  ──bind──►  /app/*.py (konteyner içi)
Yerel disk: ./frontend/src  ──bind──►  /app/src  (konteyner içi)
```

---

## 1. Backend: Yeni Veritabanı Modeli Ekleme

Bu proje **Alembic kullanmamaktadır**. Şema yönetimi SQLAlchemy'nin `create_all` mekanizması ile yapılmaktadır.

### Adım 1: Modeli Tanımla

`backend/models.py` dosyasına yeni modelinizi ekleyin:

```python
class YeniModel(Base):
    __tablename__ = 'yeni_tablo'
    id = Column(MYSQL_INTEGER(unsigned=True), primary_key=True, autoincrement=True, index=True)
    baslik = Column(String(200), nullable=False)
    icerik = Column(Text)
    olusturulma = Column(DateTime, default=datetime.datetime.utcnow)
```

> **Kural:** Tüm primary key'ler `MYSQL_INTEGER(unsigned=True)` tipinde olmalıdır (mevcut yapıyla tutarlılık için).

### Adım 2: Schema Tanımla

`backend/schemas.py` dosyasına Pydantic şemalarını ekleyin:

```python
class YeniModelCreate(BaseModel):
    baslik: str
    icerik: Optional[str] = None

class YeniModelOut(BaseModel):
    id: int
    baslik: str
    icerik: Optional[str]
    olusturulma: datetime
    
    class Config:
        from_attributes = True
```

### Adım 3: Router Oluştur

`backend/routers/yenimodel.py` dosyası oluşturun ve `backend/main.py` içinde import edin:

```python
# main.py içinde
from routers import yenimodel
app.include_router(yenimodel.router)
```

### Adım 4: Tabloyu Oluştur

Backend zaten başlangıçta `Base.metadata.create_all` çalıştırır. Modeli `models.py`'a ekledikten sonra backend'i yeniden başlatmak yeterlidir:

```bash
docker compose restart backend
```

### Adım 5: Gerekli Migrasyonlar (Mevcut Tablo Değişikliği)

Eğer mevcut bir tabloya yeni sütun ekliyorsanız, `create_all` çalışmaz (yalnızca yeni tablolar oluşturur). Bu durumda manuel SQL çalıştırın:

```bash
docker exec blog_mysql mysql -u blog_user -pblog_password -e \
  "ALTER TABLE mevcut_tablo ADD COLUMN yeni_sutun VARCHAR(255) NULL;"
```

Veya `backend/migrate_db.py` dosyasına migrasyon ekleyin ve çalıştırın:

```bash
docker exec blog_backend python migrate_db.py
```

---

## 2. Frontend: Yeni Sayfa veya Bileşen Ekleme

### Sayfa Ekleme Standardı

Next.js App Router kullanılmaktadır. Yeni bir sayfa için:

```
frontend/src/app/
├── yeni-sayfa/
│   └── page.tsx        # Bu dosya /yeni-sayfa rotasını oluşturur
```

#### Sayfa Şablonu (Client Component)

```tsx
"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";

export default function YeniSayfaPage() {
  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
        <Container>
          <FadeIn>
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
              Sayfa Başlığı
            </h1>
          </FadeIn>
        </Container>
      </main>
      <Footer />
    </>
  );
}
```

#### Sayfa Şablonu (Server Component - SEO için)

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Adı | OmerVision",
  description: "Sayfa açıklaması.",
};

export default function YeniSayfaPage() {
  // ...
}
```

### Bileşen Ekleme Standardı

```
frontend/src/components/
├── ui/           # Genel UI bileşenleri (Button, Badge, Container vs.)
├── layout/       # Düzen bileşenleri (Navigation, Footer)
├── animation/    # Animasyon bileşenleri (FadeIn)
└── projects/     # Alana özgü bileşenler
```

Yeni bileşen dosyası (`PascalCase.tsx`):

```tsx
interface YeniBilesenProps {
  baslik: string;
  aciklama?: string;
}

export function YeniBilesen({ baslik, aciklama }: YeniBilesenProps) {
  return (
    <div className="...">
      <h2>{baslik}</h2>
      {aciklama && <p>{aciklama}</p>}
    </div>
  );
}
```

### API Entegrasyonu

Yeni bir API çağrısı `frontend/src/lib/api.ts` dosyasına eklenmelidir:

```typescript
// api.ts ApiClient sınıfı içine ekle
async getYeniVeri(): Promise<YeniTip[]> {
  return this.request<YeniTip[]>('/api/yeni-endpoint');
}
```

### Tasarım Sistemi Kuralları

| Kural | Açıklama |
|---|---|
| Renkler | CSS değişkenleri kullanın: `var(--color-bg-primary)`, `var(--color-text-primary)` vs. |
| Hareketler | Framer Motion + `springPresets` (`@/lib/animations`) |
| Tipografi | `font-bold`, `text-4xl` gibi Tailwind sınıfları |
| İkonlar | Sadece `lucide-react` paketi |
| Animasyonlu giriş | `<FadeIn>` bileşeni ile sarın |

---

## 3. PaaS Modülü: Güvenlik Ayarları ve Test

### Mevcut Güvenlik Kısıtlamaları

`backend/routers/paas.py` içindeki `run_container` fonksiyonu her konteynere şu sınırları uygular:

```python
docker_client.containers.run(
    image_name,
    detach=True,
    ports={f"{target_port}/tcp": host_port},
    mem_limit="256m",       # Maksimum 256 MB RAM
    cpu_quota=50000,        # Maksimum 50% CPU (100000 = tam çekirdek)
    restart_policy={"Name": "on-failure", "MaximumRetryCount": 3}
)
```

### Güvenlik Testleri

#### 1. RAM Limitini Test Et

```bash
# Konteyner başlatıldıktan sonra:
docker stats paas_app_<ID>

# LIMIT sütununda 256MiB görünmeli
# CONTAINER      MEM USAGE / LIMIT     CPU %
# paas_app_2     12.5MiB / 256MiB      0.5%
```

#### 2. CPU Limitini Test Et

```bash
docker inspect paas_app_<ID> | grep -i cpu
# "CpuQuota": 50000 görünmeli
```

#### 3. Ağ İzolasyonunu Test Et

PaaS konteynerleri ana Docker ağına (`app-network`) bağlı değildir, bu nedenle backend veya MySQL'e doğrudan erişemezler:

```bash
# Proje konteyneri ID'sini bul
docker ps | grep paas_app

# Ana ağa erişmeye çalış (başarısız olmalı)
docker exec <paas_container_id> curl http://172.19.0.1:8000/api/health
# Connection refused → İzolasyon çalışıyor ✓
```

#### 4. Yeni Güvenlik Kısıtlaması Eklemek

Konteynerlere eklenebilecek ek güvenlik ayarları:

```python
# Read-only root filesystem (salt okunur kök dosya sistemi)
docker_client.containers.run(
    image_name,
    read_only=True,                    # Root filesystem salt okunur
    tmpfs={'/tmp': 'size=64m'},       # tmp klasörü için yazılabilir alan
    mem_limit="256m",
    cpu_quota=50000,
    network_mode="none",               # Tamamen ağ yok (en kısıtlayıcı)
    cap_drop=["ALL"],                  # Tüm Linux yetenekleri kaldırılmış
    security_opt=["no-new-privileges=true"],
    restart_policy={"Name": "on-failure", "MaximumRetryCount": 3}
)
```

> **Not:** `network_mode="none"` ayarı konteynerin dış dünyaya bağlanamasını engeller. Yalnızca statik siteler için uygundur; API çağrısı yapan projeler için uygun değildir.

### Yeni Proje Tipi Desteği Eklemek

`paas.py` içindeki `detect_project_type` ve `generate_dockerfile` fonksiyonları genişletilebilir:

```python
# detect_project_type içine ekle
elif "Gemfile" in files:
    return "rails"
elif "go.mod" in files:
    return "go"

# generate_dockerfile içine ekle
elif project_type == "go":
    content = """FROM golang:1.21-alpine
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]"""
```

---

## 4. Geliştirme Akışı Özeti

```
1. Özellik Branch Oluştur
   git checkout -b feature/yeni-ozellik

2. Backend Değişikliği
   - models.py → model ekle
   - schemas.py → schema ekle
   - routers/yeni.py → endpoint ekle
   - main.py → router'ı dahil et
   - docker compose restart backend

3. Frontend Değişikliği
   - src/lib/api.ts → API metodu ekle
   - src/app/yeni-sayfa/page.tsx → sayfa oluştur
   - (Hot-reload otomatik çalışır)

4. Test
   - http://localhost:8000/docs → API'yi test et
   - http://localhost:3000 → UI'ı test et

5. Commit & Push
   git add .
   git commit -m "feat: yeni özellik eklendi"
   git push origin feature/yeni-ozellik
```
