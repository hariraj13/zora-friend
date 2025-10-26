import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Emotion = 'happy' | 'calm' | 'excited' | 'thoughtful' | 'sad';

interface MusicData {
  title: string;
  artist: string;
  searchQuery: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion?: Emotion;
  music?: MusicData;
}

export const useZoraChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('calm');

  const sendMessage = async (userMessage: string, detectedEmotion: Emotion = 'calm', language: string = 'en-US') => {
    setIsLoading(true);
    
    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      emotion: detectedEmotion,
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentEmotion(detectedEmotion);

    try {
      const { data, error } = await supabase.functions.invoke('zora-chat', {
        body: {
          message: userMessage,
          emotion: detectedEmotion,
          language: language,
        },
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        emotion: data.emotion,
        music: data.music,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentEmotion(data.emotion);

      return { message: data.message, emotion: data.emotion };
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble hearing you right now. Can you try again?",
        emotion: 'calm',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    currentEmotion,
    sendMessage,
  };
};
