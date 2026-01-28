# CarvAi

> AI-Powered Career Assistant for Resume Building, Cover Letters, Interview Preparation & Industry Insights

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://carv-ai-iota.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-98.2%25-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

- **🤖 AI-Powered Career Guidance**: Get personalized career advice and insights powered by Google Gemini AI
- **📄 Smart Resume Builder**: Create ATS-optimized resumes with AI-assisted content improvement
- **✉️ AI Cover Letter Generator**: Generate tailored, professional cover letters for job applications
- **🎯 Mock Interview Practice**: Practice with role-specific technical questions and instant feedback
- **📊 Industry Insights**: Real-time industry trends, salary data, and market analysis
- **📈 Progress Tracking**: Monitor your interview performance with detailed analytics
- **🔐 Secure Authentication**: Seamless sign-in with Clerk (Email & OAuth)
- **💼 Professional Onboarding**: Personalized experience based on your industry and expertise
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database (Neon recommended)
- **API Keys** for:
  - Google Gemini AI
  - Clerk Authentication
  - Inngest (Background Jobs)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Varshanth2025/carvAi.git
cd carvAi
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Markdown Editor**: @uiw/react-md-editor
- **Charts**: Recharts

### Backend
- **Runtime**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **AI**: Google Gemini 2.5 Flash
- **Background Jobs**: Inngest
- **PDF Generation**: html2pdf.js

### Infrastructure
- **Deployment**: Vercel
- **Database**: Neon (Serverless Postgres)
- **Authentication**: Clerk

## 📁 Project Structure

```
carvAi/
├── actions/              # Server actions (API logic)
│   ├── cover-letter.js  # Cover letter generation
│   ├── dashboard.js     # Industry insights
│   ├── interview.js     # Quiz generation
│   ├── resume.js        # Resume management
│   └── user.js          # User onboarding
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication routes
│   ├── (main)/         # Main application routes
│   │   ├── ai-cover-letter/
│   │   ├── dashboard/
│   │   ├── interview/
│   │   ├── onboarding/
│   │   └── resume/
│   ├── api/            # API routes
│   └── lib/            # Shared utilities & schemas
├── components/         # Reusable UI components
│   └── ui/            # shadcn/ui components
├── data/              # Static data files
│   ├── faqs.js
│   ├── features.js
│   ├── howItWorks.js
│   ├── industries.js
│   └── tools.js
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── inngest/      # Background job functions
│   ├��─ checkUser.js
│   ├── prisma.js
│   └── utils.js
├── prisma/            # Database schema
│   └── schema.prisma
├── public/            # Static assets
└── middleware.js      # Next.js middleware for auth
```

## 🎯 Core Features Explained

### AI Resume Builder

Create professional, ATS-optimized resumes with AI assistance:

- **Markdown Editor**: Real-time preview with MDEditor
- **AI Content Improvement**: Enhance descriptions with Gemini AI
- **Structured Sections**: Contact info, summary, skills, experience, education, projects
- **PDF Export**: Download your resume as a professional PDF
- **Auto-save**: Never lose your progress

### AI Cover Letter Generator

Generate personalized cover letters:

- **Job-Specific**: Tailored to job title, company, and job description
- **Profile-Aware**: Uses your industry, skills, and experience
- **Professional Tone**: Engaging and professional language
- **Markdown Support**: Edit and customize generated content
- **Save & Reuse**: Store multiple cover letters

### Mock Interview Practice

Practice with AI-generated technical questions:

- **Industry-Specific**: Questions tailored to your field
- **Skill-Based**: Covers your expertise areas
- **Instant Feedback**: Correct answers with explanations
- **Progress Tracking**: View performance history and trends
- **Multiple Choice**: 10 questions per quiz session

### Industry Insights Dashboard

Stay ahead with real-time market data:

- **Salary Ranges**: Role-specific compensation data
- **Growth Metrics**: Industry growth rates and projections
- **Demand Levels**: Job market demand analysis
- **Top Skills**: Most in-demand skills for your industry
- **Market Outlook**: Positive/Neutral/Negative trends
- **Auto-Update**: Weekly refresh via Inngest cron jobs

## 🧪 Testing

This project implements comprehensive testing using modern testing frameworks.

### Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Database Testing**: Prisma with test database
- **Type Validation**: Zod schema testing
- **Code Coverage**: Jest Coverage

### Setup Testing Environment

```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D playwright @playwright/test
npm install -D supertest jest-mock-extended
npm install -D @testing-library/react-hooks
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint
```

### Test Structure

#### 1. **Unit Tests** (`__tests__/unit/`)

Testing individual functions and utilities.



#### 2. **Component Tests** (`__tests__/components/`)

Testing React components with user interactions.


#### 3. **Integration Tests** (`__tests__/integration/`)

Testing server actions and database operations.


#### 5. **AI Function Mocking**

Mock Gemini AI responses for testing.

### Testing Best Practices

1. **Test User Behavior**: Focus on what users do, not implementation details
2. **Mock External APIs**: Mock Gemini AI, Clerk, and other third-party services
3. **Use Test Database**: Separate test database from development
4. **Clean Up After Tests**: Reset database state between tests
5. **Test Edge Cases**: Empty states, errors, validation failures
6. **Accessibility Testing**: Ensure components are accessible
7. **Coverage Goals**: Maintain >80% code coverage

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Continuous Integration



## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build & Deploy
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run postinstall     # Generate Prisma client (runs automatically)

# Code Quality
npm run lint            # Run ESLint

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate coverage report
```

## 🔧 Configuration

### Database Schema (Prisma)

The app uses the following main models:
- `User`: User accounts with Clerk integration
- `IndustryInsight`: Cached industry analysis data
- `Resume`: Resume content and metadata
- `Coverletter`: Generated cover letters
- `Assessment`: Quiz results and performance tracking

### Inngest Background Jobs

- **Industry Insights Update**: Runs every Sunday at midnight
- **AI-Powered Analysis**: Generates market insights for all industries
- **Automatic Caching**: Stores results in database for quick access

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Live Demo**: [https://carv-ai-iota.vercel.app](https://carv-ai-iota.vercel.app)

**Repository**: [https://github.com/Varshanth2025/carvAi](https://github.com/Varshanth2025/carvAi)

**Developed by**: Varshanth
