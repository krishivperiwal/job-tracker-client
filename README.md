# Job Tracker Client

React frontend for the Job Tracker API. Built with Vite, React, and Tailwind CSS.

## Live Demo
[job-tracker-client.vercel.app](https://job-tracker-client.vercel.app)

## Features
- JWT authentication with protected routes
- Create and manage job applications
- Filter applications by status
- Per-application detail page with full edit capability
- Interview stage tracking — add, update result, delete stages
- Resume upload directly from the UI
- Analytics dashboard — status breakdown with progress bars

## Tech Stack
- React 18 + Vite
- React Router v6
- Axios with JWT interceptor
- React Hook Form
- Context API for global auth state
- Tailwind CSS v3

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | /login | JWT login |
| Signup | /signup | Register account |
| Dashboard | /dashboard | Overview and navigation |
| Applications | /applications | Create and list applications |
| Application Detail | /applications/:id | Edit, upload resume, manage interviews |
| Analytics | /analytics | Status breakdown and counts |

## Setup

```bash
git clone https://github.com/krishivperiwal/job-tracker-client
cd job-tracker-client
npm install
npm run dev
```

Make sure the backend is running on `http://localhost:5000`.

## Backend
API repo: [job-tracker-api](https://github.com/krishivperiwal/job-tracker-api)
