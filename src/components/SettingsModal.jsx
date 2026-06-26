import { useState, useEffect, useRef } from 'react'

const defaultSettings = {
  defaultExpandDepth: 1, // Only expand root node by default
  largeThreshold: 1000,
}

function SettingsModal({ isOpen, onClose, settings, onSettingsChange }) {
  const [localSettings, setLocalSettings] = useState(settings)
  const modalRef = useRef(null)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleChange = (key, value) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalSettings(prev => ({ ...prev, [key]: numValue }))
    }
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  const handleReset = () => {
    setLocalSettings(defaultSettings)
    onSettingsChange(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Default Expansion Depth */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Expansion Depth
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={localSettings.defaultExpandDepth}
                onChange={(e) => handleChange('defaultExpandDepth', e.target.value)}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <input
                type="number"
                min="0"
                max="50"
                value={localSettings.defaultExpandDepth}
                onChange={(e) => handleChange('defaultExpandDepth', e.target.value)}
                className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-center"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              How many levels to expand by default (0 = collapsed, higher = more expanded)
            </p>
          </div>

          {/* Large JSON Warning Threshold */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Large JSON Warning Threshold
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={localSettings.largeThreshold}
                onChange={(e) => handleChange('largeThreshold', e.target.value)}
                className="w-24 px-2 py-1 border border-slate-300 rounded text-sm text-center"
              />
              <span className="text-sm text-slate-600">nodes</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Show a warning banner when JSON exceeds this node count
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { defaultSettings }
export default SettingsModal
