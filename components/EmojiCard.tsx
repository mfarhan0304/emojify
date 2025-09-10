'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Emoji } from '@/lib/supabaseClient'

interface EmojiCardProps {
  emoji: Emoji
  similarity?: number
}

export default function EmojiCard({ emoji, similarity }: EmojiCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emoji.emoji)
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
      {/* Emoji */}
      <div className="text-center flex flex-col items-center justify-center">
        <div className="text-4xl">{emoji.emoji}</div>
        
        {/* Similarity indicator for search results */}
        {similarity && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
            {Math.round(similarity * 100)}% match
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
