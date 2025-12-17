# Realtime Quick Commerce

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Docker Configuration](#docker-configuration)
- [Hosting & Deployment](#hosting--deployment)

---

## Project Overview

Realtime Quick Commerce is a full-stack application designed to facilitate real-time order management for customers, store owners, delivery partners, and administrators. The system supports role-based dashboards, live order updates via WebSockets, and a scalable backend architecture.

### Key Features

- **Real-time Order Updates:** Live updates using WebSocket (Socket.IO)
- **Role-Based Dashboards:** Separate interfaces for customers, stores, delivery partners, and admins
- **Secure Authentication:** JWT-based authentication system
- **Scalable Architecture:** Designed for horizontal scaling with Redis
- **Containerized Deployment:** Docker and Docker Compose ready
- **Modern Tech Stack:** Next.js, Node.js, MongoDB, Redis

---

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          CLIENT LAYER                                   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Customer   │  │ Store Owner  │  │   Delivery   │  │   Admin    │ │
│  │  Dashboard   │  │  Dashboard   │  │   Partner    │  │ Dashboard  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                  │                 │        │
│         └─────────────────┴──────────────────┴─────────────────┘        │
│                                    │                                    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │      Next.js Frontend           │
                    │   (React + Tailwind CSS)        │
                    │   Socket.IO Client              │
                    └────────────────┬────────────────┘
                                     │
                                     │ HTTP/HTTPS + WebSocket
                                     │
                    ┌────────────────▼────────────────┐
                    │       Load Balancer             │
                    │    (Nginx/AWS ELB/HAProxy)      │
                    │   - Route HTTP Requests         │
                    │   - Route WebSocket             │
                    │   - SSL Termination             │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
          ┌─────────▼─────────┐         ┌───────────▼──────────┐
          │   Backend Node 1  │         │   Backend Node 2     │
          │   ─────────────   │         │   ─────────────      │
          │   • Express.js    │         │   • Express.js       │
          │   • REST APIs     │         │   • REST APIs        │
          │   • Socket.IO     │         │   • Socket.IO        │
          │   • JWT Auth      │         │   • JWT Auth         │
          └─────────┬─────────┘         └───────────┬──────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    │
                    ┌───────────────▼────────────────┐
                    │         MongoDB Atlas          │
                    │   ───────────────────────      │
                    │   • User Data                  │
                    │   • Orders                     │
                    │   • Products                   │
                    │   • Store Information          │
                    │   • Delivery Data              │
                    └────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. HTTP Request (Login/API)
       ▼
┌─────────────┐
│   Backend   │
│  (Express)  │──────────────┐
└──────┬──────┘              │ 2. Query/Update
       │                     ▼
       │              ┌─────────────┐
       │              │   MongoDB   │
       │              └─────────────┘
       │ 3. JWT Token
       ▼
┌─────────────┐
│   Client    │
│(Authenticated)
└──────┬──────┘
       │ 4. WebSocket Connection
       ▼
┌─────────────┐
│  Socket.IO  │
│   Server    │
└──────┬──────┘            
       │               
       │              
       │              
       │              
       │ 6. Real-time Events
       ▼
┌─────────────┐
│   Client    │
│ (Live Updates)
└─────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Axios** | 1.x | HTTP client |
| **Socket.IO Client** | 4.x | WebSocket client |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 4.x | Web framework |
| **MongoDB** | 7.x | NoSQL database |
| **Mongoose** | 8.x | MongoDB ODM |
| **Socket.IO** | 4.x | WebSocket server |
| **JWT** | 9.x | Authentication |
| **bcryptjs** | 2.x | Password hashing |

### DevOps & Tools

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **PNPM** | Package manager |
| **Nginx** | Reverse proxy & load balancer |

---

## Folder Structure

### Backend Structure (`backend-scripts`)

```
backend-scripts/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── redis.js             # Redis configuration
│   │   └── env.js               # Environment variables
│   │
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── orderController.js   # Order management
│   │   ├── userController.js    # User management
│   │   ├── storeController.js   # Store operations
│   │   └── deliveryController.js # Delivery operations
│   │
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Order.js             # Order schema
│   │   ├── Store.js             # Store schema
│   │   ├── Product.js           # Product schema
│   │   └── Delivery.js          # Delivery schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── orderRoutes.js       # Order endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── storeRoutes.js       # Store endpoints
│   │   └── deliveryRoutes.js    # Delivery endpoints
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # Role-based access
│   │   ├── errorHandler.js      # Error handling
│   │   └── validators.js        # Request validation
│   │
│   ├── services/
│   │   ├── authService.js       # Authentication logic
│   │   ├── orderService.js      # Order business logic
│   │   ├── notificationService.js # Notifications
│   │   └── paymentService.js    # Payment integration
│   │
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   ├── helpers.js           # Helper functions
│   │   └── constants.js         # App constants
│   │
│   └── socket/
│       ├── socketHandler.js     # WebSocket logic
│       ├── orderSocket.js       # Order events
│       └── deliverySocket.js    # Delivery events
│
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .dockerignore                # Docker ignore file
├── .gitignore                   # Git ignore file
├── Dockerfile                   # Docker configuration
├── package.json                 # Dependencies
├── pnpm-lock.yaml              # Lock file
└── server.js                    # Entry point
```

### Frontend Structure (`web-client`)

```
web-client/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.js          # Login page
│   │   ├── register/
│   │   │   └── page.js          # Registration page
│   │   └── layout.js            # Auth layout
│   │
│   ├── (dashboard)/
│   │   ├── customer/
│   │   │   ├── orders/
│   │   │   │   └── page.js      # Customer orders
│   │   │   ├── profile/
│   │   │   │   └── page.js      # Customer profile
│   │   │   └── page.js          # Customer dashboard
│   │   │
│   │   ├── store/
│   │   │   ├── orders/
│   │   │   │   └── page.js      # Store orders
│   │   │   ├── products/
│   │   │   │   └── page.js      # Product management
│   │   │   ├── analytics/
│   │   │   │   └── page.js      # Store analytics
│   │   │   └── page.js          # Store dashboard
│   │   │
│   │   ├── delivery/
│   │   │   ├── orders/
│   │   │   │   └── page.js      # Delivery orders
│   │   │   ├── earnings/
│   │   │   │   └── page.js      # Earnings page
│   │   │   └── page.js          # Delivery dashboard
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   └── page.js      # User management
│   │   │   ├── stores/
│   │   │   │   └── page.js      # Store management
│   │   │   ├── analytics/
│   │   │   │   └── page.js      # Admin analytics
│   │   │   └── page.js          # Admin dashboard
│   │   │
│   │   └── layout.js            # Dashboard layout
│   │
│   ├── api/                     # API routes (if needed)
│   ├── layout.js                # Root layout
│   ├── page.js                  # Home page
│   └── globals.css              # Global styles
│
├── components/
│   ├── common/
│   │   ├── Button.js            # Button component
│   │   ├── Input.js             # Input component
│   │   ├── Modal.js             # Modal component
│   │   ├── Loading.js           # Loading spinner
│   │   └── Navbar.js            # Navigation bar
│   │
│   ├── orders/
│   │   ├── OrderCard.js         # Order card
│   │   ├── OrderList.js         # Order list
│   │   └── OrderDetails.js      # Order details
│   │
│   ├── dashboard/
│   │   ├── StatCard.js          # Statistics card
│   │   ├── Chart.js             # Chart component
│   │   └── RecentOrders.js      # Recent orders widget
│   │
│   └── layout/
│       ├── Sidebar.js           # Sidebar navigation
│       ├── Header.js            # Header component
│       └── Footer.js            # Footer component
│
├── context/
│   ├── AuthContext.js           # Authentication context
│   ├── OrderContext.js          # Order state context
│   └── SocketContext.js         # WebSocket context
│
├── lib/
│   ├── axios.js                 # Axios configuration
│   ├── socket.js                # Socket.IO configuration
│   └── utils.js                 # Utility functions
│
├── hooks/
│   ├── useAuth.js               # Authentication hook
│   ├── useSocket.js             # WebSocket hook
│   └── useOrders.js             # Orders hook
│
├── public/
│   ├── images/                  # Image assets
│   ├── icons/                   # Icon files
│   └── favicon.ico              # Favicon
│
├── styles/
│   └── globals.css              # Additional global styles
│
├── .env.local                   # Environment variables
├── .env.example                 # Example env file
├── .dockerignore                # Docker ignore file
├── .gitignore                   # Git ignore file
├── Dockerfile                   # Docker configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Dependencies
└── pnpm-lock.yaml              # Lock file
```

---

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher)
- **PNPM** (v8.x or higher)
- **Docker** & **Docker Compose**
- **MongoDB** (local or Atlas account)
- **Redis** (optional, for scaling)
- **Git**

### 1. SSH into the Server

```bash
ssh username@your-server-ip
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/realtime-quick-commerce.git

# Navigate to project directory
cd realtime-quick-commerce
```

### 3. Set Up Environment Variables

#### Backend Environment Variables (`.env`)

Create a `.env` file in the `backend-scripts` directory:

```bash
cd backend-scripts
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/quick-commerce
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quick-commerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# WebSocket Configuration
SOCKET_PORT=5000
SOCKET_CORS_ORIGIN=http://localhost:3000

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

```

#### Frontend Environment Variables (`.env.local`)

Create a `.env.local` file in the `web-client` directory:

```bash
cd ../web-client
touch .env.local
```

Add the following configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Production URLs
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Quick Commerce
NEXT_PUBLIC_APP_DESCRIPTION=Real-time Quick Commerce Platform



# Payment Gateway (if applicable)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### 4. Install Dependencies

#### Backend Dependencies

```bash
cd backend-scripts
pnpm install
```

#### Frontend Dependencies

```bash
cd ../web-client
pnpm install
```

### 5. Run the Application Locally

#### Start Backend Server

```bash
cd backend-scripts
pnpm run dev
```

The backend will start on `http://localhost:5000`

#### Start Frontend Server

```bash
cd web-client
pnpm run dev
```

The frontend will start on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/api-docs (if configured)

---

## Docker Configuration

### Docker Compose Setup

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  # MongoDB Service
  mongodb:
    image: mongo:7.0
    container_name: quick-commerce-db
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: quick-commerce
    networks:
      - quick-commerce-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Service
  redis:
    image: redis:7-alpine
    container_name: quick-commerce-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - quick-commerce-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Service
  backend:
    build:
      context: ./backend-scripts
      dockerfile: Dockerfile
    container_name: quick-commerce-backend
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/quick-commerce?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://frontend:3000
    volumes:
      - ./backend-scripts:/app
      - /app/node_modules
      - backend_uploads:/app/uploads
    networks:
      - quick-commerce-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./web-client
      dockerfile: Dockerfile
    container_name: quick-commerce-frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
      - NEXT_PUBLIC_SOCKET_URL=http://backend:5000
      - NODE_ENV=production
    volumes:
      - ./web-client:/app
      - /app/node_modules
      - /app/.next
    networks:
      - quick-commerce-network

  # Nginx Reverse Proxy (optional)
  nginx:
    image: nginx:alpine
    container_name: quick-commerce-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - quick-commerce-network

networks:
  quick-commerce-network:
    driver: bridge

volumes:
  mongodb_data:
  mongodb_config:
  redis_data:
  backend_uploads:
```

### Backend Dockerfile

Create `Dockerfile` in `backend-scripts` directory:

```dockerfile
# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["pnpm", "start"]
```

### Frontend Dockerfile

Create `Dockerfile` in `web-client` directory:

```dockerfile
# Base image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run with Docker Compose

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Scale backend service
docker-compose up -d --scale backend=3
```

---

## Hosting & Deployment

### 1. Backend Deployment

#### Option A: Deploy to AWS EC2

```bash
# 1. Create EC2 instance (Ubuntu 22.04)
# 2. SSH into the instance
ssh -i your-key.pem ubuntu@ec2-ip-address

# 3. Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER

# 4. Clone repository
git clone https://github.com/your-username/realtime-quick-commerce.git
cd realtime-quick-commerce

# 5. Set up environment variables
nano backend-scripts/.env

# 6. Build and run
docker-compose up -d backend mongodb redis

# 7. Configure security group
# Open ports: 5000 (backend), 27017 (MongoDB), 6379 (Redis)
```

#### Option B: Deploy to DigitalOcean

```bash
# 1. Create a Droplet (Docker on Ubuntu)
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Clone and configure
git clone https://github.com/your-username/realtime-quick-commerce.git
cd realtime-quick-commerce
nano backend-scripts/.env

# 4. Deploy
docker-compose up -d
```

#### Option C: Deploy to Heroku

```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create quick-commerce-backend

# 4. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 5. Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# 6. Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# 7. Deploy
git push heroku main
```

#### Using MongoDB Atlas

```bash
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create a cluster
# 3. Get connection string
# 4. Update .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quick-commerce
```

### 2. Frontend Deployment

#### Option A: Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to frontend directory
cd web-client

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel --prod

# 5. Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
# NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

#### Option B: Deploy to Netlify

```bash
# 1. Build the application
cd web-client
pnpm run build

# 2. Install Netlify CLI
npm i -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=.next
```

#### Option C: Deploy to AWS S3 + CloudFront

```bash
# 1. Build static export
cd web-client
pnpm run build
pnpm run export

# 2. Upload to S3
aws s3 sync out/ s3://your-bucket-name

# 3. Configure CloudFront distribution
# 4. Update DNS records
```

### 3. Nginx Configuration for WebSocket

Create `/etc/nginx/sites-available/quick-commerce`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket specific
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable and restart
