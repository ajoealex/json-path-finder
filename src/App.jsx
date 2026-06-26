import { useState, useCallback, useRef, useEffect } from 'react'
import JsonEditor from './components/JsonEditor'
import JsonTreeViewer from './components/JsonTreeViewer'
import SettingsModal, { defaultSettings } from './components/SettingsModal'
import { useDebounce } from './hooks/useDebounce'

// Settings icon
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Copy icon component
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const ExpandAllIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
)

const CollapseAllIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  </svg>
)

const sampleData = [
  {
    "id": "A1",
    "name": "Jim",
    "math": 60,
    "physics": 66,
    "chemistry": 61
  },
  {
    "id": "A2",
    "name": "Dwight",
    "math": 89,
    "physics": 76,
    "chemistry": 51
  },
  {
    "id": "A3",
    "name": "Kevin",
    "math": 79,
    "physics": 90,
    "chemistry": 78
  }
]

function App() {
  const [jsonText, setJsonText] = useState('')
  const [parsedJson, setParsedJson] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [selectedValue, setSelectedValue] = useState(null)
  const [notation, setNotation] = useState('bracket')
  const [copied, setCopied] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [expandCollapseKey, setExpandCollapseKey] = useState(0)
  const [expandAll, setExpandAll] = useState(null) // null = default, true = expand all, false = collapse all
  const [isLargeData, setIsLargeData] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('jsonPathFinderSettings')
    return saved ? JSON.parse(saved) : defaultSettings
  })
  const editorRef = useRef(null)

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('jsonPathFinderSettings', JSON.stringify(settings))
  }, [settings])

  // Debounce the JSON text for parsing (300ms delay)
  const debouncedJsonText = useDebounce(jsonText, 300)

  // Parse JSON when debounced text changes
  useEffect(() => {
    if (!debouncedJsonText.trim()) {
      setParsedJson(null)
      setParseError(null)
      setIsParsing(false)
      return
    }

    setIsParsing(true)

    // Use setTimeout to allow UI to update before potentially heavy parse
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(debouncedJsonText)
        setParsedJson(parsed)
        setParseError(null)
      } catch (e) {
        setParsedJson(null)
        setParseError(e.message)
      }
      setIsParsing(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [debouncedJsonText])

  const handleJsonChange = useCallback((text) => {
    setJsonText(text)
    if (text !== jsonText) {
      setIsParsing(true)
    }
  }, [jsonText])

  const handleBeautify = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      const beautified = JSON.stringify(parsed, null, 2)
      setJsonText(beautified)
      setParsedJson(parsed)
      setParseError(null)
    } catch (e) {
      setParseError(e.message)
    }
  }, [jsonText])

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      const minified = JSON.stringify(parsed)
      setJsonText(minified)
      setParsedJson(parsed)
      setParseError(null)
    } catch (e) {
      setParseError(e.message)
    }
  }, [jsonText])

  const handleSample = useCallback(() => {
    const sampleText = JSON.stringify(sampleData, null, 2)
    setJsonText(sampleText)
    setParsedJson(sampleData)
    setParseError(null)
  }, [])

  const handleSelect = useCallback((path, value) => {
    setSelectedPath(path)
    setSelectedValue(value)
  }, [])

  const handleNotationChange = useCallback((newNotation) => {
    setNotation(newNotation)
    setSelectedPath('')
  }, [])

  const handleCopyPath = useCallback(() => {
    if (selectedPath) {
      navigator.clipboard.writeText(selectedPath)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [selectedPath])

  const handleExpandAll = useCallback(() => {
    setExpandAll(true)
    setExpandCollapseKey(k => k + 1)
  }, [])

  const handleCollapseAll = useCallback(() => {
    setExpandAll(false)
    setExpandCollapseKey(k => k + 1)
  }, [])

  const handleLargeDataChange = useCallback((isLarge) => {
    setIsLargeData(isLarge)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm text-sky-400 py-4 px-6 font-bold text-xl border-b border-slate-700 shadow-lg flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="flex-1">JSON Path Finder</span>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-sky-400"
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Editor */}
        <div ref={editorRef} className="w-full md:w-1/2 flex flex-col min-h-[40vh] md:min-h-0">
          <JsonEditor
            value={jsonText}
            onChange={handleJsonChange}
            onBeautify={handleBeautify}
            onMinify={handleMinify}
            onSample={handleSample}
          />
          {parseError && (
            <div className="bg-red-50 text-red-600 px-4 py-2.5 text-sm border-t border-red-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">{parseError}</span>
            </div>
          )}
        </div>

        {/* Right panel - Tree viewer */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border-t md:border-t-0 md:border-l border-slate-300 shadow-inner">
          {/* Path display */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Path:</span>
            <input
              type="text"
              readOnly
              value={selectedPath}
              className="flex-1 min-w-[120px] px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Select a node..."
            />
            <select
              value={notation}
              onChange={(e) => handleNotationChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm cursor-pointer shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
            >
              <option value="bracket">['key']</option>
              <option value="dot">.key</option>
            </select>

            {/* Expand/Collapse buttons */}
            {parsedJson && !isLargeData && (
              <button
                onClick={handleExpandAll}
                className="p-1.5 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 text-slate-600 hover:text-sky-600 transition-colors"
                title="Expand All"
              >
                <ExpandAllIcon />
              </button>
            )}
            {parsedJson && (
              <button
                onClick={handleCollapseAll}
                className="p-1.5 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 text-slate-600 hover:text-sky-600 transition-colors"
                title="Collapse All"
              >
                <CollapseAllIcon />
              </button>
            )}

            <button
              onClick={handleCopyPath}
              disabled={!selectedPath}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm
                transition-all duration-200 ease-in-out
                ${copied
                  ? 'bg-green-500 text-white'
                  : 'bg-sky-500 hover:bg-sky-600 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed'
                }
              `}
            >
              {copied ? (
                <>
                  <CheckIcon />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Tree viewer */}
          <div className="flex-1 overflow-auto relative">
            {isParsing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-slate-500">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Parsing...</span>
                </div>
              </div>
            )}
            <JsonTreeViewer
              key={expandCollapseKey}
              data={parsedJson}
              selectedPath={selectedPath}
              onSelect={handleSelect}
              notation={notation}
              expandAll={expandAll}
              onLargeDataChange={handleLargeDataChange}
              settings={settings}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}

export default App
