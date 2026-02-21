# Ön Koşullar (Prerequisites)

Bu proje **tamamen Docker üzerinde** çalışmaktadır. Makineye herhangi bir dil çalışma zamanı (Python, Node.js) veya veritabanı kurmanıza **gerek yoktur**.

---

## Gerekli Araçlar

### 1. Docker Engine

| Özellik | Minimum Sürüm | Tavsiye Edilen |
|---|---|---|
| Docker Engine | 24.x | 26.x ve üzeri |
| Docker Compose | 2.20.x | 2.27.x ve üzeri |

#### Windows için Kurulum
Docker Desktop indirin ve kurun:
```
https://www.docker.com/products/docker-desktop/
```

> ⚠️ **Windows Notu:** Docker Desktop kurulumu sırasında **"Use WSL 2 based engine"** seçeneğini etkin bırakın. Bu, Linux container desteği için zorunludur.

#### Linux için Kurulum
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### macOS için Kurulum
```
https://www.docker.com/products/docker-desktop/
```

---

## Sürüm Doğrulama

Kurulumdan sonra aşağıdaki komutlarla doğrulama yapın:

```bash
# Docker Engine sürümü
docker --version
# Beklenen çıktı örneği: Docker version 26.1.4, build 5650f9b

# Docker Compose sürümü
docker compose version
# Beklenen çıktı örneği: Docker Compose version v2.27.1

# Docker daemon çalışıyor mu?
docker ps
# Hata vermemesi gerekiyor
```

---

## Sistem Gereksinimleri (Donanım)

| Bileşen | Minimum | Tavsiye |
|---|---|---|
| RAM | 4 GB | 8 GB |
| Disk | 10 GB boş alan | 20 GB |
| İşlemci | 2 çekirdek | 4 çekirdek |

> **PaaS modülü** her yeni proje dağıtımında yeni bir Docker image build ettiği için ek disk alanı kullanır. Her image ortalama 500 MB–1.5 GB arasında yer kaplar.

---

## İsteğe Bağlı Araçlar

Geliştirme sırasında kullanışlı olabilecek ek araçlar:

| Araç | Amaç | Link |
|---|---|---|
| Git | Repo klonlama ve versiyon takibi | https://git-scm.com |
| VS Code | Kod editörü | https://code.visualstudio.com |
| TablePlus / DBeaver | MySQL veritabanı GUI | https://tableplus.com |
| Redis Insight | Redis GUI izleme | https://redis.com/redis-enterprise/redis-insight |

