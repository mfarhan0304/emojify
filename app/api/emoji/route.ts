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
    
    // Generate sticker and description using Gemini
    const { stickerBuffer, description } = await generateEmojiFromImage(imageBuffer, mimeType)
    
    // Generate embedding for the description
    const embedding = await generateEmbedding(description)
    
    // Upload sticker to Supabase Storage
    const supabaseAdmin = getSupabaseAdmin()
    const stickerId = crypto.randomUUID()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('stickers')
      .upload(`${stickerId}.png`, stickerBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload sticker' },
        { status: 500 }
      )
    }
    
    // Get public URL for the uploaded sticker
    const { data: urlData } = supabaseAdmin.storage
      .from('stickers')
      .getPublicUrl(uploadData.path)
    
    // Insert into database using service role
    const { data, error } = await supabaseAdmin
      .from('emoji')
      .insert({
        sticker_url: urlData.publicUrl,
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
      sticker: data
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
