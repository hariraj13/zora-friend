import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface MusicPlayerProps {
  title: string;
  artist: string;
  searchQuery: string;
}

const MusicPlayer = ({ title, artist, searchQuery }: MusicPlayerProps) => {
  // Create a more direct YouTube URL that auto-plays the first search result
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  
  // Use YouTube's search in iframe - this will show the first result video
  const youtubeEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${searchQuery}&autoplay=1`;
  
  return (
    <Card className="w-full p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <Music className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">Now Playing</h3>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{artist}</p>
        </div>
      </div>
      
      {/* Hidden iframe for audio playback - Alexa-style */}
      <div className="hidden">
        <iframe
          width="0"
          height="0"
          src={youtubeEmbedUrl}
          title={`${title} by ${artist}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      
      <a
        href={youtubeSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors"
      >
        <Music className="w-4 h-4" />
        Open in YouTube
      </a>
    </Card>
  );
};

export default MusicPlayer;
