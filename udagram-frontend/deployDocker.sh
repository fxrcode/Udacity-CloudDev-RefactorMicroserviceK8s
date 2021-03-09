docker build -t udagram-frontend .
docker tag udagram-frontend ctala/udagram-frontend:latest
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push ctala/udagram-frontend