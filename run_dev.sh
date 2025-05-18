# Ensure Node.js and npm are installed
echo "🔍 Checking for Node.js and npm..."
if ! command -v npm >/dev/null 2>&1; then
  echo "📦 Installing Node.js and npm..."
  apt update && apt install -y nodejs npm
else
  echo "✅ Node.js and npm are already installed."
fi

cd frontend
npm install
npm run dev -- --host 0.0.0.0
