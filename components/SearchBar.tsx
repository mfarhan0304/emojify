'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear: () => void
  isSearching: boolean
  placeholder?: string
}

export default function SearchBar({ 
  onSearch, 
  onClear, 
  isSearching, 
  placeholder = "Search emojis by description..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        onSearch(query.trim())
      }, 300)
    } else {
      onClear()
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, onSearch, onClear])

  const handleClear = () => {
    setQuery('')
    onClear()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className={`
          relative flex items-center bg-white border rounded-lg transition-all duration-200
          ${isFocused ? 'border-blue-400 shadow-lg' : 'border-gray-300 shadow-sm'}
          ${isSearching ? 'pointer-events-none opacity-75' : ''}
        `}
        whileFocus={{ scale: 1.02 }}
      >
        <div className="pl-3 pr-2">
          {isSearching ? (
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          ) : (
            <Search size={20} className="text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 py-3 px-2 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
          disabled={isSearching}
          aria-label="Search emojis"
        />

        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </motion.button>
        )}
      </motion.div>

      {/* Search suggestions */}
      {isFocused && !query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <div className="p-3 text-sm text-gray-500">
            <p className="font-medium mb-2">Try searching for:</p>
            <div className="space-y-1">
              <button
                onClick={() => setQuery('happy')}
                className="block w-full text-left hover:text-blue-500 transition-colors"
              >
                "happy" - Find joyful emojis
              </button>
              <button
                onClick={() => setQuery('food')}
                className="block w-full text-left hover:text-blue-500 transition-colors"
              >
                "food" - Find food-related emojis
              </button>
              <button
                onClick={() => setQuery('animals')}
                className="block w-full text-left hover:text-blue-500 transition-colors"
              >
                "animals" - Find animal emojis
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
