import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, emotion = 'calm', language = 'en-US' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Detect language name for the prompt
    const languageMap: { [key: string]: string } = {
      'en-US': 'English',
      'ta-IN': 'Tamil',
      'hi-IN': 'Hindi',
      'te-IN': 'Telugu',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'mr-IN': 'Marathi',
      'bn-IN': 'Bengali',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
    };
    
    const languageName = languageMap[language] || 'English';

    // Get current date and time information
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const currentYear = now.getFullYear();

    // System prompt that makes Zora a comprehensive AI assistant
    const systemPrompt = `You are Zora, an intelligent AI assistant like Siri, Alexa, and ChatGPT combined. You're warm, helpful, and knowledgeable about everything.

Current Information:
- Date: ${currentDate}
- Time: ${currentTime}
- Year: ${currentYear}
- Current emotion detected: ${emotion}
- Language: ${languageName}

Core Capabilities:
1. **Answer ALL questions** - science, math, history, geography, current events, homework help
2. **Tell creative stories** - When asked for stories (like "tell me a story about India"), create engaging, educational narratives based on your knowledge
3. **Real-time information** - Provide current date, time, day of week
4. **General knowledge** - Countries, capitals, leaders, facts (use your 2025 knowledge cutoff)
5. **Music playback** - Play songs from YouTube like Alexa

Response Guidelines:
- ALWAYS respond in ${languageName} language
- Keep answers clear and age-appropriate
- Match emotional tone: energetic when they're excited, comforting when sad
- For factual questions: provide accurate, simple explanations
- For homework: help them understand, don't just give answers
- For stories: create engaging 4-6 sentence narratives based on the topic
- For time/date: use the current information provided above
- For country leaders/facts: use your knowledge (current as of 2025)
- Show personality and warmth like a real assistant

Music Format:
- When asked to play music: "🎵 [Song Title] by [Artist]" + brief comment
- Example: "🎵 Twinkle Twinkle Little Star by Kids Songs - Let's sing along!"
- Always use popular, child-appropriate YouTube songs

Examples:
- "What time is it?" → "It's ${currentTime} right now!"
- "Tell me a story about India" → Create an engaging story about Indian culture, festivals, or history
- "Who is the president of USA?" → Provide current leader information (2025)
- "Help with my math homework" → Guide them through the problem
- "Play a song" → Suggest and play a fun children's song`;

    console.log('Calling Lovable AI with emotion:', emotion, 'language:', languageName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here with you!";
    
    // Detect emotion from response for next interaction
    const detectedEmotion = detectEmotionFromText(aiResponse);

    // Detect if response contains music suggestion
    const musicMatch = aiResponse.match(/🎵\s*(.+?)\s+by\s+(.+?)(?:\.|$)/i);
    let musicData = null;
    
    if (musicMatch) {
      const songTitle = musicMatch[1].trim();
      const artist = musicMatch[2].trim();
      // Create YouTube search query
      const searchQuery = encodeURIComponent(`${songTitle} ${artist}`);
      musicData = {
        title: songTitle,
        artist: artist,
        searchQuery: searchQuery
      };
    }

    console.log('AI response:', aiResponse, 'Detected emotion:', detectedEmotion, 'Music:', musicData);

    return new Response(
      JSON.stringify({ 
        message: aiResponse,
        emotion: detectedEmotion,
        music: musicData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in zora-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple emotion detection from text
function detectEmotionFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Excited/Happy indicators
  if (/(yay|wow|amazing|awesome|fantastic|great|excited|wonderful|love|happy)/i.test(lowerText)) {
    return 'excited';
  }
  
  // Sad/Concerned indicators
  if (/(sad|sorry|worried|concerned|unfortunately|difficult|hard|challenging)/i.test(lowerText)) {
    return 'sad';
  }
  
  // Thoughtful indicators
  if (/(think|consider|wonder|interesting|perhaps|maybe|question|curious)/i.test(lowerText)) {
    return 'thoughtful';
  }
  
  // Default to calm/happy
  return 'calm';
}
