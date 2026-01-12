import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code, Palette, MessageCircle, StopCircle, Mic, MicOff, 
  Video, Camera, Shield, Clock, Send, CheckCircle, AlertCircle, Brain
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function InterviewScreen() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('code')
  const [code, setCode] = useState('// Write your code here...\n\n')
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  
  // Camera consent & calibration states
  const [showCameraConsent, setShowCameraConsent] = useState(true)
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [calibrationStep, setCalibrationStep] = useState(0) // 0: request, 1: preview, 2: calibration, 3: complete
  const [calibrationCountdown, setCalibrationCountdown] = useState(15)
  const [mediaStream, setMediaStream] = useState(null)
  
  // Recording state for AI analysis
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const recordedChunksRef = useRef([]) // Use ref to capture chunks in real-time
  
  const chatEndRef = useRef(null)
  const videoPreviewRef = useRef(null)
  const videoLiveRef = useRef(null)

  
  // Interview rounds - system-controlled
  const interviewRounds = [
    {
      name: 'Resume Deep Dive',
      questions: [
        "Let's start with your resume. Can you walk me through your most recent project?",
        "What technologies did you use and why did you choose them?",
        "What challenges did you face and how did you overcome them?"
      ]
    },
    {
      name: 'Coding Round',
      questions: [
        "Let's move to coding. I'm going to give you a problem to solve. Feel free to use the code editor.",
        "Explain your approach before you start coding.",
        "Great! Now let's optimize this solution."
      ]
    },
    {
      name: 'CS Fundamentals',
      questions: [
        "Let's discuss some computer science fundamentals. What are the differences between a stack and a queue?",
        "Explain how hash tables work and their time complexity.",
        "What is the difference between process and thread?"
      ]
    },
    {
      name: 'Behavioral',
      questions: [
        "Tell me about a time when you had to work under pressure.",
        "Describe a situation where you had a conflict with a team member.",
        "Where do you see yourself in 5 years?"
      ]
    }
  ]

  useEffect(() => {
    const savedConfig = localStorage.getItem('interviewConfig')
    if (!savedConfig) {
      navigate('/interview-setup')
    } else {
      setConfig(JSON.parse(savedConfig))
      // Don't start interview yet - wait for camera consent
    }
  }, [navigate])

  // Camera permission and calibration
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      setMediaStream(stream)
      setCameraPermissionGranted(true)
      setMicPermissionGranted(true)
      setCalibrationStep(1)
      
      // Show preview in modal
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera access denied:', err)
      alert('Camera and microphone access are required for this interview. Please grant permissions.')
    }
  }

  const startCalibration = () => {
    setCalibrationStep(2)
    // Start 15 second countdown
    const timer = setInterval(() => {
      setCalibrationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          completeCalibration()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const completeCalibration = () => {
    setCalibrationStep(3)
    setTimeout(() => {
      setShowCameraConsent(false)
      startInterview()
      // Move stream to live video
      if (videoLiveRef.current && mediaStream) {
        videoLiveRef.current.srcObject = mediaStream
      }
      // Start recording for AI analysis
      startRecording()
    }, 1500)
  }

  const startRecording = () => {
    if (!mediaStream) {
      console.error('No media stream available for recording')
      return
    }

    try {
      // Reset chunks
      recordedChunksRef.current = []
      
      const options = { mimeType: 'video/webm;codecs=vp8,opus' }
      const recorder = new MediaRecorder(mediaStream, options)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          console.log(`📹 Captured chunk: ${event.data.size} bytes (total: ${recordedChunksRef.current.length} chunks)`)
        }
      }

      recorder.onstop = () => {
        console.log(`✅ Recording stopped. Total chunks: ${recordedChunksRef.current.length}`)
        setRecordedChunks(recordedChunksRef.current)
      }

      recorder.start(1000) // Capture data every second
      setMediaRecorder(recorder)
      setIsRecording(true)
      console.log('✅ Recording started for AI analysis')
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to start recording. Please check browser permissions.')
    }
  }

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
          console.log('⏹️ Recording stopped')
          resolve()
        }
        mediaRecorder.stop()
        setIsRecording(false)
      } else {
        resolve()
      }
    })
  }

  const uploadRecordingForAnalysis = async () => {
    // Use ref data directly since state might not be updated yet
    const chunks = recordedChunksRef.current
    
    if (chunks.length === 0) {
      console.error('No recorded data available')
      alert('No recording data found. The interview was not recorded.')
      return null
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // Create blob from recorded chunks
      const blob = new Blob(chunks, { type: 'video/webm' })
      const file = new File([blob], `interview_${Date.now()}.webm`, { type: 'video/webm' })
      
      console.log(`📤 Uploading interview recording (${(file.size / 1024 / 1024).toFixed(2)} MB)...`)
      console.log(`   Total chunks: ${chunks.length}`)
      setUploadProgress(30)

      // Get user UID from localStorage (Firebase auth)
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const uid = user?.uid || 'demo_user_123'

      // Create FormData
      const formData = new FormData()
      formData.append('uid', uid)
      formData.append('recording', file)
      formData.append('participant_count', '1') // Solo interview

      setUploadProgress(50)

      // Upload to backend
      const response = await fetch(`${API_URL}/interview/analyze/`, {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg = errorData.error || 'Upload failed'
        
        // Check if it's a quota error
        if (errorMsg.includes('quota') || errorMsg.includes('429')) {
          throw new Error('QUOTA_EXCEEDED: Gemini API daily quota reached. Please try again tomorrow or upgrade your API plan.')
        }
        
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setUploadProgress(100)
      
      console.log('✅ Analysis complete:', data)
      return data.analysis_id
    } catch (error) {
      console.error('❌ Failed to upload recording:', error)
      
      // Show user-friendly message for quota errors
      if (error.message.includes('QUOTA_EXCEEDED')) {
        alert('⚠️ AI Analysis Quota Exceeded\n\nThe Gemini API free tier limit has been reached (20 requests/day).\n\nOptions:\n1. Wait and try tomorrow\n2. Upgrade your Gemini API plan at https://ai.google.dev/\n\nYour interview data has been saved locally.')
      } else {
        alert(`Failed to analyze interview: ${error.message}`)
      }
      
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const startInterview = () => {
    // Initial AI message
    addAIMessage(`Hello! Welcome to your interview. We'll go through 4 rounds: Resume Deep Dive, Coding, CS Fundamentals, and Behavioral. Let's begin with Round 1: ${interviewRounds[0].name}.`)
    setTimeout(() => {
      addAIMessage(interviewRounds[0].questions[0])
    }, 1500)
  }

  useEffect(() => {
    if (!showCameraConsent) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showCameraConsent])

  useEffect(() => {
    return () => {
      // Cleanup camera stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaStream])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const addAIMessage = (message) => {
    setChatMessages(prev => [...prev, {
      type: 'ai',
      message,
      timestamp: new Date().toISOString()
    }])
  }

  const addUserMessage = (message) => {
    setChatMessages(prev => [...prev, {
      type: 'user',
      message,
      timestamp: new Date().toISOString()
    }])
  }

  const handleSendMessage = () => {
    if (!userInput.trim()) return
    
    addUserMessage(userInput)
    setUserInput('')
    
    // Simulate AI response with round progression
    setTimeout(() => {
      const currentRoundData = interviewRounds[currentRound]
      
      if (currentQuestion < currentRoundData.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        addAIMessage(currentRoundData.questions[currentQuestion + 1])
      } else if (currentRound < interviewRounds.length - 1) {
        // Move to next round
        setCurrentRound(prev => prev + 1)
        setCurrentQuestion(0)
        addAIMessage(`Great work! Let's move to Round ${currentRound + 2}: ${interviewRounds[currentRound + 1].name}`)
        setTimeout(() => {
          addAIMessage(interviewRounds[currentRound + 1].questions[0])
        }, 1500)
      } else {
        addAIMessage("Excellent! That completes all rounds of the interview. Thank you for your time!")
      }
    }, 2000)
  }

  const handleEndInterview = async () => {
    console.log('🛑 Ending interview...')
    
    // Stop recording and wait for it to finalize
    await stopRecording()
    
    // Wait a moment for the onstop event to process
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`📊 Chunks captured: ${recordedChunksRef.current.length}`)
    
    // Save interview data
    const interviewData = {
      config,
      duration: timeElapsed,
      chatMessages,
      code,
      completedAt: new Date().toISOString(),
      rounds: interviewRounds.map((round, idx) => ({
        name: round.name,
        completed: idx < currentRound || (idx === currentRound && currentQuestion === round.questions.length - 1)
      })),
      currentRound: interviewRounds[currentRound].name
    }
    
    // Upload recording for AI analysis
    const analysisId = await uploadRecordingForAnalysis()
    
    // Add analysis ID to interview data
    if (analysisId) {
      interviewData.analysisId = analysisId
      console.log(`✅ Analysis ID: ${analysisId}`)
    }
    
    localStorage.setItem('lastInterview', JSON.stringify(interviewData))
    
    // Cleanup camera
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
    }
    
    navigate('/interview-results', { state: { analysisId } })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!config) return null

  return (
    <>
      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl border-4 border-black max-w-md w-full p-8 text-center"
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
                </div>
                <h2 className="text-3xl font-hand font-bold text-gray-900 mb-2">
                  Analyzing Interview
                </h2>
                <p className="text-gray-600 font-comic">
                  Gemini AI is analyzing your performance...
                </p>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
                <p className="text-sm font-bold text-gray-700 mt-2">{uploadProgress}%</p>
              </div>

              <div className="text-xs text-gray-500 font-comic space-y-1">
                {uploadProgress < 40 && <p>📤 Uploading interview recording...</p>}
                {uploadProgress >= 40 && uploadProgress < 70 && <p>🤖 Analyzing emotions and voice patterns...</p>}
                {uploadProgress >= 70 && uploadProgress < 90 && <p>👁️ Detecting eye movement and attention...</p>}
                {uploadProgress >= 90 && <p>📊 Generating performance report...</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Consent & Calibration Overlay */}
      <AnimatePresence>
        {showCameraConsent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border-4 border-black max-w-2xl w-full p-8"
            >
              {/* Step 0: Permission Request */}
              {calibrationStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-4xl font-hand font-bold text-gray-900 mb-3">
                      Camera & Microphone Required
                    </h2>
                    <p className="text-lg text-gray-700 font-comic">
                      To simulate a real interview experience, we need access to your camera and microphone.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-4 border-blue-400 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900 mb-1">Privacy Note</p>
                      <p className="text-sm text-gray-700 font-comic">
                        Camera is used only for confidence analysis and feedback. No facial recognition. 
                        Data stays on your device and is not stored on any server.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={requestCameraAccess}
                    className="w-full btn-sketch bg-black text-white py-4 text-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Grant Camera & Mic Access
                  </motion.button>
                </div>
              )}

              {/* Step 1: Preview */}
              {calibrationStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-hand font-bold text-gray-900 mb-2">
                      Camera Preview
                    </h2>
                    <p className="text-lg text-gray-700 font-comic">
                      Make sure you're well-lit and clearly visible
                    </p>
                  </div>

                  <div className="relative">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      className="w-full h-80 object-cover rounded-lg border-4 border-black bg-gray-900"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-bold">Camera Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-900">Camera Ready</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-900">Microphone Ready</span>
                    </div>
                  </div>

                  <motion.button
                    onClick={startCalibration}
                    className="w-full btn-sketch bg-black text-white py-4 text-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Calibration
                  </motion.button>
                </div>
              )}

              {/* Step 2: Calibration */}
              {calibrationStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-hand font-bold text-gray-900 mb-2">
                      Calibration in Progress
                    </h2>
                    <p className="text-lg text-gray-700 font-comic">
                      Please say: "I am ready for this interview"
                    </p>
                  </div>

                  <div className="relative">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      className="w-full h-80 object-cover rounded-lg border-4 border-black bg-gray-900"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/80 text-white px-8 py-6 rounded-2xl text-center">
                        <div className="text-7xl font-hand font-bold mb-2">
                          {calibrationCountdown}
                        </div>
                        <div className="text-xl font-comic">seconds remaining</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-4 flex items-start gap-3">
                    <Mic className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1 animate-pulse" />
                    <p className="text-gray-800 font-comic">
                      Speak clearly and naturally. We're testing audio levels and your setup.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {calibrationStep === 3 && (
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-4xl font-hand font-bold text-gray-900 mb-3">
                      All Set!
                    </h2>
                    <p className="text-lg text-gray-700 font-comic">
                      Starting your interview now...
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interview Screen */}
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b-4 border-black px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-hand font-bold text-gray-900">
                Round {currentRound + 1}: {interviewRounds[currentRound].name}
              </h1>
              <p className="text-sm text-gray-600 font-bold">{config.domain}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-xl font-mono">{formatTime(timeElapsed)}</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg border-2 ${
                    isRecording ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-black'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </motion.button>
                
                {/* Camera Active Indicator - No toggle */}
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border-2 border-green-500 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-green-900">Camera Active</span>
                </div>
              </div>

              <motion.button
                onClick={handleEndInterview}
                className="btn-sketch bg-red-600 text-white px-6 py-2 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <StopCircle className="w-5 h-5" />
                End Interview
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Code Editor / Whiteboard */}
          <div className="flex-1 flex flex-col border-r-4 border-black">
            {/* Tabs */}
            <div className="bg-white border-b-2 border-black flex">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-3 px-6 font-bold flex items-center justify-center gap-2 border-r-2 border-black ${
                  activeTab === 'code' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Code className="w-5 h-5" />
                Code Editor
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex-1 py-3 px-6 font-bold flex items-center justify-center gap-2 ${
                  activeTab === 'whiteboard' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Palette className="w-5 h-5" />
                Whiteboard
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto relative">
              {activeTab === 'code' && (
                <div className="h-full">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-6 font-mono text-lg bg-gray-900 text-green-400 focus:outline-none resize-none"
                    placeholder="// Write your code here..."
                    spellCheck="false"
                  />
                </div>
              )}

              {activeTab === 'whiteboard' && (
                <div className="h-full bg-white p-4">
                  <WhiteboardCanvas />
                </div>
              )}

              {/* Small Camera Preview */}
              <div className="absolute bottom-4 right-4 w-48 h-36">
                <video
                  ref={videoLiveRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded-lg border-4 border-black bg-gray-900 shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="w-[400px] flex flex-col bg-white">
            <div className="bg-black text-white py-3 px-6 flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold text-lg">AI Interviewer</h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black border-2 border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-comic">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t-4 border-black p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your answer..."
                  className="flex-1 px-4 py-2 border-4 border-black rounded-lg font-comic focus:outline-none focus:ring-4 focus:ring-gray-400"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-black text-white rounded-lg border-4 border-black"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle Bar */}
        <div className="bg-black text-white py-3 px-6 border-t-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <p className="font-comic text-sm">
              {chatMessages.length > 0 
                ? chatMessages[chatMessages.length - 1].type === 'ai' 
                  ? chatMessages[chatMessages.length - 1].message 
                  : "Listening to your response..."
                : "Waiting for interview to start..."}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// Simple Whiteboard Component
function WhiteboardCanvas() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border-4 border-black rounded cursor-pointer"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="w-24"
          />
        </div>

        <button
          onClick={clearCanvas}
          className="ml-auto px-4 py-2 bg-white border-4 border-black rounded-lg font-bold hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 border-4 border-black rounded-lg cursor-crosshair"
      />
    </div>
  )
}
