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
 * Generate social media sticker concept and description from image using Gemini 1.5 Flash
 */
export async function generateEmojiFromImage(imageBuffer: Buffer, mimeType: string): Promise<{
  stickerBuffer: Buffer
  description: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    
    const prompt = `Analyze this image and create a social media animation sticker concept that best represents the main subject, activity, outfit, and emotion in the image.

Create a concept for an animated sticker/photo that would be perfect for sharing on social media platforms like Instagram, TikTok, or WhatsApp chat sections with transparent background. The sticker should mimic the style of the apple emoji. Don't add anything that's not in the image.

IMPORTANT: Generate an actual image (not just a description) that represents the sticker concept. The image should be a PNG with transparent background, 200x200 pixels, in the style of Apple emojis.

Return your response in this exact JSON format:
{
  "sticker": "base64 image here",
  "description": "A description here that only contains text (50 characters or less)"
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

    console.log('Response:', text)
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    if (!parsed.sticker || !parsed.description) {
      throw new Error('Invalid response format from Gemini')
    }
    
    // Validate sticker is base64 data
    if (!parsed.sticker.startsWith('data:image/png;base64,')) {
      throw new Error('Response must contain valid base64 PNG image data')
    }
    
    // Convert base64 to buffer
    const base64Data = parsed.sticker.split(',')[1] // Remove data:image/png;base64, prefix
    const stickerBuffer = Buffer.from(base64Data, 'base64')
    
    // Validate description length
    if (parsed.description.length > 120) {
      parsed.description = parsed.description.substring(0, 117) + '...'
    }
    
    return {
      stickerBuffer,
      description: parsed.description
    }
  } catch (error) {
    console.error('Error generating sticker concept from image:', error)
    throw new Error('Failed to generate sticker concept from image')
  }
}
