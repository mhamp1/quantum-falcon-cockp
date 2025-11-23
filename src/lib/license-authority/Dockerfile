# LICENSE AUTHORITY v2: Docker deployment
FROM python:3.10-slim

LABEL maintainer="mhamp1trading@yahoo.com"
LABEL description="Quantum Falcon License Authority v2.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install the package
RUN pip install -e .

# Create directory for database and keys
RUN mkdir -p /root/.mhamp1_licenseauthority

# Initialize on first run (will skip if already exists)
RUN python -m mhamp1_licenseauthority.cli init || true

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health').raise_for_status()"

# Run API server
CMD ["python", "-m", "mhamp1_licenseauthority.api"]
