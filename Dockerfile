FROM python:3.11-slim

ENV LANG=C.UTF-8

RUN apk add --no-cache python3 py3-pip build-base libffi-dev

WORKDIR /app

COPY requirements.txt ./
RUN pip install --break-system-packages -r requirements.txt

COPY run.sh /run.sh
RUN chmod a+x /run.sh

COPY app /app

CMD [ "/run.sh" ]

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

COPY app/static ./static

# Copy requirements and install Python packages
COPY requirements.txt ./
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy all app files and startup script
COPY . .


# Make sure run.sh is executable
RUN chmod +x run.sh

# Expose the correct port
EXPOSE 5010

# Start the FastAPI app
CMD ["./run.sh"]
