import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ZoraAvatar from '@/components/ZoraAvatar';
import MusicPlayer from '@/components/MusicPlayer';
import { useZoraChat } from '@/hooks/useZoraChat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'es-ES', name: 'Spanish (Español)' },
  { code: 'fr-FR', name: 'French (Français)' },
];

const Index = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState('en-US');
  const { messages, isLoading, currentEmotion, sendMessage } = useZoraChat();
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening } = useVoiceInput(language);
  const { speak, isSpeaking, isSupported: ttsSupported } = useTextToSpeech(language);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!voiceSupported) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input. You can still type messages!',
        variant: 'destructive',
      });
    }
  }, [voiceSupported, toast]);

  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const result = await sendMessage(message, currentEmotion, language);
    
    if (result && ttsSupported) {
      speak(result.message, result.emotion);
    }
    
    setInputText('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col items-center justify-between p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Zora
        </h1>
        <p className="text-muted-foreground text-lg">Your friendly AI companion</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center gap-8">
        {/* Avatar */}
        <div className="transform transition-all duration-500 hover:scale-105">
          <ZoraAvatar 
            emotion={currentEmotion}
            isSpeaking={isSpeaking || isLoading}
            isListening={isListening}
          />
        </div>

        {/* Current emotion and language selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: `hsl(var(--emotion-${currentEmotion}))`,
                boxShadow: `0 0 10px hsl(var(--emotion-${currentEmotion}) / 0.5)`,
              }}
            />
            <span className="text-sm font-medium capitalize">{currentEmotion}</span>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[160px] h-8 text-sm border-0 bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-sm">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
                {msg.music && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <MusicPlayer
                        title={msg.music.title}
                        artist={msg.music.artist}
                        searchQuery={msg.music.searchQuery}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="text-center animate-pulse">
            <p className="text-sm text-muted-foreground">Listening...</p>
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or speak your message..."
            className="text-lg"
            disabled={isLoading || isListening}
          />
          <Button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isLoading || isListening}
            size="lg"
            className="px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {voiceSupported && (
          <Button
            onClick={toggleListening}
            disabled={isLoading}
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
            className="w-full"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Chat
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
