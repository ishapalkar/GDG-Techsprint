import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Trophy, Clock, MessageCircle, TrendingUp, Target, 
  ArrowRight, Home, BarChart3, Award, Star, ThumbsUp, Lightbulb,
  Camera, Activity, Smile, Zap, Brain, Repeat, AlertTriangle, Eye, Shield
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function InterviewResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const [interviewData, setInterviewData] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readinessScore, setReadinessScore] = useState(0)
  const [strengths, setStrengths] = useState([])
  const [improvements, setImprovements] = useState([])
  const [nextRecommendation, setNextRecommendation] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('lastInterview')
    if (!data) {
      navigate('/profile')
      return
    }

    const interview = JSON.parse(data)
    setInterviewData(interview)

    // Check if we have an analysis_id from the location state
    const analysisId = location.state?.analysisId || interview.analysisId

    if (analysisId) {
      // Fetch real AI analysis from backend
      fetchAIAnalysis(analysisId)
    } else {
      // Generate mock feedback if no AI analysis available
      generateMockFeedback(interview)
      setLoading(false)
    }
  }, [navigate, location])

  const fetchAIAnalysis = async (analysisId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/interview/analysis/${analysisId}/`)
      
      if (response.ok) {
        const data = await response.json()
        setAiAnalysis(data)
        
        // Set readiness score from AI confidence
        setReadinessScore(data.confidence_score || 70)
        
        // Process AI strengths and improvements
        processAIFeedback(data)
      } else {
        console.error('Failed to fetch AI analysis')
        generateMockFeedback(interviewData)
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error)
      generateMockFeedback(interviewData)
    } finally {
      setLoading(false)
    }
  }

  const processAIFeedback = (analysis) => {
    // Process strengths from AI
    const aiStrengths = analysis.strengths?.map((strength, idx) => ({
      icon: [ThumbsUp, Star, Brain, Smile, Zap][idx % 5],
      title: `Strength ${idx + 1}`,
      desc: strength
    })) || []
    setStrengths(aiStrengths)

    // Process improvements from AI
    const aiImprovements = analysis.improvements?.map((improvement, idx) => ({
      icon: [Lightbulb, Target, Activity, MessageCircle, TrendingUp][idx % 5],
      title: `Improvement ${idx + 1}`,
      desc: improvement
    })) || []
    setImprovements(aiImprovements)

    // Generate next recommendation
    generateNextRecommendation(interviewData, analysis.confidence_score)
  }

  const generateMockFeedback = (interview) => {
    // Calculate Interview Readiness Score (more realistic)
    const score = calculateReadinessScore(interview)
    setReadinessScore(score)

    // Generate strengths and improvements
    generateFeedback(interview, score)
    
    // Generate next interview recommendation
    generateNextRecommendation(interview, score)
  }

  const calculateReadinessScore = (interview) => {
    // Base score
    let score = 70
    
    // Bonus for completing all rounds
    if (interview.rounds && interview.rounds.filter(r => r.completed).length === 4) {
      score += 10
    }
    
    // Bonus for response quality (simulated)
    const responseCount = interview.chatMessages?.filter(m => m.type === 'user').length || 0
    if (responseCount >= 10) score += 10
    
    // Random variation
    score += Math.floor(Math.random() * 10)
    
    return Math.min(score, 95) // Cap at 95
  }

  const generateFeedback = (interview, score) => {
    // 3 Strengths
    const allStrengths = [
      { icon: ThumbsUp, title: 'Clear Communication', desc: 'Articulated thoughts clearly with structured responses' },
      { icon: Star, title: 'Problem-Solving', desc: 'Systematic approach to breaking down complex problems' },
      { icon: Brain, title: 'Technical Knowledge', desc: 'Strong grasp of fundamental concepts and best practices' },
      { icon: Smile, title: 'Confidence', desc: 'Maintained composure and confidence throughout' },
      { icon: Zap, title: 'Quick Thinking', desc: 'Fast response time with well-thought answers' }
    ]
    setStrengths(allStrengths.slice(0, 3))
    
    // 3 Improvement Actions
    const allImprovements = [
      { icon: Lightbulb, title: 'Dive Deeper', desc: 'Provide more implementation details in technical answers' },
      { icon: Target, title: 'Time Management', desc: 'Balance time across different sections more effectively' },
      { icon: Activity, title: 'Body Language', desc: 'Work on maintaining eye contact with the camera' },
      { icon: MessageCircle, title: 'Clarity', desc: 'Use more specific examples from your experience' },
      { icon: TrendingUp, title: 'Follow-up', desc: 'Ask clarifying questions before jumping to solutions' }
    ]
    setImprovements(allImprovements.slice(0, 3))
  }

  const generateCameraInsight = () => {
    const insights = [
      {
        icon: Camera,
        text: 'Maintained good posture and eye contact 78% of the time',
        metric: '78%',
        color: 'green'
      },
      {
        icon: Smile,
        text: 'Positive facial expressions detected during behavioral round',
        metric: '92%',
        color: 'green'
      },
      {
        icon: Activity,
        text: 'Minimal fidgeting observed, showing confidence',
        metric: 'Low',
        color: 'green'
      }
    ]
    setCameraInsight(insights[Math.floor(Math.random() * insights.length)])
  }

  const generateStressMarkers = (interview) => {
    const totalDuration = interview.duration || 0
    // Create 4-6 stress markers at different timestamps
    const markers = [
      { time: Math.floor(totalDuration * 0.1), level: 'low', label: 'Introduction' },
      { time: Math.floor(totalDuration * 0.3), level: 'medium', label: 'Technical Question' },
      { time: Math.floor(totalDuration * 0.55), level: 'high', label: 'Complex Problem' },
      { time: Math.floor(totalDuration * 0.75), level: 'medium', label: 'Behavioral Round' },
      { time: Math.floor(totalDuration * 0.9), level: 'low', label: 'Closing' }
    ]
    setStressMarkers(markers)
  }

  const generateNextRecommendation = (interview, score) => {
    const config = interview.config || {}
    
    if (score >= 85) {
      setNextRecommendation({
        title: 'System Design Interview',
        reason: "You're ready for senior-level topics",
        difficulty: 'Advanced',
        icon: '🏗️'
      })
    } else if (score >= 75) {
      setNextRecommendation({
        title: 'Full Mock Interview',
        reason: 'Polish your skills with a complete simulation',
        difficulty: 'Medium',
        icon: '🎯'
      })
    } else {
      setNextRecommendation({
        title: 'Focused DSA Practice',
        reason: 'Strengthen your algorithmic problem-solving',
        difficulty: 'Beginner',
        icon: '💪'
      })
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} min ${seconds % 60} sec`
  }

  if (!interviewData) return null

  const { config, duration, chatMessages, completedAt, rounds } = interviewData

  // Calculate metrics
  const responseCount = chatMessages?.filter(m => m.type === 'user').length || 0
  const avgResponseTime = responseCount > 0 ? Math.floor(duration / responseCount) : 0
  const completedRounds = rounds?.filter(r => r.completed).length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-4 bg-white border-4 border-black rounded-full mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-5xl font-hand font-bold text-gray-900 mb-2">
            Interview Complete!
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            Completed {completedRounds} out of 4 rounds
          </p>
        </motion.div>

        {/* Interview Readiness Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-100 border-4 border-black rounded-2xl p-8 mb-8 text-center"
        >
          <div className="mb-4">
            <div className="text-sm font-bold text-gray-600 mb-2">INTERVIEW READINESS SCORE</div>
            <div className="text-8xl font-hand font-bold text-gray-900">{readinessScore}</div>
            <div className="text-2xl font-bold text-gray-600 mt-2">Out of 100</div>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`w-8 h-8 ${
                  idx < Math.floor(readinessScore / 20)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="inline-block px-6 py-2 bg-black text-white rounded-full font-bold">
            {readinessScore >= 90 ? 'Exceptional Performance!' :
             readinessScore >= 80 ? 'Very Strong!' :
             readinessScore >= 70 ? 'Good Progress!' : 'Keep Practicing!'}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-sketch bg-white p-6"
          >
            <Clock className="w-8 h-8 text-gray-700 mb-3" />
            <div className="text-3xl font-hand font-bold text-gray-900">
              {formatDuration(duration)}
            </div>
            <div className="text-sm font-bold text-gray-600 mt-1">Total Duration</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-sketch bg-white p-6"
          >
            <MessageCircle className="w-8 h-8 text-gray-700 mb-3" />
            <div className="text-3xl font-hand font-bold text-gray-900">
              {responseCount}
            </div>
            <div className="text-sm font-bold text-gray-600 mt-1">Questions Answered</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-sketch bg-white p-6"
          >
            <TrendingUp className="w-8 h-8 text-gray-700 mb-3" />
            <div className="text-3xl font-hand font-bold text-gray-900">
              {avgResponseTime}s
            </div>
            <div className="text-sm font-bold text-gray-600 mt-1">Avg Response Time</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-sketch bg-white p-6"
          >
            <Award className="w-8 h-8 text-gray-700 mb-3" />
            <div className="text-3xl font-hand font-bold text-gray-900">
              {completedRounds}/4
            </div>
            <div className="text-sm font-bold text-gray-600 mt-1">Rounds Completed</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card-sketch bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-hand font-bold text-gray-900">Your Strengths</h2>
            </div>

            <div className="space-y-4">
              {strengths.map((strength, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className="p-4 rounded-lg border-2 bg-green-50 border-green-500"
                >
                  <div className="flex items-start gap-3">
                    <strength.icon className="w-5 h-5 mt-1 text-green-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{strength.title}</h3>
                      <p className="text-sm text-gray-700 font-comic">{strength.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Improvement Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card-sketch bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-hand font-bold text-gray-900">Improvement Actions</h2>
            </div>

            <div className="space-y-4">
              {improvements.map((improvement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className="p-4 rounded-lg border-2 bg-blue-50 border-blue-500"
                >
                  <div className="flex items-start gap-3">
                    <improvement.icon className="w-5 h-5 mt-1 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{improvement.title}</h3>
                      <p className="text-sm text-gray-700 font-comic">{improvement.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Analysis Sections - Only show if we have real AI data */}
        {aiAnalysis && (
          <>
            {/* Emotional & Confidence Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="card-sketch bg-gradient-to-br from-purple-50 to-pink-50 p-8 mb-8 border-4 border-purple-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">AI Performance Analysis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Emotional Trend</h3>
                  <p className="font-comic text-gray-700 bg-white p-4 rounded-lg border-2 border-purple-300">
                    {aiAnalysis.emotion_trend}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Confidence Score</h3>
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-5xl font-hand font-bold text-purple-600">
                        {aiAnalysis.confidence_score}
                      </span>
                      <span className="text-2xl font-bold text-gray-600">/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${aiAnalysis.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Communication Analysis</h3>
                  <p className="font-comic text-gray-700 bg-white p-4 rounded-lg border-2 border-purple-300">
                    {aiAnalysis.communication_analysis}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Integrity & Behavioral Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="card-sketch bg-gradient-to-br from-yellow-50 to-orange-50 p-8 mb-8 border-4 border-orange-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">Behavioral Integrity Analysis</h2>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-700 mt-1 flex-shrink-0" />
                <p className="text-sm font-comic text-gray-800">
                  <strong>Disclaimer:</strong> These are behavioral observations only and should not be used as the sole basis for hiring decisions. 
                  Integrity indicators are probabilistic, not deterministic.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border-2 border-orange-300">
                  <Eye className="w-10 h-10 text-orange-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Eye Movement</h3>
                  <p className="font-comic text-gray-700 text-sm">
                    {aiAnalysis.eye_movement_pattern}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-orange-300">
                  <Activity className="w-10 h-10 text-orange-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Attention Level</h3>
                  <div className={`inline-block px-4 py-2 rounded-full font-bold text-white ${
                    aiAnalysis.attention_level === 'high' ? 'bg-green-500' :
                    aiAnalysis.attention_level === 'moderate' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {aiAnalysis.attention_level?.toUpperCase()}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-orange-300">
                  <AlertTriangle className="w-10 h-10 text-orange-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Suspicion Risk</h3>
                  <div className={`inline-block px-4 py-2 rounded-full font-bold text-white ${
                    aiAnalysis.suspicion_risk === 'low' ? 'bg-green-500' :
                    aiAnalysis.suspicion_risk === 'medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {aiAnalysis.suspicion_risk?.toUpperCase()}
                  </div>
                  <p className="font-comic text-gray-700 text-sm mt-3">
                    {aiAnalysis.integrity_notes}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Relative Ranking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="card-sketch bg-gradient-to-br from-blue-50 to-indigo-50 p-8 mb-8 border-4 border-blue-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-hand font-bold text-gray-900">Relative Ranking</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border-2 border-blue-300 text-center">
                  <div className="text-6xl font-hand font-bold text-blue-600 mb-2">
                    {aiAnalysis.ranking_position}
                  </div>
                  <div className="text-sm font-bold text-gray-600">Your Position</div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-blue-300 text-center">
                  <div className="text-6xl font-hand font-bold text-gray-700 mb-2">
                    {aiAnalysis.total_participants}
                  </div>
                  <div className="text-sm font-bold text-gray-600">Total Participants</div>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-blue-300 text-center">
                  <div className="text-3xl font-hand font-bold text-indigo-600 mb-2">
                    {aiAnalysis.percentile_band}
                  </div>
                  <div className="text-sm font-bold text-gray-600">Performance Band</div>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg border-2 border-blue-300">
                <p className="font-comic text-gray-700 text-center">
                  {aiAnalysis.ranking_position === 1 ? '🏆 Congratulations! You ranked first among all participants!' :
                   aiAnalysis.ranking_position <= 3 ? '🥈 Excellent performance! You\'re in the top tier.' :
                   aiAnalysis.percentile_band?.includes('Top') ? '👍 Solid performance! Above average among peers.' :
                   '💪 Keep practicing to improve your ranking!'}
                </p>
              </div>
            </motion.div>
          </>
        )}

        {/* Next Interview Recommendation */}
        {nextRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="card-sketch bg-gradient-to-br from-black to-gray-800 text-white p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Repeat className="w-6 h-6" />
              <h2 className="text-2xl font-hand font-bold">Recommended Next Interview</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl mb-3">{nextRecommendation.icon}</div>
                <h3 className="text-3xl font-hand font-bold mb-2">{nextRecommendation.title}</h3>
                <p className="text-gray-300 font-comic mb-2">{nextRecommendation.reason}</p>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                  Difficulty: {nextRecommendation.difficulty}
                </div>
              </div>
              <motion.button
                onClick={() => navigate('/interview-setup')}
                className="btn-sketch bg-white text-black px-8 py-3 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="card-sketch bg-white p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-hand font-bold text-gray-900">Interview Replay Timeline</h2>
          </div>

          <div className="space-y-4">
            {chatMessages?.filter(m => m.type === 'ai').slice(0, 5).map((msg, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-black rounded-full" />
                  {idx < Math.min(chatMessages.filter(m => m.type === 'ai').length, 5) - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                    <p className="font-comic text-gray-700">{msg.message.substring(0, 100)}{msg.message.length > 100 ? '...' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.button
            onClick={() => navigate('/interview-setup')}
            className="btn-sketch bg-black text-white px-8 py-3 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Another Interview
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => navigate('/stats')}
            className="btn-sketch bg-white text-black px-8 py-3 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="w-5 h-5" />
            View All Stats
          </motion.button>

          <motion.button
            onClick={() => navigate('/')}
            className="btn-sketch bg-white text-black px-8 py-3 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
