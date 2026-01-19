# GitHub Actions Workflows

This directory contains the CI/CD pipelines for the Residential Incident Management Platform.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master`
- Manual trigger via `workflow_dispatch`

**Purpose:** Build, test, scan, and publish Docker images with comprehensive security gates.

**Stages:**
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x with caching
3. ✅ Install dependencies
4. ⛔ **QUALITY GATE:** Linting (ESLint)
5. ⛔ **SECURITY GATE:** SAST (CodeQL)
6. ⛔ **SECURITY GATE:** SCA (npm audit)
7. ✅ Unit tests
8. ✅ Build application
9. ✅ Build Docker image
10. ⛔ **SECURITY GATE:** Container scan (Trivy)
11. ✅ Runtime container test
12. ✅ DockerHub login
13. ✅ Push Docker image (only if all gates pass)

**Security Features:**
- Fails on HIGH/CRITICAL vulnerabilities
- SARIF upload to GitHub Security tab
- Runtime verification before push
- Secrets managed via GitHub Secrets

---

### 2. CD Pipeline (`cd.yml`)

**Triggers:**
- Automatically runs after successful CI pipeline
- Manual trigger via `workflow_dispatch`

**Purpose:** Deploy verified Docker images to Kubernetes.

**Stages:**
1. ✅ Checkout code
2. ✅ DockerHub login
3. ✅ Pull verified image
4. ✅ Setup kubectl
5. ✅ Validate Kubernetes manifests
6. ✅ Deployment instructions
7. ✅ DAST simulation (OWASP ZAP)

**Key Principle:** Only deploys images that passed all CI security gates.

---

## Why Two Separate Workflows?

| CI (Continuous Integration) | CD (Continuous Deployment) |
|-----------------------------|---------------------------|
| Builds and tests code | Deploys artifacts |
| Runs on every push | Runs after CI succeeds |
| Creates artifacts | Consumes artifacts |
| Automated security scanning | Deployment validation |
| Pushes to registry | Pulls from registry |

**Separation ensures:**
- Different security contexts
- Ability to deploy previous versions
- Manual deployment approval option
- Clear audit trail
- Rollback capability

---

## Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|-------------|-------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token (not password!) |

---

## Monitoring Pipelines

View pipeline runs at:
```
https://github.com/ayush2743/residential-incident-management/actions
```

Check security findings at:
```
https://github.com/ayush2743/residential-incident-management/security
```

---

## Pipeline Philosophy

This CI/CD implementation follows these DevOps principles:

1. **Shift-Left Security** - Find issues early
2. **Fail-Fast** - Stop immediately on quality/security issues
3. **Trust but Verify** - Test artifacts before deployment
4. **Immutable Artifacts** - Build once, deploy many times
5. **Explicit Gates** - Clear criteria for each stage
6. **Audit Trail** - Complete visibility into what was deployed

---

## Troubleshooting

### CI Pipeline Fails

**Linting errors:**
```bash
npm run lint:fix
```

**Trivy scan fails:**
- Update base Docker image
- Review vulnerability report in Security tab

**Tests fail:**
```bash
npm test -- --verbose
```

### CD Pipeline Fails

**Manifest validation fails:**
```bash
kubectl apply --dry-run=client -f k8s/
```

---

## Local Testing

Test CI steps locally:

```bash
# Run all CI checks
npm run lint
npm test
npm run build
docker build -t test-image .
docker run -d -p 3000:3000 test-image
curl http://localhost:3000/health
```

---

**Last Updated:** 2026-01-19
