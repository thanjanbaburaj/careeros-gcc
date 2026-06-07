import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'
import { useAuth } from './hooks/useAuth.js'

// Lazy-loaded modules — zero interdependency
const Landing      = lazy(() => import('./modules/auth/Landing.jsx'))
const Register     = lazy(() => import('./modules/auth/Register.jsx'))
const Login        = lazy(() => import('./modules/auth/Login.jsx'))
const Dashboard    = lazy(() => import('./modules/auth/Dashboard.jsx'))
const JobFeed      = lazy(() => import('./modules/jobs/JobFeed.jsx'))
const Tracker      = lazy(() => import('./modules/tracker/Tracker.jsx'))
const CVBuilder    = lazy(() => import('./modules/cv/CVBuilder.jsx'))
const Interview    = lazy(() => import('./modules/interview/Interview.jsx'))
const Network      = lazy(() => import('./modules/network/Network.jsx'))
const Wellbeing    = lazy(() => import('./modules/wellbeing/Wellbeing.jsx'))
const Community    = lazy(() => import('./modules/community/Community.jsx'))
const Freelance    = lazy(() => import('./modules/freelance/Freelance.jsx'))
const Assistant    = lazy(() => import('./modules/ai-assistant/Assistant.jsx'))

// Protected route wrapper
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/"         element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/* Protected routes inside AppShell */}
        <Route path="/" element={<Protected><AppShell /></Protected>}>
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="jobs"       element={<JobFeed />} />
          <Route path="tracker"    element={<Tracker />} />
          <Route path="cv"         element={<CVBuilder />} />
          <Route path="interview"  element={<Interview />} />
          <Route path="network"    element={<Network />} />
          <Route path="wellbeing"  element={<Wellbeing />} />
          <Route path="community"  element={<Community />} />
          <Route path="freelance"  element={<Freelance />} />
          <Route path="assistant"  element={<Assistant />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
