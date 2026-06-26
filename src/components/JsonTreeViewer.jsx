import { useState, memo, useMemo, useEffect } from 'react'

// Path building utilities
const buildPath = (parentPath, key, isArrayIndex, notation) => {
  if (notation === 'dot') {
    if (isArrayIndex) {
      return `${parentPath}[${key}]`
    }
    const needsBracket = /[^a-zA-Z0-9_$]/.test(key) || /^\d/.test(key)
    if (needsBracket) {
      return `${parentPath}['${key}']`
    }
    return parentPath ? `${parentPath}.${key}` : `$.${key}`
  } else {
    if (isArrayIndex) {
      return `${parentPath}[${key}]`
    }
    return `${parentPath}['${key}']`
  }
}

// Count total nodes in a JSON structure
const countNodes = (value, maxCount = 5000) => {
  if (value === null || typeof value !== 'object') return 1
  let count = 1
  for (const key in value) {
    if (count > maxCount) return count
    count += countNodes(value[key], maxCount - count)
  }
  return count
}

const JsonNode = memo(function JsonNode({
  keyName,
  value,
  path,
  depth,
  onSelect,
  selectedPath,
  notation,
  parentIsArray,
  maxExpandDepth
}) {
  // Expand if depth is within the allowed range
  const shouldExpandInitially = depth < maxExpandDepth
  const [isExpanded, setIsExpanded] = useState(shouldExpandInitially)
  const [hasRenderedChildren, setHasRenderedChildren] = useState(shouldExpandInitially)

  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const hasChildren = isObject && Object.keys(value).length > 0

  const currentPath = path

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(currentPath, value)
  }

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isExpanded) {
      setHasRenderedChildren(true)
    }
    setIsExpanded(!isExpanded)
  }

  const isSelected = selectedPath === currentPath

  const renderValue = () => {
    if (value === null) return <span className="text-slate-400 italic">null</span>
    if (typeof value === 'boolean') return <span className="text-purple-600 font-medium">{value.toString()}</span>
    if (typeof value === 'number') return <span className="text-blue-600 font-medium">{value}</span>
    if (typeof value === 'string') {
      const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value
      return <span className="text-emerald-600">"{displayValue}"</span>
    }
    return null
  }

  const renderLabel = () => {
    if (keyName === null || keyName === undefined) return null
    const isArrayIndex = typeof keyName === 'number' || /^\d+$/.test(keyName)
    return (
      <span className={`font-medium ${isArrayIndex ? 'text-amber-600' : 'text-sky-600'}`}>
        {keyName}:
      </span>
    )
  }

  if (!isObject) {
    return (
      <div
        className={`
          flex items-center gap-2 py-1 px-2 cursor-pointer
          transition-colors duration-150
          ${isSelected
            ? 'bg-sky-100 border-l-2 border-sky-500'
            : 'hover:bg-slate-50 border-l-2 border-transparent'
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 24}px` }}
        onClick={handleClick}
      >
        {renderLabel()}
        {renderValue()}
      </div>
    )
  }

  const childEntries = Object.entries(value)
  const previewText = isArray
    ? `Array(${childEntries.length})`
    : `Object {${childEntries.length}}`

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 py-1 px-2 cursor-pointer
          transition-colors duration-150
          ${isSelected
            ? 'bg-sky-100 border-l-2 border-sky-500'
            : 'hover:bg-slate-50 border-l-2 border-transparent'
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span
            onClick={handleToggle}
            className="text-slate-400 hover:text-sky-600 select-none w-4 text-center transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            ▼
          </span>
        )}
        {!hasChildren && <span className="w-4" />}

        {renderLabel()}

        {!isExpanded && (
          <span className="text-slate-400 text-xs ml-1 bg-slate-100 px-1.5 py-0.5 rounded">
            {previewText}
          </span>
        )}
      </div>

      {hasRenderedChildren && hasChildren && (
        <div
          className="border-l border-slate-200"
          style={{
            marginLeft: `${depth * 16 + 16}px`,
            display: isExpanded ? 'block' : 'none'
          }}
        >
          {childEntries.map(([key, val]) => {
            const isArrayIndex = isArray
            const childPath = buildPath(path, key, isArrayIndex, notation)

            return (
              <JsonNode
                key={key}
                keyName={key}
                value={val}
                path={childPath}
                depth={depth + 1}
                onSelect={onSelect}
                selectedPath={selectedPath}
                notation={notation}
                parentIsArray={isArray}
                maxExpandDepth={maxExpandDepth}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})

// Default settings (used if no settings prop provided)
const defaultSettings = {
  defaultExpandDepth: 1, // Only expand root node by default
  largeThreshold: 1000, // Show warning above this node count
}

function JsonTreeViewer({
  data,
  selectedPath,
  onSelect,
  notation = 'bracket',
  expandAll = null,
  onLargeDataChange,
  settings = defaultSettings
}) {
  // Determine data size and appropriate expansion depth based on settings
  const { isLargeData, maxExpandDepth } = useMemo(() => {
    if (data === null || data === undefined) {
      return { isLargeData: false, maxExpandDepth: settings.defaultExpandDepth }
    }

    const nodeCount = countNodes(data, 10000)

    // Use the configured default expansion depth
    // Show warning for large JSON but still respect user's depth setting
    const isLarge = nodeCount > settings.largeThreshold
    return {
      isLargeData: isLarge,
      maxExpandDepth: settings.defaultExpandDepth
    }
  }, [data, settings])

  // Notify parent about large data status
  useEffect(() => {
    if (onLargeDataChange) {
      onLargeDataChange(isLargeData)
    }
  }, [isLargeData, onLargeDataChange])

  // Override depth based on expandAll prop
  const effectiveMaxDepth = useMemo(() => {
    if (expandAll === true) return 100 // Expand everything
    if (expandAll === false) return 0  // Collapse everything
    return maxExpandDepth
  }, [expandAll, maxExpandDepth])

  if (data === undefined || data === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-center">
          Enter or paste valid JSON<br />
          <span className="text-sm text-slate-300">to view the tree structure</span>
        </p>
      </div>
    )
  }

  const isArray = Array.isArray(data)
  const entries = typeof data === 'object' ? Object.entries(data) : []

  return (
    <div className="h-full overflow-auto bg-white font-mono text-sm py-2">
      {isLargeData && (
        <div className="mx-2 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Large JSON detected. Nodes collapsed by default for performance.
        </div>
      )}
      {typeof data === 'object' ? (
        entries.map(([key, val]) => {
          const isArrayIndex = isArray
          const path = buildPath('$', key, isArrayIndex, notation)

          return (
            <JsonNode
              key={key}
              keyName={key}
              value={val}
              path={path}
              depth={0}
              onSelect={onSelect}
              selectedPath={selectedPath}
              notation={notation}
              parentIsArray={isArray}
              maxExpandDepth={effectiveMaxDepth}
            />
          )
        })
      ) : (
        <div className="p-2">
          <JsonNode
            keyName={null}
            value={data}
            path="$"
            depth={0}
            onSelect={onSelect}
            selectedPath={selectedPath}
            notation={notation}
            parentIsArray={false}
            maxExpandDepth={effectiveMaxDepth}
          />
        </div>
      )}
    </div>
  )
}

export default JsonTreeViewer
