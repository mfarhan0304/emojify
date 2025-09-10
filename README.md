# Emojify 🎯

Transform your photos into cute emojis with playful descriptions using AI! Upload a photo and watch it instantly become an emoji that joins a real-time global feed.

## Features

- 📸 **Photo Upload**: Drag & drop or click to upload photos (JPEG/PNG, max 5MB)
- 🤖 **AI Generation**: Powered by Gemini 2.5 Flash for emoji + description generation
- 🔍 **Semantic Search**: Find emojis using natural language with Gemini embeddings + pgvector
- ⚡ **Real-time Feed**: Live updates using Supabase Realtime
- 📱 **Responsive Design**: Mobile-first design with TailwindCSS + Framer Motion
- 🔒 **Privacy First**: Photos are processed in-memory only, never stored

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Next.js API routes + Supabase Postgres + pgvector
- **AI**: Gemini 2.5 Flash (vision) + Gemini text-embedding-004
- **Realtime**: Supabase Realtime subscriptions
- **Deployment**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Google AI Studio account (for Gemini API)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd emojify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

5. Set up Supabase database:
```sql
-- Create the emoji table
CREATE TABLE public.emoji (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the semantic search function
CREATE OR REPLACE FUNCTION emoji_semantic_search(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  emoji TEXT,
  description TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    emoji.id,
    emoji.emoji,
    emoji.description,
    emoji.embedding,
    emoji.created_at,
    1 - (emoji.embedding <=> query_embedding) AS similarity
  FROM emoji
  WHERE 1 - (emoji.embedding <=> query_embedding) > match_threshold
  ORDER BY emoji.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable RLS (Row Level Security)
ALTER TABLE public.emoji ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.emoji
  FOR SELECT USING (true);

-- Allow service role to insert (for API routes)
CREATE POLICY "Allow service role insert" ON public.emoji
  FOR INSERT WITH CHECK (true);
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
emojify/
├── app/
│   ├── api/
│   │   ├── emoji/route.ts      # Photo upload & emoji generation
│   │   └── search/route.ts     # Semantic search
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main page
├── components/
│   ├── EmojiCard.tsx           # Individual emoji display
│   ├── LiveFeed.tsx            # Real-time emoji feed
│   ├── SearchBar.tsx           # Search interface
│   └── UploadCard.tsx          # Photo upload interface
├── lib/
│   ├── embeddings.ts           # Gemini AI helpers
│   └── supabaseClient.ts       # Supabase configuration
└── ...
```

## API Endpoints

### POST /api/emoji
Upload a photo and generate an emoji.

**Request:**
```json
{
  "file": "base64_encoded_image",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "emoji": {
    "id": "uuid",
    "emoji": "🎯",
    "description": "A fun description",
    "embedding": [0.1, 0.2, ...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/search
Search emojis using semantic similarity.

**Query Parameters:**
- `q`: Search query
- `limit`: Number of results (default: 10)
- `threshold`: Similarity threshold (default: 0.7)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "emoji": "🎯",
      "description": "A fun description",
      "similarity": 0.95
    }
  ],
  "query": "search term",
  "count": 1
}
```

## License

MIT License - see LICENSE file for details.