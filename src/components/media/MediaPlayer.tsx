
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trackInteraction } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";

interface MediaPlayerProps {
  media: {
    id: string;
    url: string;
    type: string;
    name: string;
    interactions: number;
  } | null;
  isController?: boolean;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, isController = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsPlaying(false);
    setHasInteracted(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [media?.id]);

  const handlePlay = () => {
    if (!media) return;
    
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    
    if (!hasInteracted) {
      trackInteraction(media.id);
      setHasInteracted(true);
      toast({
        title: "Interaction recorded",
        description: "Your interaction with this media has been recorded.",
      });
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (!media) {
    return (
      <Card className="media-container flex items-center justify-center bg-muted">
        <p className="text-muted-foreground text-lg">No media currently active</p>
      </Card>
    );
  }

  if (media.type.startsWith("image")) {
    return (
      <div className="media-container">
        <img 
          src={media.url} 
          alt={media.name} 
          className="w-full h-full object-contain" 
          onClick={() => {
            if (!hasInteracted) {
              trackInteraction(media.id);
              setHasInteracted(true);
              toast({
                title: "Interaction recorded",
                description: "Your interaction with this image has been recorded.",
              });
            }
          }}
        />
        <div className="media-overlay">
          <div className="font-medium">{media.name}</div>
          <div className="text-sm text-muted-foreground">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        </div>
      </div>
    );
  }

  if (media.type.startsWith("video")) {
    return (
      <div className="media-container">
        <video 
          ref={videoRef}
          src={media.url} 
          className="w-full h-full object-contain" 
          controls={false}
        />
        <div className="media-overlay">
          <div className="font-medium">{media.name}</div>
          <div className="flex space-x-2">
            {isPlaying ? (
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handlePlay}>
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        </div>
      </div>
    );
  }

  if (media.type.startsWith("audio")) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{media.name}</h3>
          <div className="text-sm text-muted-foreground">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        </div>
        
        <audio 
          ref={videoRef} 
          src={media.url}
          className="w-full" 
          controls={false}
        />
        
        <div className="flex justify-center space-x-4">
          {isPlaying ? (
            <Button variant="outline" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePlay}>
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p>Unsupported media type</p>
    </Card>
  );
};

export default MediaPlayer;
