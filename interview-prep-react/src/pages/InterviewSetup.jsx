import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Code, Rocket } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function InterviewSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    goal: '',
    level: '',
    domain: '',
    companyStyle: 'General'
  })


  const goals = [
    { 
      id: 'full', 
      name: 'Full Technical Interview', 
      desc: 'Complete interview with all rounds (45-60 min)',
      icon: '🎯'
    },
    { 
      id: 'focused', 
      name: 'Focused Practice', 
      desc: 'Practice specific skills and topics (20-30 min)',
      icon: '🎓'
    },
    { 
      id: 'quick', 
      name: 'Quick Mock', 
      desc: 'Fast practice session (15 min)',
      icon: '⚡'
    }
  ]

  const levels = [
    { id: 'internship', name: 'Internship', desc: 'Entry-level basics and fundamentals' },
    { id: 'entry', name: 'Entry-level', desc: 'Junior developer positions' },
    { id: 'mid', name: 'Mid-level', desc: 'Experienced developer roles' }
  ]

  const domains = [
    { id: 'dsa', name: 'DSA', desc: 'Data Structures & Algorithms' },
    { id: 'web', name: 'Web / Backend', desc: 'Full-stack or backend development' },
    { id: 'ml', name: 'ML / Data', desc: 'Machine Learning & Data Science' },
    { id: 'core', name: 'Core CS', desc: 'Computer Science fundamentals' }
  ]

  const companyStyles = [
    { id: 'General', name: 'General', desc: 'Standard interview format for most companies' },
    { id: 'Google', name: 'Google', desc: 'Focus on algorithms and problem-solving depth' },
    { id: 'Amazon', name: 'Amazon', desc: 'Leadership principles and behavioral focus' },
    { id: 'Microsoft', name: 'Microsoft', desc: 'Technical depth with collaboration emphasis' },
    { id: 'Meta', name: 'Meta', desc: 'Product thinking and system design balanced' },
    { id: 'Startup', name: 'Startup', desc: 'Practical skills and quick decision-making' }
  ]

  const handleStart = () => {
    const profileData = localStorage.getItem('profileData')
    const interviewRole = localStorage.getItem('interviewRole')
    
    const interviewConfig = {
      ...config,
      profileData: profileData ? JSON.parse(profileData) : null,
      interviewRole: interviewRole || 'Software Engineer',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('interviewConfig', JSON.stringify(interviewConfig))
    navigate('/interview')
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
          <h1 className="text-6xl font-hand font-bold text-gray-900 mb-2">
            Interview Setup
          </h1>
          <p className="text-xl font-comic text-gray-600">
            Step {step} of 4
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-3 bg-gray-200 rounded-full border-2 border-gray-400 overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step 1: Interview Goal */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div className="card-sketch">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-black" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">
                  Choose Your Goal
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {goals.map((goal) => (
                  <motion.button
                    key={goal.id}
                    onClick={() => setConfig({...config, goal: goal.id})}
                    className={`w-full p-6 rounded-lg border-4 text-left transition-all ${
                      config.goal === goal.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{goal.icon}</div>
                      <div className="flex-1">
                        <p className="font-bold text-xl mb-1">{goal.name}</p>
                        <p className={`text-sm ${
                          config.goal === goal.id ? 'text-gray-300' : 'text-gray-600'
                        }`}>{goal.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setStep(2)}
                disabled={!config.goal}
                className="w-full btn-sketch bg-black text-white py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: config.goal ? 1.02 : 1 }}
                whileTap={{ scale: config.goal ? 0.98 : 1 }}
              >
                Next: Target Level →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Target Level */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div className="card-sketch">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-black" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">
                  Target Level
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {levels.map((level) => (
                  <motion.button
                    key={level.id}
                    onClick={() => setConfig({...config, level: level.id})}
                    className={`w-full p-6 rounded-lg border-4 text-left transition-all ${
                      config.level === level.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-bold text-xl mb-1">{level.name}</p>
                    <p className={`text-sm ${
                      config.level === level.id ? 'text-gray-300' : 'text-gray-600'
                    }`}>{level.desc}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-sketch bg-white text-black py-4 text-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  disabled={!config.level}
                  className="flex-1 btn-sketch bg-black text-white py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: config.level ? 1.02 : 1 }}
                  whileTap={{ scale: config.level ? 0.98 : 1 }}
                >
                  Next: Primary Domain →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Primary Domain */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div className="card-sketch">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-8 h-8 text-black" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">
                  Primary Domain
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {domains.map((domain) => (
                  <motion.button
                    key={domain.id}
                    onClick={() => setConfig({...config, domain: domain.id})}
                    className={`w-full p-6 rounded-lg border-4 text-left transition-all ${
                      config.domain === domain.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-bold text-xl mb-1">{domain.name}</p>
                    <p className={`text-sm ${
                      config.domain === domain.id ? 'text-gray-300' : 'text-gray-600'
                    }`}>{domain.desc}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(2)}
                  className="flex-1 btn-sketch bg-white text-black py-4 text-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(4)}
                  disabled={!config.domain}
                  className="flex-1 btn-sketch bg-black text-white py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: config.domain ? 1.02 : 1 }}
                  whileTap={{ scale: config.domain ? 0.98 : 1 }}
                >
                  Next: Company Style →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Company Style */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div className="card-sketch">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-8 h-8 text-black" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">
                  Company Style (Optional)
                </h2>
              </div>

              <p className="text-gray-600 font-bold mb-6">
                Choose an interview style or keep it General
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {companyStyles.map((company) => (
                  <motion.button
                    key={company.id}
                    onClick={() => setConfig({...config, companyStyle: company.id})}
                    className={`p-6 rounded-lg border-4 text-left transition-all ${
                      config.companyStyle === company.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-bold text-xl mb-1">{company.name}</p>
                    <p className={`text-sm ${
                      config.companyStyle === company.id ? 'text-gray-300' : 'text-gray-600'
                    }`}>{company.desc}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(3)}
                  className="flex-1 btn-sketch bg-white text-black py-4 text-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={handleStart}
                  className="flex-1 btn-sketch bg-black text-white py-4 text-xl flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Rocket className="w-6 h-6" />
                  Start Interview!
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
