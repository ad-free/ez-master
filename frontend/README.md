# EZ Master Frontend

A modern React TypeScript frontend for the EZ Master application, built with Vite and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login with JWT token management
- 🏠 **Work From Home**: Register WFH requests for date ranges
- ⏰ **Overtime Management**: Register OT with time windows and benefit types
- 💰 **Salary Downloads**: Download salary PDFs for any month
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🚀 **Modern Stack**: React 19, TypeScript, Vite, React Router

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the FastAPI backend at `https://ez-master.onrender.com/` and provides:

### Authentication
- Login with EZ credentials
- Automatic token management
- Protected routes

### Features
- **WFH Registration**: Submit work-from-home requests for date ranges
- **OT Registration**: Register overtime with specific time windows
- **Salary Downloads**: Download salary PDFs
- **Profile Management**: View user profile information

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── services/           # API client and services
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## Environment Configuration

The API base URL is configured in `src/services/api.ts`. To change the backend URL, modify the `baseURL` parameter in the `ApiClient` constructor.

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends login request to backend
3. Backend returns JWT token
4. Token is stored in localStorage and used for subsequent requests
5. Protected routes check authentication status
6. Token is automatically included in API requests

## Styling

The project uses Tailwind CSS for styling. All components are built with utility classes for consistent, responsive design.

## Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.