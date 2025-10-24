FROM python:3.12-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-ara \
    ocrmypdf ghostscript qpdf pngquant \
    poppler-utils libgl1 \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt \
  && pip install --no-cache-dir pytest==8.3.3
COPY worker /app/worker
COPY tests /app/tests
COPY pytest.ini /app/pytest.ini
CMD ["python", "-m", "worker.run"]
