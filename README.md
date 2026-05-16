# Microservices Web Application
## Containerized Microservices System with Terraform-Based Infrastructure Provisioning and Incident Response Simulation
---

## Project Overview

This project demonstrates the integration of modern DevOps practices, combining containerization, infrastructure automation, monitoring, and incident management. It implements a microservices-based e-commerce application with full observability and infrastructure as code.

---

## Technology Stack
1. Node.js + Express -> Backend microservices 
2. JavaScript + HTML/CSS -> Frontend application 
3. Nginx -> Web server and reverse proxy
4. PostgreSQL -> Database 
5. Docker -> Containerization 
6. Docker Compose -> Container orchestration 
7. Prometheus -> Metrics collection 
8. Grafana -> Metrics visualization 
9. Terraform -> Infrastructure as Code 

---

### Microservices
1. Auth Service -> 3001 -> User registration and login, JWT tokens 
2. Order Service -> 3002 -> Orders, shopping cart, favorites 
3. Product Service -> 3003 -> Product catalog management 
4. User Service -> 3004 -> User profile management 
5. Chat Service -> 3005 -> Messaging between users 

### Step 1 — Configure environment variables
Create `.env` file in the root directory:
```env
PORT=3300
JWT_SECRET=**
ADMIN_CODE=**
NODE_ENV=**
POSTGRES_USER=**
POSTGRES_PASSWORD=**
POSTGRES_DB=**
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/myapp
```

### Step 2 — Start all services
docker compose up --build -d

### Step 3 — Verify all containers are running
docker compose ps

All 10 containers should show status **Up**.

---

## Infrastructure as Code (Terraform)

### install terraform
brew install terraform
terraform version

### Deploy Infrastructure
cd terraform
terraform init
terraform plan
terraform apply

--- 

## Incident Simulation

### Introduce Incident 
1. Open `docker-compose.yml`
2. Add wrong DATABASE_URL to orderservice:
orderservice:
  environment:
    - DATABASE_URL=postgresql://postgres:WRONGPASSWORD@wronghost:5432/myapp
3. Restart the service:
docker compose up -d orderservice
4. Observe the error:
docker compose logs orderservice
# Error: getaddrinfo ENOTFOUND wronghost

### Detect Incident
- Check logs -> `docker compose logs orderservice`
- Check Prometheus -> http://localhost:9092/targets
- Check Grafana -> http://localhost:3010
- Check health -> http://localhost:3002/health

### Fix Incident 
1. Remove wrong env block from `docker-compose.yml`
2. Restart the service:
docker compose up -d orderservice
3. Verify restoration:
docker compose logs orderservice -> output: Order service running on port 3002
4. open http://localhost:3002/health -> output: Order Service OK

---

## Stopping the Application

1. Stop all containers
docker compose down
2. Stop and remove volumes (clears database)
docker compose down -v
