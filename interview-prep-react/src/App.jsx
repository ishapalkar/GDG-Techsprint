import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Interviews from './pages/Interviews'
import Companies from './pages/Companies'
import Stats from './pages/Stats'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import ResumeUpload from './pages/ResumeUpload'
import ProfileSummary from './pages/ProfileSummary'
import InterviewSetup from './pages/InterviewSetup'
import InterviewScreen from './pages/InterviewScreen'
import InterviewResults from './pages/InterviewResults'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <Router>
      <div className="min-h-screen relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/interviews/*" element={<Interviews />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/profile-summary" element={<ProfileSummary />} />
          <Route path="/interview-setup" element={<InterviewSetup />} />
          <Route path="/interview" element={<InterviewScreen />} />
          <Route path="/interview-results" element={<InterviewResults />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
