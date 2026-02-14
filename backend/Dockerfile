# Hafif bir Python imajı kullanıyoruz
FROM python:3.10-slim

# Çalışma dizini
WORKDIR /app

# Önbellekleme mantığı: Önce requirements kopyalanır
COPY requirements.txt .

# Bağımlılıkları yükle
RUN pip install --no-cache-dir -r requirements.txt

# Kalan kodları kopyala
COPY . .

# FastAPI'yi başlat (Hot-reload açık)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]