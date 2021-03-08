## Use Ionic base image
FROM beevelop/ionic:latest AS ionic

# Create app directory in Docker
WORKDIR /usr/frontend-ionic

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install all dependencies in Docker
RUN npm ci

# Copy app from local environment into the Docker image
COPY . .

# Build the app
RUN ionic build --prod

## From a clean nginx base image
FROM nginx:stable

# Copy the app build contents to Nginx
COPY --from=ionic  /usr/frontend-ionic/www /usr/share/nginx/html

# Copy the Ngix configuration file to Nginx
COPY --from=ionic /usr/frontend-ionic/nginx.conf /etc/nginx/nginx.conf