# Canlıya Alma Rehberi (Deployment Guide)

Bu rehber, OmerVision projesini yerel cihazınızdan bir VPS (Virtual Private Server) üzerine taşırken izlemeniz gereken adımları içerir.

---

## 1. Sunucu Hazırlığı (VPS)

Temiz bir Ubuntu (22.04 veya 24.04 LTS) sunucusu üzerine kurulum tavsiye edilir.

### Temel Güvenlik ve UFW Ayarları
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install ufw -y

# İzin verilen portlar
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Docker Kurulumu
[Prerequisites.md](./prerequisites.md) dosyasındaki adımları sunucuda uygulayın.

---

## 2. Projenin Dağıtımı

### Klonlama ve Ayarlar
```bash
git clone https://github.com/electrichunter/omervision.git /opt/omervision
cd /opt/omervision

# Üretim ortamı için .env dosyasını hazırlayın
cp .env.example .env
nano .env
```
> **KRİTİK:** `NEXT_PUBLIC_API_URL` değişkenini gerçek alan adınızla (örn: `https://api.omervision.io`) güncelleyin.

### Başlatma
```bash
docker compose up -d --build
```

---

## 3. Reverse Proxy (Nginx)

Tüm trafiği 80/443 portlarından Docker konteynerlerine yönlendirmek için Nginx kullanılması önerilir.

### Nginx Kurulumu
```bash
sudo apt install nginx -y
```

### Konfigürasyon Örneği (`/etc/nginx/sites-available/omervision`)
```nginx
server {
    listen 80;
    server_name omervision.io www.omervision.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.omervision.io;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. SSL Sertifikası (HTTPS)

Let's Encrypt kullanarak ücretsiz SSL sertifikası alın.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d omervision.io -d www.omervision.io -d api.omervision.io
```

Certbot otomatik olarak Nginx dosyalarınızı HTTPS yönlendirmesi ekleyerek güncelleyecektir.

---

## 5. PaaS Modülü İçin Özel Notlar

PaaS modülü Docker socket'i kullandığı için, ana backend konteynerinin çalıştığı sunucuda Docker daemon'a erişimi olması gerekir. `docker-compose.yml` içindeki `/var/run/docker.sock` bağlamı bu nedenle kritiktir.

**Güvenlik:** PaaS projeleri rastgele portlara bind edilir. Eğer bu projelere dışarıdan erişmek istiyorsanız, güvenlik duvarından (UFW) ilgili port aralığını açmanız veya Nginx üzerinde bir `stream` proxy konfigürasyonu yapmanız gerekebilir.

---

## 6. Bakım ve Güncelleme

Yeni bir kod push edildiğinde sunucuda güncelleme:
```bash
git pull origin main
docker compose up -d --build
```
