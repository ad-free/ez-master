# Changelog

## [v1.0.0] - 2025-10-28

### 🚀 Features

#### Authentication
- ✨ Implemented token-based authentication system
- 🔒 Added HTTP-only cookie support for enhanced security
- 🛡️ Protected API endpoints with authentication middleware

#### Work From Home Management
- 📅 WFH registration system with date range support
- ✔️ Built-in date format validation
- 📝 Reason tracking and documentation system

#### Overtime Management
- ⏰ OT scheduling with specific time windows
- 📋 Support for PLAN type overtime
- 💰 Configurable DILIGENCE benefit types

#### Salary Information
- 📊 Secure salary PDF download functionality
- 📆 Smart current month detection
- 🔐 Secure document delivery system

### 🛠️ Technical Implementation

#### Backend
- 🐍 Python 3.12+ with FastAPI 0.116.1
- 📚 Comprehensive OpenAPI/Swagger documentation
- 🐳 Docker support with Python 3.12-slim base image

#### Frontend
- ⚛️ React 19.1.1 with TypeScript
- 🎨 Material-UI v7 components integration
- 🌐 React Router v6 for modern routing
- 💅 Tailwind CSS for responsive design
- ⚡ Vite build system for performance

### 📦 DevOps & Deployment
- 🚀 One-click Render deployment support
- 💓 Health check endpoint implementation
- 🔧 Environment variable configuration
- 📦 Docker containerization
- 🔄 GitHub Actions CI/CD pipeline

### 💻 Developer Experience
- 📖 Comprehensive API documentation
- 🔥 Hot reload for local development
- 🧹 ESLint code quality configuration
- 📘 TypeScript type safety
- 🎯 Example requests/responses

### 🔍 Requirements
- Modern web browsers
- Python 3.12+
- Docker (optional)
- Cloud platform supporting Python web services

### 📝 Additional Notes
- Date format: `YYYY-MM-DD`
- Time format: 24-hour (`HH:MM`)
- Authentication required for protected endpoints
- Automated release notes generation

### 🏃‍♂️ Quick Start
```bash
# Clone the repository
git clone https://github.com/ad-free/ez-master.git

# Backend setup
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\Activate.ps1` on Windows
pip install -r requirements.txt

# Start the backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

### 🐳 Docker Quick Start
```bash
docker build -t ez-master .
docker run -p 8000:8000 ez-master
```

### 🔗 Links
- [Documentation](https://github.com/ad-free/ez-master#readme)
- [API Reference](http://127.0.0.1:8000/docs)
- [Docker Hub](https://hub.docker.com/r/ad-free/ez-master)
- [Issues](https://github.com/ad-free/ez-master/issues)

---

[v1.0.0]: https://github.com/ad-free/ez-master/releases/tag/v1.0.0