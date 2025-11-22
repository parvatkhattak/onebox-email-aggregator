# 🚀 Deployment Guide for Onebox Email Aggregator

This guide outlines the recommended deployment strategy using **Docker Compose** on a Virtual Private Server (VPS). This is the most robust method as it handles the application, database (Elasticsearch), and frontend in a single orchestrated environment.

## 📋 Recommended Infrastructure

- **Provider**: DigitalOcean (Droplet), AWS (EC2), Hetzner, or Linode.
- **Specs**: Minimum 4GB RAM (Elasticsearch is memory intensive). 2 vCPUs recommended.
- **OS**: Ubuntu 22.04 LTS or latest Debian.

---

## 🛠️ Step-by-Step Deployment

### 1. Provision Your Server
1. Create a new VPS instance.
2. SSH into your server:
   ```bash
   ssh root@your_server_ip
   ```

### 2. Install Docker & Docker Compose
Run the following commands to install Docker:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

### 3. Clone the Repository
```bash
git clone https://github.com/parvatkhattak/onebox-email-aggregator.git
cd onebox-email-aggregator
```

### 4. Configure Environment Variables
Create the production `.env` file. You can copy the example or create new:

```bash
nano .env
```

**Paste the following (update with your real values):**
```env
# Server Port (Internal Docker Port)
PORT=3000

# Domain Configuration (Update this to your domain or IP)
FRONTEND_URL=http://your_server_ip:80

# Elasticsearch (Internal Docker Networking)
ELASTICSEARCH_URL=http://elasticsearch:9200

# Google Gemini AI Key
GEMINI_API_KEY=your_actual_gemini_api_key

# Security
ENCRYPTION_KEY=generate_a_secure_32_char_key_here
```

### 5. Configure Docker Compose for Production
Create a `docker-compose.prod.yml` (or use the existing one if suitable, but here is a production-ready config):

```yaml
version: '3.8'

services:
  # Backend Service
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - FRONTEND_URL=${FRONTEND_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - elasticsearch
    restart: always

  # Frontend Service (Served via Nginx or simple serve)
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: always

  # Database Service
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g" # Limit memory usage
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    restart: always

volumes:
  es_data:
```

### 6. Create Dockerfiles (If not present)

**Backend `Dockerfile` (in root):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend `frontend/Dockerfile`:**
```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend `frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### 7. Start the Application
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 8. Verification
- Open `http://your_server_ip` in your browser.
- The app should be live!

---

## 🔒 Security Tips for Production

1.  **Firewall**: Enable UFW and allow only necessary ports.
    ```bash
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw enable
    ```
2.  **SSL/HTTPS**: Use a reverse proxy like **Nginx** with **Certbot** or **Caddy** to serve your app over HTTPS.
3.  **Elasticsearch**: In a real production environment, do not expose port 9200 to the public internet. Keep it internal to the Docker network.
