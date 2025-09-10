'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, Emoji } from '@/lib/supabaseClient'
import EmojiCard from './EmojiCard'

interface LiveFeedProps {
  searchQuery?: string
  searchResults?: Array<Emoji & { similarity?: number }>
  isSearching?: boolean
}

export default function LiveFeed({ searchQuery, searchResults, isSearching }: LiveFeedProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Connecting...')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Load initial emojis
  useEffect(() => {
    loadEmojis()
  }, [])


  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription...')
    
    const channel = supabase
      .channel('emoji-feed', {
        config: {
          broadcast: { self: false },
          presence: { key: 'emoji-feed' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emoji'
        },
        (payload) => {
          console.log('🎉 New emoji received via real-time:', payload.new)
          const newEmoji = payload.new as Emoji
          setLastUpdate(new Date())
          setEmojis(prev => {
            // Check if emoji already exists to avoid duplicates
            const exists = prev.some(e => e.id === newEmoji.id)
            if (exists) {
              console.log('Emoji already exists, skipping duplicate')
              return prev
            }
            return [newEmoji, ...prev]
          })
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
        setRealtimeStatus(status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to emoji feed')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to emoji feed')
        }
      })

    return () => {
      console.log('Cleaning up real-time subscription...')
      supabase.removeChannel(channel)
    }
  }, [])

  const loadEmojis = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('emoji')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setEmojis(data || [])
    } catch (err) {
      console.error('Error loading emojis:', err)
      setError('Failed to load emojis')
    } finally {
      setLoading(false)
    }
  }

  const displayEmojis = searchQuery && searchResults ? searchResults : emojis

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading emojis...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadEmojis}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {searchQuery ? `Search Results (${displayEmojis.length})` : 'Live Feed'}
        </h2>
        <div className="flex items-center space-x-4">
          {/* Real-time status indicator */}
          {!searchQuery && (
            <div className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 
                realtimeStatus === 'CHANNEL_ERROR' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></div>
              <span className="text-gray-500">
                {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 
                 realtimeStatus === 'CHANNEL_ERROR' ? 'Error' : 
                 'Connecting...'}
              </span>
              {lastUpdate && (
                <span className="text-gray-400">
                  • Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          {isSearching && (
            <div className="flex items-center space-x-2 text-blue-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}
        </div>
      </div>

      {/* Emojis Grid */}
      {displayEmojis.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">
            {searchQuery ? 'No emojis found for your search' : 'No emojis yet'}
          </p>
          <p className="text-sm">
            {searchQuery ? 'Try a different search term' : 'Upload a photo to get started!'}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1 justify-center">
          <AnimatePresence>
            {displayEmojis.map((emoji, index) => (
              <motion.div
                key={emoji.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.02 // Stagger animation
                }}
                layout
              >
                <EmojiCard 
                  emoji={emoji} 
                  similarity={'similarity' in emoji ? (emoji as any).similarity : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load more button for live feed */}
      {!searchQuery && emojis.length >= 50 && (
        <div className="text-center pt-4">
          <button
            onClick={loadEmojis}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
