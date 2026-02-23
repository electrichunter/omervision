# Hafif bir Python imajı kullanıyoruz
FROM python:3.10-slim

# Gerekli sistem paketlerini yükle (magic numara kontrolü için libmagic-dev)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic-dev git docker.io docker-compose \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizini
WORKDIR /app

# Güvenlik: non-root kullanıcı oluştur
RUN useradd -m appuser && chown -R appuser /app

# Önbellekleme mantığı: Önce requirements kopyalanır
COPY requirements.txt .

# Bağımlılıkları yükle
RUN pip install --no-cache-dir -r requirements.txt

# Kalan kodları kopyala
COPY . .
RUN chown -R appuser /app

# Güvenlik ve Socket Yetkesi için root kalması PaaS operasyonlarında gereklidir (kaldırıldı)
USER appuser

# FastAPI'yi başlat (Hot-reload açık)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]