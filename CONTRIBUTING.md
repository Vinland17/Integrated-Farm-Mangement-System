# Contributing to Integrated Farm Resource Planning System (PRJ_533)

Thank you for your interest in contributing to the **Integrated Farm Resource Planning and Agricultural Decision Support System (PRJ_533)**! We welcome contributions from developers, data scientists, agricultural researchers, and open-source enthusiasts.

This guide provides a comprehensive step-by-step walkthrough on how to set up your development environment, understand project workflows, follow code conventions, and submit high-quality contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How You Can Contribute](#how-you-can-contribute)
- [Development Setup & Prerequisites](#development-setup--prerequisites)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Fork and Clone the Repository](#2-fork-and-clone-the-repository)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Installing Dependencies & Running Services](#4-installing-dependencies--running-services)
    - [Option A: Running Services Individually](#option-a-running-services-individually)
    - [Option B: Running with Docker Compose](#option-b-running-with-docker-compose)
- [Contribution Workflow](#contribution-workflow)
  - [1. Choose or Create an Issue](#1-choose-or-create-an-issue)
  - [2. Branch Naming Conventions](#2-branch-naming-conventions)
  - [3. Commit Message Guidelines](#3-commit-message-guidelines)
  - [4. Keeping Your Branch Updated](#4-keeping-your-branch-updated)
  - [5. Submitting a Pull Request (PR)](#5-submitting-a-pull-request-pr)
- [Coding Standards & Guidelines](#coding-standards--guidelines)
  - [Frontend (React.js + TypeScript + Tailwind CSS)](#frontend-reactjs--typescript--tailwind-css)
  - [Backend (Node.js + Express.js + MongoDB)](#backend-nodejs--expressjs--mongodb)
  - [ML Microservice (Python + FastAPI)](#ml-microservice-python--fastapi)
- [Testing & Verification](#testing--verification)
- [Security Guidelines](#security-guidelines)
- [Questions & Support](#questions--support)

---

## Code of Conduct

We aim to foster an open, welcoming, and inclusive community. All contributors are expected to:

- Be respectful and empathetic toward fellow community members.
- Provide constructive, actionable code reviews and feedback.
- Avoid political, personal, or harassment-oriented discussions.
- Prioritize clear communication and collaborative problem-solving.

---

## How You Can Contribute

You can contribute to PRJ_533 in several ways:

1. **Bug Reports**: Found a issue in the UI, REST API, or FastAPI ML service? Open a detailed issue report.
2. **Feature Requests**: Have an idea for new agricultural decision rules, weather integrations, or ML prediction models? Suggest it via an issue.
3. **Frontend Development**: Improve UI/UX, build modern React/TypeScript components with Tailwind CSS and `shadcn/ui`, or add geospatial visualizations with Leaflet.
4. **Backend REST API**: Create new API endpoints, optimize MongoDB schemas, improve middleware authentication, or add logging.
5. **AI/ML & Data Science**: Train/refine models for crop recommendation, yield prediction, or plant disease classification, or clean new agricultural datasets.
6. **Documentation**: Enhance setup guides, API specs, inline docstrings, or architecture diagrams.

---

## Development Setup & Prerequisites

### 1. Prerequisites

Before setting up the project locally, ensure you have the following installed on your machine:

- **Git** (v2.x or higher)
- **Node.js** (v18.x LTS or higher) & **npm** (v9.x or higher)
- **Python** (v3.10 or higher) & `pip`
- **MongoDB** (v6.0+ local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account)
- **Docker & Docker Compose** *(Optional, but recommended for full-stack containerized runs)*

---

### 2. Fork and Clone the Repository

1. **Fork the Repository**:
   Click the **Fork** button at the top right of the GitHub repository page:
   [https://github.com/Rohith0750/Integrated-Farm-Mangement-System](https://github.com/Rohith0750/Integrated-Farm-Mangement-System)

2. **Clone Your Fork**:
   Replace `YOUR_USERNAME` with your GitHub username:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Integrated-Farm-Mangement-System.git
   cd Integrated-Farm-Mangement-System
   ```

3. **Configure Upstream Remote**:
   Add the main repository as `upstream` to stay synchronized:

   ```bash
   git remote add upstream https://github.com/Rohith0750/Integrated-Farm-Mangement-System.git
   git fetch upstream
   ```

---

### 3. Environment Configuration

The application consists of three main sub-directories (`backend`, `frontend`, `ml-service`). Each requires configuration files based on `.env.example`.

#### Backend (`backend/.env`)
Copy `backend/.env.example` (or create `backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/farm_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
WEATHER_API_KEY=your_openweather_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

#### ML Microservice (`ml-service/.env`)
Copy `ml-service/.env.example` (or create `ml-service/.env`):
```env
PORT=8000
ENVIRONMENT=development
MODEL_PATH=./app/models/
ALLOWED_ORIGINS=http://localhost:5000
```

#### Frontend (`frontend/.env`)
Copy `frontend/.env.example` (or create `frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="Integrated Farm Resource Planning"
```

---

### 4. Installing Dependencies & Running Services

#### Option A: Running Services Individually

Open three terminal sessions from the project root:

**Terminal 1: Node.js Backend API**
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

**Terminal 2: Python FastAPI ML Microservice**
```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI Uvicorn server
uvicorn app.main:app --reload --port 8000
```
*ML Service runs on `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)*

**Terminal 3: React.js Frontend Client**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

#### Option B: Running with Docker Compose

If you prefer containerized deployment:

```bash
cd docker
docker-compose up --build
```

---

## Contribution Workflow

### 1. Choose or Create an Issue

Before starting work, browse existing [GitHub Issues](https://github.com/Rohith0750/Integrated-Farm-Mangement-System/issues).
- If an issue exists, leave a comment asking to be assigned.
- If you want to introduce a new feature or report a bug, open a new issue detailing your proposal first.

---

### 2. Branch Naming Conventions

Always create a new branch from `main` for your work. Use standard prefixes:

- `feature/` : New UI components, endpoints, or ML features (e.g., `feature/soil-npk-chart`)
- `fix/` : Bug fixes in code or calculation logic (e.g., `fix/jwt-auth-middleware`)
- `docs/` : Documentation improvements (e.g., `docs/update-contributing-guide`)
- `ml/` : Model additions, dataset pre-processing scripts (e.g., `ml/yolo-leaf-disease`)
- `refactor/` : Code cleanup without structural behavior changes (e.g., `refactor/express-routes`)

Example:
```bash
git checkout main
git pull upstream main
git checkout -b feature/soil-npk-chart
```

---

### 3. Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) standards. Format commit messages as:

`<type>(<scope>): <short description>`

**Types**:
- `feat`: A new feature for the user or system
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting changes (no production code change)
- `refactor`: Refactoring code without adding features or fixing bugs
- `test`: Adding or modifying tests
- `chore`: Updating dependencies, build scripts, configuration

**Examples**:
- `feat(frontend): add interactive field map component using Leaflet`
- `fix(backend): correct JWT token expiration header handling`
- `ml(disease-model): optimize CNN inference pipeline memory usage`
- `docs(readme): add docker-compose setup steps`

---

### 4. Keeping Your Branch Updated

Regularly sync your feature branch with the latest `upstream/main` to avoid merge conflicts:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git checkout feature/your-feature-name
git rebase main
```

---

### 5. Submitting a Pull Request (PR)

1. **Push Changes to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request**:
   - Go to [Rohith0750/Integrated-Farm-Mangement-System](https://github.com/Rohith0750/Integrated-Farm-Mangement-System).
   - Click **New Pull Request**.
   - Select your fork and feature branch against `Rohith0750/main`.

3. **Fill Out the PR Description**:
   - **Summary**: Concise description of what was changed and why.
   - **Related Issues**: Mention fixes (e.g., `Fixes #12`).
   - **Testing Performed**: Detail steps taken to verify the changes.
   - **Screenshots / Visuals**: Include screenshots for UI changes.

4. **Review & Revisions**:
   - Maintainers will review your PR. Be prepared to address feedback or request changes cleanly on your branch.

---

## Coding Standards & Guidelines

### Frontend (React.js + TypeScript + Tailwind CSS)

- **Language**: Use TypeScript for all React components (`.tsx`) and utility modules (`.ts`). Define explicit types or interfaces instead of using `any`.
- **Styling**: Use Tailwind CSS classes. Avoid inline styles or raw CSS files where Tailwind classes suffice.
- **Component Architecture**: Keep components small, focused, and reusable under `src/components/`. Place pages under `src/pages/`.
- **Formatting**: Format code cleanly with consistent indentation (2 spaces).

### Backend (Node.js + Express.js + MongoDB)

- **Architecture**: Follow MVC / Controller-Service separation:
  - `routes/` for API endpoints.
  - `controllers/` for business logic.
  - `models/` for Mongoose schemas.
  - `middleware/` for authentication and request validation.
- **Async Handling**: Wrap async route handlers with `try/catch` blocks or use async error handler middlewares.
- **RESTful Conventions**: Use standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error`).

### ML Microservice (Python + FastAPI)

- **Python Version**: Python 3.10+ syntax.
- **Formatting**: Adhere to PEP 8 standards. Use type annotations for function signatures and FastAPI schemas (`pydantic.BaseModel`).
- **Model Serialization**: Save trained models under `ml-service/app/models/` in standard formats (`.pkl`, `.pt`, `.onnx`). Include dataset version details in model documentation.

---

## Testing & Verification

Before submitting a Pull Request, verify all changes locally:

1. **Frontend Verification**: Ensure there are no TypeScript compilation errors or console warnings:
   ```bash
   cd frontend
   npm run build
   ```
2. **Backend API Testing**: Test endpoints with Postman or `curl` to ensure valid JSON responses and error handling.
3. **ML Endpoint Verification**: Access Uvicorn interactive docs at `http://localhost:8000/docs` to test inference endpoints.

---

## Security Guidelines

- **Never Commit Secrets**: Do **NOT** commit `.env` files, API keys, database credentials, or JWT secrets to Git.
- **Input Sanitization**: Sanitize and validate all user inputs in backend routes to prevent injection attacks.
- **Dependencies**: Keep dependencies updated and check for security vulnerabilities using `npm audit`.

---

## Questions & Support

If you have questions, encounter setup problems, or need guidance:

- **GitHub Issues**: Open a issue labeled `question` or `help wanted`.
- **Discussions**: Join the project discussions on GitHub.
- **Maintainers**: Contact repository owner [@Rohith0750](https://github.com/Rohith0750).

Thank you for helping build a better intelligent farm management system!
