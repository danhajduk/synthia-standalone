#!/bin/bash

IMAGE_NAME="synthia"
CONTAINER_NAME="synthia"
PORT=5010



echo "🛑 Stopping old container..."
sudo docker rm -f $CONTAINER_NAME 2>/dev/null

echo "🔨 Building Docker image..."
sudo docker build -t $IMAGE_NAME .

echo "🚀 Starting container..."
sudo docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:$PORT \
  -p 3000:3000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e OPENAI_ADMIN_API_KEY="$OPENAI_ADMIN_API_KEY" \
  -v $(pwd)/data:/data \
  -v $(pwd)/frontend:/frontend \
  $IMAGE_NAME

echo "✅ Done. Synthia is running at: http://10.0.0.100:$PORT"
echo "📜 Showing logs (Press CTRL+C to stop)..."
# sleep 2
sudo docker logs -f $CONTAINER_NAME
