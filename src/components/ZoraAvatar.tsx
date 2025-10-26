import { useEffect, useState } from 'react';

interface ZoraAvatarProps {
  emotion: 'happy' | 'calm' | 'excited' | 'thoughtful' | 'sad';
  isSpeaking: boolean;
  isListening: boolean;
}

const ZoraAvatar = ({ emotion, isSpeaking, isListening }: ZoraAvatarProps) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getEmotionColors = () => {
    switch (emotion) {
      case 'happy':
        return { primary: 'hsl(var(--emotion-happy))', glow: 'hsl(45 100% 60% / 0.4)' };
      case 'excited':
        return { primary: 'hsl(var(--emotion-excited))', glow: 'hsl(15 100% 65% / 0.4)' };
      case 'sad':
        return { primary: 'hsl(var(--emotion-sad))', glow: 'hsl(220 70% 60% / 0.3)' };
      case 'thoughtful':
        return { primary: 'hsl(var(--emotion-thoughtful))', glow: 'hsl(260 100% 65% / 0.4)' };
      default:
        return { primary: 'hsl(var(--emotion-calm))', glow: 'hsl(175 70% 50% / 0.4)' };
    }
  };

  const colors = getEmotionColors();

  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          boxShadow: `0 0 ${isListening ? '100px' : '60px'} ${colors.glow}`,
          animation: isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Main face container */}
      <div 
        className="relative w-80 h-80 rounded-full transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`,
          transform: isSpeaking ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Wide Open Eyes */}
        <div className="absolute top-24 left-0 right-0 flex justify-center gap-16">
          {/* Left eye */}
          <div className="relative">
            <div 
              className="w-16 h-20 bg-white rounded-full transition-all duration-200"
              style={{
                transform: blink ? 'scaleY(0.1)' : 'scaleY(1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              {/* Pupil */}
              <div 
                className="absolute inset-x-0 top-2 mx-auto w-10 h-10 bg-foreground rounded-full"
                style={{
                  animation: emotion === 'excited' ? 'pupil-dance 0.5s ease-in-out infinite' : 'none',
                }}
              >
                {/* Shine effect */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-80" />
              </div>
            </div>
            {/* Eyelashes */}
            {!blink && (
              <div className="absolute -top-2 left-0 right-0 flex justify-around">
                <div className="w-1 h-3 bg-foreground rounded-full rotate-[-20deg]" />
                <div className="w-1 h-4 bg-foreground rounded-full" />
                <div className="w-1 h-3 bg-foreground rounded-full rotate-[20deg]" />
              </div>
            )}
          </div>
          
          {/* Right eye */}
          <div className="relative">
            <div 
              className="w-16 h-20 bg-white rounded-full transition-all duration-200"
              style={{
                transform: blink ? 'scaleY(0.1)' : 'scaleY(1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              {/* Pupil */}
              <div 
                className="absolute inset-x-0 top-2 mx-auto w-10 h-10 bg-foreground rounded-full"
                style={{
                  animation: emotion === 'excited' ? 'pupil-dance 0.5s ease-in-out infinite' : 'none',
                }}
              >
                {/* Shine effect */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-80" />
              </div>
            </div>
            {/* Eyelashes */}
            {!blink && (
              <div className="absolute -top-2 left-0 right-0 flex justify-around">
                <div className="w-1 h-3 bg-foreground rounded-full rotate-[-20deg]" />
                <div className="w-1 h-4 bg-foreground rounded-full" />
                <div className="w-1 h-3 bg-foreground rounded-full rotate-[20deg]" />
              </div>
            )}
          </div>
        </div>

        {/* Mouth */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          {emotion === 'happy' || emotion === 'excited' ? (
            <svg width="100" height="50" viewBox="0 0 100 50">
              <path
                d="M 15 15 Q 50 50 85 15"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : emotion === 'sad' ? (
            <svg width="100" height="50" viewBox="0 0 100 50">
              <path
                d="M 15 35 Q 50 15 85 35"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <div className="w-20 h-2 bg-white rounded-full" />
          )}
        </div>

        {/* Speaking animation waves */}
        {isSpeaking && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 bg-white rounded-full shadow-lg"
                style={{
                  height: '24px',
                  animation: `wave 0.6s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }

        @keyframes pupil-dance {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ZoraAvatar;
