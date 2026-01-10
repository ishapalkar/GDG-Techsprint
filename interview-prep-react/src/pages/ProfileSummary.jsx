import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Briefcase, Code, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function ProfileSummary() {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [interviewRole, setInterviewRole] = useState('')

  useEffect(() => {
    // Check if resume was uploaded
    const resumeData = localStorage.getItem('resumeData')
    if (!resumeData) {
      navigate('/resume-upload')
      return
    }

    const parsed = JSON.parse(resumeData)
    
    // Infer profile data from resume
    const inferredProfile = {
      name: parsed.parsedData.name,
      experienceLevel: inferExperienceLevel(parsed.parsedData.experience),
      primaryDomain: parsed.parsedData.domain,
      skills: parsed.parsedData.skills,
      education: parsed.parsedData.education
    }

    // Determine interview role
    const role = determineInterviewRole(inferredProfile)
    
    setProfileData(inferredProfile)
    setInterviewRole(role)

    // Save inferred profile
    localStorage.setItem('profileData', JSON.stringify(inferredProfile))
    localStorage.setItem('interviewRole', role)
  }, [navigate])

  const inferExperienceLevel = (exp) => {
    if (!exp) return 'Entry-level'
    const years = parseInt(exp)
    if (years < 2) return 'Entry-level'
    if (years < 5) return 'Mid-level'
    return 'Senior-level'
  }

  const determineInterviewRole = (profile) => {
    const { experienceLevel, primaryDomain } = profile
    
    // Map domain to specific role
    const domainToRole = {
      'Software Engineering': 'Software Engineer',
      'Frontend Development': 'Frontend Developer',
      'Backend Development': 'Backend Developer',
      'Full Stack': 'Full Stack Developer',
      'Data Science': 'Data Scientist',
      'Machine Learning': 'ML Engineer',
      'DevOps': 'DevOps Engineer'
    }

    const baseRole = domainToRole[primaryDomain] || 'Software Engineer'
    return `${experienceLevel} ${baseRole}`
  }

  if (!profileData) return null

  const handleContinue = () => {
    navigate('/interview-setup')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 border-4 border-green-500 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-900">Analysis Complete!</span>
          </div>
          
          <h1 className="text-6xl font-hand font-bold text-gray-900 mb-4">
            Your Profile Summary
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            We've analyzed your resume and prepared your interview
          </p>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-sketch mb-8 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-hand font-bold text-gray-900 mb-2">
              {profileData.name}
            </h2>
            <div className="inline-block px-4 py-2 bg-gray-100 border-2 border-gray-400 rounded-full">
              <span className="font-bold text-gray-700">{profileData.education}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border-4 border-blue-400 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-hand font-bold text-gray-900">
                  Experience Level
                </h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {profileData.experienceLevel}
              </p>
            </div>

            <div className="bg-purple-50 border-4 border-purple-400 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-hand font-bold text-gray-900">
                  Primary Domain
                </h3>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {profileData.primaryDomain}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-hand font-bold text-gray-900">
                Key Skills
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="px-4 py-2 bg-white border-2 border-black rounded-full font-bold text-gray-900"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Interview Role Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-sketch mb-8 p-8 bg-gradient-to-br from-white to-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-black" />
            <h3 className="text-2xl font-hand font-bold text-gray-900">
              Interview Simulation
            </h3>
          </div>
          
          <div className="bg-white border-4 border-black rounded-xl p-6 mb-4">
            <p className="text-lg text-gray-700 font-comic mb-3">
              We will simulate a:
            </p>
            <h4 className="text-4xl font-hand font-bold text-gray-900 mb-2">
              {interviewRole}
            </h4>
            <p className="text-gray-600 font-comic">
              Interview based on your resume and experience
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Resume Deep Dive', desc: 'Your projects & experience' },
              { label: 'Coding Round', desc: 'Technical problem solving' },
              { label: 'CS Fundamentals', desc: 'Core concepts & theory' },
              { label: 'Behavioral', desc: 'Soft skills & scenarios' }
            ].map((round, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4"
              >
                <p className="font-bold text-gray-900 mb-1">{round.label}</p>
                <p className="text-sm text-gray-600 font-comic">{round.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={handleContinue}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full btn-sketch bg-black text-white py-6 text-2xl flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Interview Setup
          <ArrowRight className="w-6 h-6" />
        </motion.button>

        {/* Info Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-500 font-comic mt-6"
        >
          You'll be able to customize your interview settings in the next step
        </motion.p>
      </div>
    </div>
  )
}
