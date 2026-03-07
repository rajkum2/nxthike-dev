# NxtHike - Project Guide

## Overview
NxtHike is a job/internship/courses/events portal built with React, TypeScript, Vite, Tailwind CSS, and Zustand for state management. Deployed on Netlify.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (optional, switchable via env)
- **Deployment**: Netlify

## Project Structure
```
src/
├── components/
│   ├── home/          # Home page sections (Hero, FeaturedJobs, FeaturedCompanies, PopularCourses, Testimonials, UpcomingEvents, CallToAction)
│   ├── layout/        # Navbar, Footer
│   └── ui/            # Reusable UI components (Badge, Button, Card, Input, Select, Pagination)
├── config/
│   └── dataSource.ts  # Controls JSON vs Supabase mode via VITE_DATA_SOURCE env var
├── data/              # Static data files (jobs.ts, courses.ts, events.ts, companies.ts, index.ts)
├── lib/
│   └── supabase.ts    # Supabase client (real or mock based on data source mode)
├── pages/             # Route pages (HomePage, JobsPage, InternshipsPage, CoursesPage, EventsPage, etc.)
├── services/          # Data fetching layer (jobService, courseService, eventService, companyService, authService)
├── store/             # Zustand stores (jobStore, courseStore, eventStore, companyStore, authStore)
└── types/
    └── index.ts       # All TypeScript interfaces (Job, Course, Event, Company, User, etc.)
```

## Data Flow Architecture
```
Components/Pages → Zustand Stores → Services → Data Source (JSON or Supabase)
```

- **Services layer** (`src/services/`) abstracts data source. Each service checks `isJsonMode()` to decide whether to read from `src/data/` or query Supabase.
- **Config** (`src/config/dataSource.ts`): Reads `VITE_DATA_SOURCE` env var. Defaults to `'json'`.
- **Home components** (`src/components/home/`) import directly from `src/data/` for display (sliced subsets).
- **Page components** use Zustand stores which call services.

## Environment Variables
- `VITE_DATA_SOURCE` — `'json'` (default) or `'supabase'`
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Key Conventions
- Data files in `src/data/` are typed TypeScript arrays (not JSON files)
- Types are centralized in `src/types/index.ts`
- All stores follow same pattern: `fetch*`, `setFilters`, `clearFilters`, with `isLoading`/`error` state
- Home components slice data directly (`jobs.slice(0, 4)`, `events.slice(0, 3)`, etc.)
- Detail pages use extended types (`CourseDetail`, `EventDetail`) with extra fields like curriculum, reviews, agenda, speakers

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (uses `npx vite build`)
- `npx tsc --noEmit` — Type check without emitting

## Routing
All routes defined in `src/App.tsx`. Key routes:
- `/` — HomePage
- `/jobs`, `/jobs/:id` — Jobs listing and details
- `/internships` — Internships (filtered from same job data)
- `/courses`, `/courses/:id` — Courses listing and details
- `/events`, `/events/:id` — Events listing and details
- `/companies`, `/companies/:id` — Companies listing and details
- `/login`, `/register` — Auth pages
- `/dashboard`, `/employer/dashboard` — Dashboards
- `/contact`, `/pricing`, `/resume-tips`, `/career-advice` — Static pages
