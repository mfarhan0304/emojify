'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Sticker } from '@/lib/supabaseClient'

interface EmojiCardProps {
  emoji: Sticker
  similarity?: number
}

export default function EmojiCard({ emoji, similarity }: EmojiCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      // Copy the image URL to clipboard
      await navigator.clipboard.writeText(emoji.sticker_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <motion.div
      className="relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer aspect-square flex flex-col items-center justify-center"
      style={{ width: '75px', height: '75px' }}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={copyToClipboard}
    >
      {/* Sticker */}
      <div className="text-center flex flex-col items-center justify-center w-full h-full">
        <img 
          src={emoji.sticker_url} 
          alt={emoji.description}
          className="w-full h-full object-contain rounded-lg"
          loading="lazy"
        />
        
        {/* Similarity indicator for search results */}
        {similarity && (
          <div className="absolute top-1 right-1 text-xs text-gray-500 bg-white bg-opacity-90 px-1 py-0.5 rounded text-center">
            {Math.round(similarity * 100)}%
          </div>
        )}
      </div>

      {/* Copy Success Animation */}
      {copied && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 bg-green-100 bg-opacity-90 rounded-lg flex items-center justify-center"
        >
          <div className="text-green-600 font-medium text-sm flex items-center space-x-2">
            <span>Copied!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
