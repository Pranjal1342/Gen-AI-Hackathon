# Document Intelligence Platform - Setup Instructions

A modern React frontend for AI-powered document analysis, built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm))
- Your FastAPI backend running on port 8000 (or configure a different URL)

### 1. Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your API configuration
# VITE_API_URL=http://localhost:8000  # For local development
# VITE_API_URL=https://your-api.com  # For production
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

### API Endpoints

The frontend expects these backend endpoints:

- `POST /process-document` - Upload PDF for analysis
- `POST /qa` - Ask questions about uploaded documents
- `POST /translate` - Translate text to different languages
- `POST /export` - Export analysis as PDF

## 🏗️ Build for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn-ui components
│   ├── DocumentUpload.tsx
│   ├── AnalysisResults.tsx
│   ├── QASection.tsx
│   └── TranslationSection.tsx
├── lib/
│   ├── api.ts           # API client and types
│   └── utils.ts         # Utility functions
├── pages/
│   ├── Index.tsx        # Main application page
│   └── DocumentAnalyzer.tsx
├── hooks/               # React hooks
└── assets/              # Static assets
```

## 🎨 Features

### ✅ Core Functionality
- **Document Upload**: Drag & drop PDF upload with real-time processing
- **Analysis Display**: Health score, risk assessment, and document insights
- **Q&A System**: Interactive questions about uploaded documents
- **Translation**: Multi-language translation support
- **PDF Export**: Download formatted analysis reports

### ✅ UI/UX Features
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Dark/Light Mode**: Automatic theme detection
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Professional Design**: Clean, modern interface

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-production-api.com
```

### Netlify
```bash
# Build the project
npm run build

# Deploy the dist/ folder to Netlify
# Set environment variables in Netlify dashboard
```

### Traditional Hosting
```bash
# Build the project
npm run build

# Upload the dist/ folder to your web server
# Ensure environment variables are configured
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn-ui components
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React hooks + React Query

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running
   - Verify `VITE_API_URL` in `.env` file
   - Ensure CORS is configured on backend

2. **File Upload Not Working**
   - Check file size limits (backend configuration)
   - Verify PDF file format
   - Check browser console for errors

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📞 Support

For issues related to:
- **Frontend**: Check browser console and network tab
- **Backend**: Verify API endpoints and responses
- **Deployment**: Check environment variables and build logs

---

Built with ❤️ using React, TypeScript, and Tailwind CSS