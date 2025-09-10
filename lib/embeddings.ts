import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Initialize the embedding model
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

/**
 * Generate embedding for text using Gemini text-embedding-004
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text)
    const embedding = result.embedding
    
    if (!embedding || !Array.isArray(embedding.values)) {
      throw new Error('Invalid embedding response from Gemini')
    }
    
    return embedding.values
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate emoji and description from image using Gemini 2.5 Flash
 */
export async function generateEmojiFromImage(imageBuffer: Buffer, mimeType: string): Promise<{
  emoji: string
  description: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    
    const prompt = `Analyze this image and generate:
1. A single Unicode emoji that best represents the main subject or emotion in the image
2. A playful, creative description (max 50 characters) that captures what's happening in the image

Return your response in this exact JSON format:
{
  "emoji": "🎯",
  "description": "A fun description here"
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    if (!parsed.emoji || !parsed.description) {
      throw new Error('Invalid response format from Gemini')
    }
    
    // Validate emoji is a single Unicode character
    if (parsed.emoji.length > 2) {
      throw new Error('Response must be a single emoji character')
    }
    
    // Validate description length
    if (parsed.description.length > 120) {
      parsed.description = parsed.description.substring(0, 117) + '...'
    }
    
    return {
      emoji: parsed.emoji,
      description: parsed.description
    }
  } catch (error) {
    console.error('Error generating emoji from image:', error)
    throw new Error('Failed to generate emoji from image')
  }
}
