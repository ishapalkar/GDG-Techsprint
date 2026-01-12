import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import { Play, Loader, CheckCircle, XCircle, Copy, Download, Settings } from 'lucide-react'
import axios from 'axios'

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍', defaultCode: '# Write your Python code here\ndef solution():\n    print("Hello, World!")\n\nsolution()' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨', defaultCode: '// Write your JavaScript code here\nfunction solution() {\n    console.log("Hello, World!");\n}\n\nsolution();' },
  { value: 'java', label: 'Java', icon: '☕', defaultCode: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { value: 'cpp', label: 'C++', icon: '⚡', defaultCode: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { value: 'c', label: 'C', icon: '🔧', defaultCode: '// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷', defaultCode: '// Write your TypeScript code here\nfunction solution(): void {\n    console.log("Hello, World!");\n}\n\nsolution();' },
  { value: 'go', label: 'Go', icon: '🐹', defaultCode: '// Write your Go code here\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { value: 'rust', label: 'Rust', icon: '🦀', defaultCode: '// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}' },
]

const THEMES = ['vs-dark', 'vs-light', 'hc-black']

export default function CodeEditor({ initialCode = '', onCodeChange }) {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [theme, setTheme] = useState('vs-dark')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [executionStatus, setExecutionStatus] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const editorRef = useRef(null)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      wordWrap: 'on',
    })
  }

  const handleCodeChange = (value) => {
    setCode(value || '')
    if (onCodeChange) {
      onCodeChange(value || '')
    }
  }

  const handleLanguageChange = (newLanguage) => {
    const lang = LANGUAGES.find(l => l.value === newLanguage)
    setLanguage(lang)
    if (!code || code === language.defaultCode) {
      setCode(lang.defaultCode)
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setExecutionStatus(null)
    setOutput('Running...')

    try {
      // Using Piston API for code execution (free, supports 40+ languages)
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: language.value,
        version: '*',
        files: [{
          name: language.value === 'python' ? 'main.py' : 
                language.value === 'java' ? 'Main.java' :
                language.value === 'cpp' ? 'main.cpp' :
                language.value === 'c' ? 'main.c' :
                language.value === 'go' ? 'main.go' :
                language.value === 'rust' ? 'main.rs' : 'main.js',
          content: code
        }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      })

      const result = response.data
      
      if (result.run) {
        const output = result.run.output || result.run.stdout || ''
        const stderr = result.run.stderr || ''
        const fullOutput = output + (stderr ? '\n\nErrors:\n' + stderr : '')
        
        setOutput(fullOutput || 'Code executed successfully (no output)')
        setExecutionStatus(result.run.code === 0 ? 'success' : 'error')
      } else if (result.compile && result.compile.code !== 0) {
        setOutput('Compilation Error:\n' + (result.compile.output || result.compile.stderr || 'Unknown error'))
        setExecutionStatus('error')
      }
    } catch (error) {
      console.error('Execution error:', error)
      setOutput('Error: ' + (error.response?.data?.message || error.message || 'Failed to execute code'))
      setExecutionStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
  }

  const downloadCode = () => {
    const extension = 
      language.value === 'python' ? '.py' :
      language.value === 'javascript' ? '.js' :
      language.value === 'typescript' ? '.ts' :
      language.value === 'java' ? '.java' :
      language.value === 'cpp' ? '.cpp' :
      language.value === 'c' ? '.c' :
      language.value === 'go' ? '.go' :
      language.value === 'rust' ? '.rs' : '.txt'
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b-2 border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language.value}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border-2 border-gray-600 font-bold text-sm focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>

          {/* Theme Selector */}
          <div className="relative">
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700 rounded-lg border-2 border-gray-600 hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 text-white" />
            </motion.button>
            
            {showSettings && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 border-2 border-gray-600 rounded-lg p-2 z-10 min-w-[150px]">
                <p className="text-xs text-gray-400 mb-2 font-bold">Theme</p>
                {THEMES.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t)
                      setShowSettings(false)
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                      theme === t ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={copyCode}
            className="p-2 bg-gray-700 rounded-lg border-2 border-gray-600 hover:bg-gray-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Copy code"
          >
            <Copy className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            onClick={downloadCode}
            className="p-2 bg-gray-700 rounded-lg border-2 border-gray-600 hover:bg-gray-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Download code"
          >
            <Download className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm ${
              isRunning
                ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 border-green-700 text-white hover:bg-green-700'
            }`}
            whileHover={!isRunning ? { scale: 1.05 } : {}}
            whileTap={!isRunning ? { scale: 0.95 } : {}}
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language.value}
          value={code}
          theme={theme}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output Panel */}
      {output && (
        <div className="bg-gray-800 border-t-2 border-gray-700 p-4 max-h-48 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            {executionStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {executionStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
            {isRunning && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
            <span className="font-bold text-white text-sm">Output:</span>
          </div>
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  )
}
