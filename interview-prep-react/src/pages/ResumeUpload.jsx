import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function ResumeUpload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (selectedFile) => {
    setError('')
    
    // Validate file type
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume file first')
      return
    }

    setIsAnalyzing(true)
    
    // Simulate resume analysis
    setTimeout(() => {
      // Mock extracted data
      const resumeData = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        parsedData: {
          name: 'John Doe', // Would be extracted from PDF
          experience: '2 years',
          domain: 'Software Engineering',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          education: 'BS Computer Science'
        }
      }
      
      // Save to localStorage
      localStorage.setItem('resumeData', JSON.stringify(resumeData))
      
      // Navigate to profile summary
      navigate('/profile-summary')
    }, 3000) // 3 second analysis simulation
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-hand font-bold text-gray-900 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-xl text-gray-600 font-comic">
            We'll analyze your experience to create a personalized interview
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-sketch mb-6"
        >
          {!isAnalyzing ? (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-black bg-gray-100 scale-105'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-400 bg-gray-50 hover:border-black hover:bg-gray-100'
                }`}
              >
                {!file ? (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-hand font-bold text-gray-900 mb-2">
                      Drop your resume here
                    </h3>
                    <p className="text-gray-600 font-comic mb-4">
                      or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-sketch bg-black text-white px-8 py-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose PDF File
                    </motion.button>
                    <p className="text-sm text-gray-500 font-comic mt-4">
                      Maximum file size: 10MB • PDF format only
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-hand font-bold text-gray-900 mb-2">
                      {file.name}
                    </h3>
                    <p className="text-gray-600 font-comic mb-4">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <motion.button
                      onClick={() => {
                        setFile(null)
                        setError('')
                      }}
                      className="text-gray-600 font-bold hover:text-black underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      Choose different file
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border-4 border-red-400 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-900 font-bold">{error}</p>
                </motion.div>
              )}

              <motion.button
                onClick={handleUpload}
                disabled={!file}
                className="w-full btn-sketch bg-black text-white py-4 text-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: file ? 1.02 : 1 }}
                whileTap={{ scale: file ? 0.98 : 1 }}
              >
                Continue to Profile
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Loader className="w-16 h-16 text-black mx-auto mb-6 animate-spin" />
              <h3 className="text-3xl font-hand font-bold text-gray-900 mb-3">
                Analyzing Resume...
              </h3>
              <p className="text-lg text-gray-600 font-comic mb-6">
                Extracting your experience, skills, and qualifications
              </p>
              <div className="space-y-2">
                {['Reading document...', 'Extracting skills...', 'Analyzing experience...', 'Creating profile...'].map((text, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.7 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 font-comic">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info Cards */}
        {!isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Tailored Questions', desc: 'Based on your experience' },
              { icon: '🤖', title: 'AI-Powered', desc: 'Smart interview simulation' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Data stays on your device' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="card-sketch text-center p-6"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 font-comic">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
