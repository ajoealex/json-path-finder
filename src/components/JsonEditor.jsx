import { useRef, useEffect, useCallback } from 'react'

function JsonEditor({ value, onChange, onBeautify, onMinify, onSample }) {
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)

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
          className="px-2 md:px-4 py-1 md:py-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Sample
        </button>
        <button
          onClick={onBeautify}
          className="px-2 md:px-4 py-1 md:py-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Beautify
        </button>
        <button
          onClick={onMinify}
          className="px-2 md:px-4 py-1 md:py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-xs md:text-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Minify
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
