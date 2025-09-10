import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { generateEmojiFromImage, generateEmbedding } from '@/lib/embeddings'

// Validation schema for upload
const uploadSchema = z.object({
  file: z.string().min(1, 'File is required'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png)$/, 'Only JPEG and PNG images are allowed')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file, mimeType } = uploadSchema.parse(body)
    
    // Convert base64 to buffer (in-memory only)
    const imageBuffer = Buffer.from(file, 'base64')
    
    // Validate file size (5MB max)
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }
    
    // Generate emoji and description using Gemini
    const { emoji, description } = await generateEmojiFromImage(imageBuffer, mimeType)
    
    // Generate embedding for the description
    const embedding = await generateEmbedding(description)
    
    // Insert into database using service role
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('emoji')
      .insert({
        emoji,
        description,
        embedding
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save emoji' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      emoji: data
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
