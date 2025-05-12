# Use a lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV LANG=C.UTF-8

# Install required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential libffi-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy app files (including gmail_service.py, main.py, static/, etc.)
COPY app /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt

# Copy startup script
COPY run.sh /run.sh
RUN chmod +x /run.sh

# Expose app port
EXPOSE 5010

# Run the app
CMD ["/run.sh"]
