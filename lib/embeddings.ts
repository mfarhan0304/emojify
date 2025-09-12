import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

/**
 * Generate embedding for text using Gemini text-embedding-004
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await ai.models.embedContent({
      model: 'text-embedding-001',
      contents: text,
      config: {
        taskType: 'SEMANTIC_SIMILARITY'
      }
    })
    
    if (!result.embeddings || !Array.isArray(result.embeddings.values)) {
      throw new Error('Invalid embedding response from Gemini')
    }
    
    return result.embeddings[0].values || []
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate social media sticker concept and description from image using Gemini 2.0 Flash
 */
export async function generateEmojiFromImage(imageBuffer: Buffer, mimeType: string): Promise<{
  stickerBuffer: Buffer
  description: string
}> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    
    const prompt = `Analyze this image and create a social media emoji concept that best represents the main subject, activity, outfit, and emotion in the image.
Don't add anything that's not in the image.
IMPORTANT: Generate an actual image (not just a description) that represents the sticker concept. The image should be a PNG with transparent background, 100x100 pixels, in the style of Apple emojis.

Return your response in this exact JSON format:
{
  "sticker": "base64 image here",
  "description": "A description here that only contains text (50 characters or less)"
}`

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: prompt
        },
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]
    })

    console.log('Response:', result.text)
    
    // Parse JSON response
    const jsonMatch = result.text?.match(/\{[\s\S]*\}/)
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
