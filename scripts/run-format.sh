sudo docker run --rm -v $PWD:/app -w /app -u $(id -u):$(id -g) node:22 sh -c "npm ci && npm run format"
