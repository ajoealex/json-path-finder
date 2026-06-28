import { useRef, useEffect, useCallback, useState } from 'react'

// Icons
const SampleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const BeautifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
)

const MinifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
  </svg>
)

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

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

function JsonEditor({ value, onChange, onBeautify, onMinify, onSample, onClear, onCopy }) {
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (onCopy) {
      onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const getLineCount = (text) => {
    if (!text) return 1
    return text.split('\n').length
  }

  const updateLineNumbers = useCallback(() => {
    if (!lineNumbersRef.current) return
    const lines = getLineCount(value)
    // Limit line numbers to prevent DOM overflow on huge files
    const maxLines = Math.min(lines, 10000)
    const lineNumbers = Array.from({ length: maxLines }, (_, i) => i + 1).join('\n')
    lineNumbersRef.current.innerText = lines > maxLines ? lineNumbers + '\n...' : lineNumbers
  }, [value])

  useEffect(() => {
    updateLineNumbers()
  }, [updateLineNumbers])

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop
    }
  }

  // Sync textarea value when value prop changes (e.g., beautify/minify)
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value
    }
  }, [value])

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="flex justify-end gap-1.5 md:gap-2 p-2 md:p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 shrink-0">
        <button
          onClick={onSample}
          className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <SampleIcon />
          <span className="hidden sm:inline">Sample</span>
        </button>
        <button
          onClick={onBeautify}
          className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <BeautifyIcon />
          <span className="hidden sm:inline">Beautify</span>
        </button>
        <button
          onClick={onMinify}
          className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <MinifyIcon />
          <span className="hidden sm:inline">Minify</span>
        </button>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-slate-500 text-white rounded-md hover:bg-slate-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <ClearIcon />
          <span className="hidden sm:inline">Clear</span>
        </button>
        <button
          onClick={handleCopy}
          disabled={!value}
          className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-white rounded-md font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 ${
            copied
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-violet-500 hover:bg-violet-600 disabled:bg-slate-300 disabled:cursor-not-allowed'
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="bg-slate-100 text-slate-400 text-right px-2 md:px-3 py-2 md:py-3 font-mono text-xs md:text-sm select-none overflow-hidden leading-5 md:leading-6 border-r border-slate-200 shrink-0"
          style={{ minWidth: '40px' }}
        >
          1
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          defaultValue={value}
          onChange={handleChange}
          onScroll={handleScroll}
          className="flex-1 p-2 md:p-3 font-mono text-xs md:text-sm outline-none overflow-auto resize-none leading-5 md:leading-6 bg-white text-slate-700 focus:bg-slate-50 transition-colors"
          spellCheck={false}
          placeholder="Paste or type JSON here..."
        />
      </div>
    </div>
  )
}

export default JsonEditor
