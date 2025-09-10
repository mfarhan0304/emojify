'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import UploadCard from '@/components/UploadCard'
import SearchBar from '@/components/SearchBar'
import LiveFeed from '@/components/LiveFeed'
import { Emoji } from '@/lib/supabaseClient'

export default function Home() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<Emoji & { similarity?: number }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1] // Remove data:image/...;base64, prefix

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval)
                return prev
              }
              return Math.min(prev + Math.random() * 20, 90)
            })
          }, 200)

          const response = await fetch('/api/emoji', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64Data,
              mimeType: file.type
            })
          })

          clearInterval(progressInterval)
          setUploadProgress(100)

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          }

          // Reset after success
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
          }, 2000)

        } catch (error) {
          console.error('Upload error:', error)
          alert(error instanceof Error ? error.message : 'Upload failed')
          setIsUploading(false)
          setUploadProgress(0)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File processing error:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('')
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      setSearchQuery(query)

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Emojify
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload a photo and watch it transform into a cute emoji. 
              Join the real-time feed and discover emojis through semantic search!
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Upload Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Your Photo
            </h2>
            <UploadCard
              onUpload={handleUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </motion.section>

          {/* Search Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Search Emojis
            </h2>
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isSearching={isSearching}
            />
          </motion.section>

          {/* Feed Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LiveFeed
              searchQuery={searchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
            />
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              Made by Farhan • Powered by Gemini AI and Supabase
            </p>
            <p className="mt-2">
              Photos are processed in-memory only and never stored
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
