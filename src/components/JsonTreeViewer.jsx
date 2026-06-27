import { useState, memo, useMemo } from 'react'

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

const JsonNode = memo(function JsonNode({
  keyName,
  value,
  path,
  depth,
  onSelect,
  selectedPath,
  notation,
  parentIsArray,
  maxExpandDepth,
  maxArrayItems,
  maxObjectProperties
}) {
  // Expand if depth is within the allowed range
  const shouldExpandInitially = depth < maxExpandDepth
  const [isExpanded, setIsExpanded] = useState(shouldExpandInitially)
  const [hasRenderedChildren, setHasRenderedChildren] = useState(shouldExpandInitially)
  const [visibleCount, setVisibleCount] = useState(null) // null = use default limit

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
          {(() => {
            const limit = isArray ? maxArrayItems : maxObjectProperties
            const currentLimit = visibleCount !== null ? visibleCount : limit
            const totalCount = childEntries.length
            const visibleEntries = childEntries.slice(0, currentLimit)
            const hasMore = totalCount > currentLimit
            const remainingCount = totalCount - currentLimit

            return (
              <>
                {visibleEntries.map(([key, val]) => {
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
                      maxArrayItems={maxArrayItems}
                      maxObjectProperties={maxObjectProperties}
                    />
                  )
                })}
                {hasMore && (
                  <div
                    className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setVisibleCount(currentLimit + limit)
                    }}
                  >
                    <span className="text-sky-500 hover:text-sky-600 text-xs font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      Show more ({remainingCount} remaining)
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
})

// Default settings (used if no settings prop provided)
const defaultSettings = {
  defaultExpandDepth: 1,    // Only expand root node by default
  maxArrayItems: 50,        // Max array items before "Show more"
  maxObjectProperties: 1000, // Max object properties before "Show more"
}

function JsonTreeViewer({
  data,
  selectedPath,
  onSelect,
  notation = 'bracket',
  expandAll = null,
  settings = defaultSettings
}) {
  // Override depth based on expandAll prop
  const effectiveMaxDepth = useMemo(() => {
    if (expandAll === true) return 100 // Expand everything
    if (expandAll === false) return 0  // Collapse everything
    return settings.defaultExpandDepth
  }, [expandAll, settings.defaultExpandDepth])

  if (data === undefined || data === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 md:gap-3 p-4 md:p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-center text-sm md:text-base">
          Enter or paste valid JSON<br />
          <span className="text-xs md:text-sm text-slate-300">to view the tree structure</span>
        </p>
      </div>
    )
  }

  const isArray = Array.isArray(data)
  const entries = typeof data === 'object' ? Object.entries(data) : []

  return (
    <div className="h-full overflow-auto bg-white font-mono text-xs md:text-sm py-1 md:py-2">
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
              maxArrayItems={settings.maxArrayItems}
              maxObjectProperties={settings.maxObjectProperties}
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
            maxArrayItems={settings.maxArrayItems}
            maxObjectProperties={settings.maxObjectProperties}
          />
        </div>
      )}
    </div>
  )
}

export default JsonTreeViewer
