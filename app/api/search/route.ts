import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import { generateEmbedding } from '@/lib/embeddings'

// Validation schema for search
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500, 'Query too long'),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const threshold = parseFloat(searchParams.get('threshold') || '0.7')
    
    // Validate search parameters
    const { query: validatedQuery, limit: validatedLimit, threshold: validatedThreshold } = searchSchema.parse({
      query,
      limit,
      threshold
    })
    
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(validatedQuery)
    
    // Search using pgvector RPC function
    const { data, error } = await supabase.rpc('emoji_semantic_search', {
      query_embedding: queryEmbedding,
      match_threshold: validatedThreshold,
      match_count: validatedLimit
    })
    
    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      results: data || [],
      query: validatedQuery,
      count: data?.length || 0
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
