# HireReady

An AI-powered job preparation platform that analyzes your resume against a job description, identifies skill gaps, and generates a personalized week-by-week study roadmap with curated learning resources.

## Features

- **AI Skill Gap Analysis** — Compares your resume to a job description and surfaces missing skills
- **Personalized Roadmaps** — Generates a 2-week, day-by-day study plan tailored to your experience level and timeline
- **Curated Resources** — Recommends courses and links (YouTube, Coursera, etc.) for each skill gap
- **Custom Courses** — Add your own course URLs alongside AI-recommended ones
- **Progress Tracking** — Check off tasks as you complete them
- **Multiple Pathways** — Save and manage roadmaps for different target roles

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| HTTP | Axios |
| Auth | AWS Cognito via AWS Amplify |
| Backend | AWS API Gateway + Lambda |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd job-roadmap-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Other Commands

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

## App Flow

1. **Landing Page** — Overview of the platform with a sample roadmap preview
2. **Sign Up / Login** — Email-based auth via AWS Cognito
3. **Onboarding** — Upload your resume (PDF), select your target role, experience level, and prep timeline
4. **Dashboard** — Create job pathways by pasting a job description, then:
   - Review your skill gap analysis
   - Select or add courses to address gaps
   - Generate your personalized roadmap
   - Track daily tasks week by week

## Project Structure

```
src/
├── App.jsx              # Root component with auth/routing logic
├── aws-exports.js       # AWS Cognito and API Gateway config
├── main.jsx
└── pages/
    ├── LandingPage.jsx
    ├── AuthPage.jsx
    ├── OnboardingPage.jsx
    └── Dashboard.jsx
```

## Supported Target Roles

Frontend Developer, Backend Developer, Fullstack Developer, DevOps Engineer, Data Scientist, ML Engineer, Data Engineer, Data Analyst, Android Developer, iOS Developer, Cloud Architect, Security Engineer, QA Engineer, Product Manager, UI/UX Designer, Systems Engineer, Embedded Systems Engineer, Blockchain Developer, Game Developer, and custom roles.
