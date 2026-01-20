# 🏢 Residential Operations & Incident Management Platform

[![CI Pipeline](https://github.com/ayush2743/residential-incident-management/actions/workflows/ci.yml/badge.svg)](https://github.com/ayush2743/residential-incident-management/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ayush2743/residential-incident-management/actions/workflows/cd.yml/badge.svg)](https://github.com/ayush2743/residential-incident-management/actions/workflows/cd.yml)

A **production-grade backend REST API** for managing operational incidents in residential societies. This project demonstrates **advanced DevOps CI/CD practices** with comprehensive security gates and automated deployment pipelines.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Docker](#-docker)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Security](#-security)
- [Project Structure](#-project-structure)

---

## 🎯 Project Overview

This application serves as a backend service for **facility management teams** to track and manage operational incidents in residential complexes, including:

- 💧 Water leakage
- ⚡ Electrical failures
- 🛗 Lift breakdowns
- 🔒 Security incidents
- 🧹 Sanitation issues

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript |
| **Runtime** | Node.js 20.x LTS |
| **Framework** | Express.js |
| **Testing** | Jest |
| **Code Quality** | ESLint |
| **Containerization** | Docker (multi-stage) |
| **Orchestration** | Kubernetes |
| **CI/CD** | GitHub Actions |
| **Security** | CodeQL, Trivy, npm audit |

---

## 🔌 API Endpoints

### Health Check (CRITICAL FOR CI)

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### Create Incident

```http
POST /incidents
```

**Request Body:**
```json
{
  "category": "WATER | ELECTRICAL | SECURITY | SANITATION",
  "priority": "P1 | P2 | P3",
  "location": "Block A - Lift 2",
  "summary": "Lift stuck between floors"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "category": "ELECTRICAL",
  "priority": "P1",
  "location": "Block A - Lift 2",
  "summary": "Lift stuck between floors",
  "status": "OPEN",
  "createdAt": "2026-01-19T10:30:00.000Z",
  "updatedAt": "2026-01-19T10:30:00.000Z"
}
```

---

### Get All Incidents

```http
GET /incidents
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "category": "WATER",
    "priority": "P2",
    "location": "Block C - Apartment 304",
    "summary": "Water leakage in bathroom",
    "status": "OPEN",
    "createdAt": "2026-01-19T09:15:00.000Z",
    "updatedAt": "2026-01-19T09:15:00.000Z"
  }
]
```

---

### Update Incident Status

```http
PATCH /incidents/:id/status
```

**Request Body:**
```json
{
  "status": "OPEN | ASSIGNED | RESOLVED"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ASSIGNED",
  "updatedAt": "2026-01-19T11:00:00.000Z"
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker (optional)
- Kubernetes cluster (optional, for deployment)

### Local Development

1. **Clone the repository:**

```bash
git clone https://github.com/ayush2743/residential-incident-management.git
cd residential-incident-management
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run linting:**

```bash
npm run lint
```

4. **Run tests:**

```bash
npm test
```

5. **Build the application:**

```bash
npm run build
```

6. **Start the server:**

```bash
npm start
```

The API will be available at `http://localhost:3000`

7. **Test the health endpoint:**

```bash
curl http://localhost:3000/health
```

---

## 🐳 Docker

### Build Docker Image

```bash
docker build -t ayushsaxena27/residential-incident-api:latest .
```

### Run Docker Container

```bash
docker run -d -p 3000:3000 --name incident-api ayushsaxena27/residential-incident-api:latest
```

### Test Container

```bash
# Health check
curl http://localhost:3000/health

# Create an incident
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "category": "WATER",
    "priority": "P1",
    "location": "Block A",
    "summary": "Water leak detected"
  }'
```

### Stop and Remove Container

```bash
docker stop incident-api
docker rm incident-api
```

---

## 🔄 CI/CD Pipeline

This project implements a **production-grade CI/CD pipeline** with strict security gates following **DevSecOps** principles.

### CI Pipeline Architecture

The CI pipeline runs on every push to `main`/`master` branch and consists of **13 stages**:

```
┌─────────────────────────────────────────────────────────────┐
│                     CI PIPELINE STAGES                       │
└─────────────────────────────────────────────────────────────┘

1. 📥 Checkout Code
   └─> Clone repository

2. 🔧 Setup Node.js
   └─> Install Node.js 20.x with dependency caching

3. 📦 Install Dependencies
   └─> npm ci (clean install)

4. 🔍 Linting (QUALITY GATE) 
   └─> ESLint with TypeScript rules
   └─> Fails pipeline on errors
   └─> WHY: Enforce code standards, prevent technical debt

5. 🛡️ SAST - CodeQL (SECURITY GATE) 
   └─> Static Application Security Testing
   └─> Detects: SQL injection, XSS, insecure patterns
   └─> WHY: Detect OWASP Top 10 vulnerabilities early (shift-left)

6. 🔐 SCA - Dependency Scan (SECURITY GATE) 
   └─> npm audit --audit-level=high
   └─> Fails on HIGH/CRITICAL vulnerabilities
   └─> WHY: Prevent supply-chain attacks, detect vulnerable dependencies

7. 🧪 Unit Tests 
   └─> Jest test suite with coverage
   └─> WHY: Prevent regressions, ensure code correctness

8. 🏗️ Build Application 
   └─> TypeScript compilation (tsc)
   └─> WHY: Ensure build succeeds before containerization

9. 🐳 Docker Build
   └─> Multi-stage Dockerfile
   └─> Tags: latest + git SHA

10. 🔒 Container Scan - Trivy (HARD GATE) 
    └─> Scan for OS and application vulnerabilities
    └─> Fails on HIGH/CRITICAL findings
    └─> WHY: Prevent vulnerable images from shipping

11. 🚀 Runtime Container Test 
    └─> Start container and test /health endpoint
    └─> WHY: Verify image is runnable and behaves correctly

12. 🔑 DockerHub Login
    └─> Authenticate using GitHub Secrets

13. 📤 Push to DockerHub
    └─> Publish ONLY if all gates pass
    └─> WHY: Ensure only trusted artifacts are deployed
```

### CD Pipeline Architecture

The CD pipeline runs **after CI succeeds** and handles deployment:

```
┌─────────────────────────────────────────────────────────────┐
│                     CD PIPELINE STAGES                       │
└─────────────────────────────────────────────────────────────┘

1. 📥 Checkout Code
2. 🔑 Login to DockerHub
3. 📥 Pull Verified Image
4. 🔧 Setup kubectl
5. ✅ Validate Kubernetes Manifests
6. 📋 Deployment Instructions
7. 🛡️ DAST Simulation (OWASP ZAP)
```

### Why CI and CD Are Separate

| Reason | Explanation |
|--------|-------------|
| **Separation of Concerns** | CI focuses on building/testing, CD on deployment |
| **Security** | Deployment requires different permissions |
| **Flexibility** | Deploy manually or on schedule |
| **Rollback** | Deploy previous versions without rebuilding |
| **Compliance** | Audit trail for production changes |

---

## ☸️ Kubernetes Manifests

This project includes production-ready Kubernetes manifests that are validated client-side in the CD pipeline.

### Manifest Validation (Client-Side)

The CD pipeline validates Kubernetes manifests using syntax checks:

```bash
# Validation performed in CI/CD
for file in k8s/*.yaml; do
  grep -q "apiVersion:" "$file"  # Check Kubernetes API version
  grep -q "kind:" "$file"        # Check resource type
  grep -q "metadata:" "$file"    # Check metadata section
done
```


### Available Resources

| Resource | File | Description |
|----------|------|-------------|
| **Namespace** | `namespace.yaml` | Isolates resources in `residential-ops` namespace |
| **Deployment** | `deployment.yaml` | Runs 3 replicas with health probes and security context |
| **Service** | `service.yaml` | LoadBalancer exposing port 80 → 3000 |
| **ConfigMap** | `configmap.yaml` | Application configuration values |

### Deployment Features

- ✅ **Liveness Probe**: HTTP check on `/health` every 30s
- ✅ **Readiness Probe**: HTTP check on `/health` every 10s
- ✅ **Resource Limits**: 256Mi memory, 200m CPU per pod
- ✅ **Security Context**: Non-root user (UID 1001), no privilege escalation
- ✅ **High Availability**: 3 replica pods with rolling updates
- ✅ **Health Checks**: Automatic restart of unhealthy containers

---

## 🔐 Security

### Security Measures Implemented

#### Application Security
- ✅ Input validation on all endpoints
- ✅ No `eval()` or unsafe code patterns
- ✅ TypeScript strict mode enabled
- ✅ ESLint security rules enforced

#### Container Security
- ✅ Multi-stage build (no dev dependencies in production)
- ✅ Non-root user (UID 1001)
- ✅ Minimal base image (alpine)
- ✅ No hardcoded secrets
- ✅ Health checks enabled

#### Pipeline Security
- ✅ SAST with CodeQL
- ✅ SCA with npm audit
- ✅ Container scanning with Trivy
- ✅ Secrets stored in GitHub Secrets
- ✅ No credentials in code

---

## 📁 Project Structure

```
residential-incident-management/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI Pipeline
│       └── cd.yml                 # CD Pipeline
├── k8s/
│   ├── namespace.yaml             # Kubernetes namespace
│   ├── deployment.yaml            # Application deployment
│   ├── service.yaml               # LoadBalancer service
│   └── configmap.yaml             # Configuration
├── src/
│   ├── controllers/
│   │   └── incidentController.ts  # Business logic
│   ├── models/
│   │   └── incident.ts            # TypeScript interfaces
│   ├── routes/
│   │   └── incidents.ts           # Express routes
│   ├── app.ts                     # Express app setup
│   └── index.ts                   # Server entry point
├── tests/
│   └── incident.test.ts           # Jest unit tests
├── Dockerfile                      # Multi-stage Docker build
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── .eslintrc.js                    # ESLint rules
├── jest.config.js                  # Jest configuration
├── .gitignore                      # Git ignore rules
├── .dockerignore                   # Docker ignore rules
└── README.md                       # This file
```

---

## 🔧 GitHub Secrets Configuration

The following secrets must be configured in your GitHub repository:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username | Your DockerHub account username |
| `DOCKERHUB_TOKEN` | DockerHub access token | Generate at https://hub.docker.com/settings/security |

### Setting Up Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate name and value

---

## 📊 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

The test suite includes:
- ✅ Incident creation validation
- ✅ Status update logic
- ✅ Input sanitization
- ✅ Error handling
- ✅ Edge cases

---

## 🎓 Learning Outcomes

This project demonstrates:

1. **DevOps Automation**: End-to-end CI/CD with GitHub Actions
2. **Security-First Mindset**: Multiple security gates (SAST, SCA, container scanning)
3. **Container Best Practices**: Multi-stage builds, non-root users, minimal images
4. **Kubernetes Deployment**: Production-ready manifests with health checks
5. **Fail-Fast Philosophy**: Stop early on quality/security issues
6. **Separation of Concerns**: CI (build/test) vs CD (deploy)
7. **Supply Chain Security**: Dependency scanning and trusted registries



