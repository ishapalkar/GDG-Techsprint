import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code, MessageSquare, Database, Zap, Target, TrendingUp, Users, Sparkles, Rocket, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Interview Types */}
      <InterviewTypesSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* AI Features */}
      <AIFeaturesSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative pt-24 pb-32 px-4 overflow-hidden">
      {/* Animated background doodles */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 border-4 border-dashed border-blue-300 rounded-full"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute top-40 right-20 w-40 h-40 border-4 border-dashed border-gray-400 rounded-full"
        animate={{
          y: [0, 30, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <motion.div
        className="absolute bottom-20 left-1/4 w-24 h-24 border-4 border-green-400 rotate-12"
        animate={{
          y: [0, -20, 0],
          rotate: [12, 22, 12],
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
      />

      {/* Floating icons */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-7xl md:text-9xl font-hand font-bold text-gray-900 mb-4"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              InterviewPrep
            </motion.h1>
            
            <motion.div
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">AI-Powered</span>
              <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </motion.div>

            <div className="h-2 w-32 bg-black mx-auto rounded-full mb-6" />
            
            <p className="text-2xl md:text-3xl font-comic text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Master technical, behavioral, and system design interviews with real-time AI feedback and practice
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link to="/resume-upload">
              <motion.button
                className="btn-sketch bg-black text-white text-xl px-12 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Practicing
                <Rocket className="w-6 h-6" />
              </motion.button>
            </Link>
            
            <Link to="/interviews">
              <motion.button
                className="btn-sketch bg-white text-gray-900 text-xl px-12 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Questions
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 pt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { number: '500+', label: 'AI Questions' },
              { number: '50+', label: 'Companies' },
              { number: '10k+', label: 'Users' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="card-sketch text-center"
                whileHover={{ y: -5 }}
              >
                <p className="text-5xl md:text-6xl font-hand font-bold text-gray-900 mb-2">
                  {stat.number}
                </p>
                <p className="text-lg font-bold text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function InterviewTypesSection() {
  const types = [
    {
      title: 'Technical',
      description: 'Master coding, algorithms, data structures with AI-powered hints and real-time feedback.',
      icon: Code,
      color: 'border-4 border-black bg-white',
      path: '/interviews/technical',
    },
    {
      title: 'Behavioral',
      description: 'Practice STAR method responses with AI interview simulation and communication coaching.',
      icon: MessageSquare,
      color: 'border-4 border-black bg-white',
      path: '/interviews/behavioral',
    },
    {
      title: 'System Design',
      description: 'Design scalable systems with AI guidance on architecture patterns and best practices.',
      icon: Database,
      color: 'border-4 border-black bg-white',
      path: '/interviews/system-design',
    },
  ]

  return (
    <section className="py-24 px-4 bg-white border-t-4 border-b-4 border-dashed border-gray-400">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-6xl font-hand font-bold text-gray-900 mb-4">
            Interview Types
          </h2>
          <p className="text-xl font-comic text-gray-600">
            AI-powered practice for every interview challenge
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {types.map((type, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <Link to={type.path}>
                <motion.div
                  className="card-sketch h-full hover:border-4 hover:border-black"
                  whileHover={{ y: -8, rotate: idx % 2 === 0 ? 2 : -2 }}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl ${type.color} flex items-center justify-center mb-6 transform rotate-3`}
                    whileHover={{ rotate: -3, scale: 1.1 }}
                  >
                    <type.icon className="w-10 h-10 text-black" strokeWidth={2.5} />
                  </motion.div>
                  
                  <h3 className="text-3xl font-hand font-bold text-gray-900 mb-4">
                    {type.title}
                  </h3>
                  
                  <p className="text-lg font-comic text-gray-700 leading-relaxed mb-6">
                    {type.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-black font-bold">
                    <span>Start Learning</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Choose Type',
      description: 'Select interview type and difficulty level',
      icon: Target,
    },
    {
      number: '02',
      title: 'AI Practice',
      description: 'Get real-time AI feedback and hints',
      icon: Zap,
    },
    {
      number: '03',
      title: 'Review',
      description: 'Analyze solutions and improvements',
      icon: TrendingUp,
    },
    {
      number: '04',
      title: 'Track Progress',
      description: 'Monitor stats and skill development',
      icon: Users,
    },
  ]

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background doodles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 border-4 border-dashed border-yellow-300 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl font-hand font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl font-comic text-gray-600">
            Simple steps to ace your interviews
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <motion.div
                className="card-sketch text-center"
                whileHover={{ y: -10, rotate: idx % 2 === 0 ? 3 : -3 }}
              >
                <div className="relative inline-block mb-6">
                  <motion.div
                    className="text-7xl font-hand font-bold text-gray-200"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                  >
                    {step.number}
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    whileHover={{ scale: 1.2 }}
                  >
                    <step.icon className="w-12 h-12 text-black" strokeWidth={2.5} />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-hand font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-lg font-comic text-gray-700">
                  {step.description}
                </p>
              </motion.div>

              {/* Connecting arrows (except last item) */}
              {idx < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.5 }}
                >
                  <ArrowRight className="w-8 h-8 text-gray-600" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AIFeaturesSection() {
  const features = [
    {
      title: 'Real-time AI Feedback',
      description: 'Get instant analysis of your code, explanations, and suggestions for improvement',
      icon: Zap,
      color: 'bg-white border-4 border-black',
    },
    {
      title: 'Smart Hints System',
      description: 'Contextual hints that guide you without giving away the solution',
      icon: Sparkles,
      color: 'bg-white border-4 border-black',
    },
    {
      title: 'Interview Simulation',
      description: 'Practice with AI interviewer that adapts to your skill level',
      icon: Users,
      color: 'bg-white border-4 border-black',
    },
    {
      title: 'Performance Analytics',
      description: 'Track progress with detailed insights and personalized recommendations',
      icon: TrendingUp,
      color: 'bg-white border-4 border-black',
    },
  ]

  return (
    <section className="py-24 px-4 bg-gray-50 border-t-4 border-b-4 border-dashed border-gray-400">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-gray-900 fill-gray-900" />
            <h2 className="text-6xl font-hand font-bold text-gray-900">
              AI-Powered Features
            </h2>
            <Sparkles className="w-8 h-8 text-gray-900 fill-gray-900" />
          </div>
          <p className="text-xl font-comic text-gray-600">
            Practice smarter with artificial intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="card-sketch"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, rotate: idx % 2 === 0 ? 1 : -1 }}
            >
              <div className="flex items-start gap-6">
                <motion.div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 transform rotate-6`}
                  whileHover={{ rotate: -6, scale: 1.1 }}
                >
                  <feature.icon className="w-8 h-8 text-black" strokeWidth={2.5} />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-hand font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-lg font-comic text-gray-700">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="card-sketch bg-white border-4"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-8">
            <h2 className="text-5xl font-hand font-bold text-gray-900">
              Join Thousands of Successful Candidates
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '92%', label: 'Success Rate' },
                { number: '15k+', label: 'Problems Solved' },
                { number: '4.8★', label: 'User Rating' },
                { number: '24/7', label: 'AI Available' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <p className="text-5xl font-hand font-bold text-gray-900 mb-2">
                    {stat.number}
                  </p>
                  <p className="text-lg font-bold text-gray-700">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden bg-black">
      {/* Animated background elements */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-white/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-7xl font-hand font-bold text-white mb-6">
            Ready to Ace Your Interview?
          </h2>
          
          <p className="text-2xl font-comic text-white/90 mb-12 max-w-2xl mx-auto">
            Start practicing today with AI-powered feedback and join thousands of successful candidates
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/practice">
              <motion.button
                className="btn-sketch bg-white text-black text-xl px-12 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-6 h-6" />
                Start Free Practice
              </motion.button>
            </Link>
            
            <Link to="/interviews">
              <motion.button
                className="btn-sketch bg-transparent text-white border-white text-xl px-12 flex items-center gap-3"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                View Questions
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </div>

          <motion.div
            className="mt-12 flex items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {['No credit card required', 'Free forever', 'AI-powered'].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-white font-bold">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
