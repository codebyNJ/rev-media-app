import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trackInteraction, getRemainingTime } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Timer } from "lucide-react";
import MediaDetails from "./MediaDetails";

interface MediaPlayerProps {
  media: {
    id: string;
    url: string;
    type: string;
    name: string;
    interactions: number;
    remainingTimeMs?: number;
    timeslotend?: number | string;
  } | null;
  isController?: boolean;
  onVideoEnd?: () => void;
}

const dummyAds = [
  {
    id: "ad1",
    url: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4",
    name: "Chrome Ad",
    type: "video/mp4"
  },
  {
    id: "ad2",
    url: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.webm",
    name: "Product Ad",
    type: "video/webm"
  }
];

const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, isController = false, onVideoEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentAd, setCurrentAd] = useState<typeof dummyAds[0] | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsPlaying(false);
    setHasInteracted(false);
    setCurrentAd(null);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      
      if (media?.type.startsWith("video")) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => console.error("Autoplay failed:", error));
      }
    }

    if (media?.remainingTimeMs) {
      setRemainingTime(media.remainingTimeMs);
    } else if (media?.timeslotend) {
      const now = Date.now();
      setRemainingTime(Math.max(0, new Date(media.timeslotend).getTime() - now));
    } else {
      setRemainingTime(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [media?.id]);

  useEffect(() => {
    if (media && isController && remainingTime !== null) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime === null || prevTime <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [media, isController, remainingTime]);

  const formatRemainingTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const trackAndNotify = (mediaId: string) => {
    if (!hasInteracted) {
      trackInteraction(mediaId);
      setHasInteracted(true);
      if (isController) {
        toast({
          title: "Interaction recorded",
          description: "Your interaction with this media has been recorded.",
        });
      }
    }
  };

  const handlePlay = () => {
    if (!media) return;
    
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      trackAndNotify(media.id);
    }
  };

  const handlePause = () => {
    if (!media) return;
    
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      trackAndNotify(media.id);
    }
  };

  const handleSkip = (direction: 'forward' | 'back') => {
    if (!videoRef.current || !media) return;
    
    const skipAmount = 10;
    const newTime = direction === 'forward' 
      ? videoRef.current.currentTime + skipAmount 
      : videoRef.current.currentTime - skipAmount;
    
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    trackAndNotify(media.id);
    
    if (direction === 'forward' && Math.random() < 0.3) {
      showRandomAd();
    }
  };

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const showRandomAd = () => {
    const randomAd = dummyAds[Math.floor(Math.random() * dummyAds.length)];
    setCurrentAd(randomAd);
    setTimeout(() => {
      setCurrentAd(null);
    }, 5000);
  };

  if (currentAd) {
    return (
      <Card className="media-container">
        <video 
          src={currentAd.url} 
          autoPlay 
          muted 
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4 bg-black/75 text-white px-2 py-1 rounded text-sm">
          Ad
        </div>
      </Card>
    );
  }

  if (!media) {
    return (
      <Card className="media-container flex items-center justify-center bg-muted">
        <p className="text-muted-foreground text-lg">No media currently active</p>
      </Card>
    );
  }

  if (media.type.startsWith("image")) {
    return (
      <div className="space-y-4">
        <div className="media-container">
          <img 
            src={media.url} 
            alt={media.name} 
            className="w-full h-full object-contain" 
            onClick={() => trackAndNotify(media.id)}
          />
          
          {isController && remainingTime !== null && (
            <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-1" />
              <span>Time slot remaining: {formatRemainingTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <MediaDetails media={media} />
        {isController && (
          <div className="text-sm text-muted-foreground text-center">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        )}
      </div>
    );
  }

  if (media.type.startsWith("video")) {
    return (
      <div className="space-y-4">
        <div className="media-container">
          <video 
            ref={videoRef}
            src={media.url} 
            className="w-full h-full object-contain"
            onEnded={handleVideoEnd}
            controls={false}
          />
          <div className="flex justify-center space-x-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => handleSkip('back')}>
              <SkipBack className="h-4 w-4" />
            </Button>
            {isPlaying ? (
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handlePlay}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleSkip('forward')}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          {isController && remainingTime !== null && (
            <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-1" />
              <span>Time slot remaining: {formatRemainingTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <MediaDetails media={media} />
        {isController && (
          <div className="text-sm text-muted-foreground text-center">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        )}
      </div>
    );
  }

  if (media.type.startsWith("audio")) {
    return (
      <div className="space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{media.name}</h3>
            
            {isController && remainingTime !== null && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Timer className="h-4 w-4 mr-1" />
                <span>{formatRemainingTime(remainingTime)}</span>
              </div>
            )}
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
        <MediaDetails media={media} />
        {isController && (
          <div className="text-sm text-muted-foreground text-center">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <p>Unsupported media type</p>
    </Card>
  );
};

export default MediaPlayer;
