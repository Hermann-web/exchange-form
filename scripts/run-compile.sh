docker run --rm -v $PWD:/app -w /app -p 5174:5173 -u $(id -u):$(id -g)  node:22 bash -c "npm ci && npm run dev"

