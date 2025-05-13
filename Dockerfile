# -------- Frontend build stage --------
    FROM node:20-alpine AS frontend

    WORKDIR /app/frontend
    COPY frontend/ ./
    
    RUN npm install && npm run build
    
    # -------- Backend + final image --------
    FROM python:3.11-slim AS backend
    
    WORKDIR /app
    
    # Copy backend
    COPY app/ ./app/
    COPY models/ ./models/
    COPY requirements.txt .


    # Copy frontend build output from previous stage
    COPY --from=frontend /app/frontend/dist ./frontend/dist
    
    # Install dependencies
    RUN pip install --no-cache-dir -r requirements.txt
    
    ENV PORT=5010
    EXPOSE ${PORT}
    ENV PYTHONUNBUFFERED=1
    
    # Start FastAPI
    CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5010"]
    