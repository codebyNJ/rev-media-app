
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trackInteraction, getRemainingTime } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Timer, Info } from "lucide-react";
import MediaDetails from "./MediaDetails";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

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
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
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

  if (media.type.startsWith("video")) {
    return (
      <div className="relative w-full md:w-full mx-auto">
        <div className="relative aspect-video">
          <video 
            ref={videoRef}
            src={media.url} 
            className="w-full h-full object-contain bg-black"
            onEnded={handleVideoEnd}
            controls={false}
            loop={true}
          />
          
          <div className="absolute bottom-4 right-4 z-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  onClick={() => {
                    if (media.id) {
                      trackInteraction(media.id);
                    }
                  }}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Know More
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{media.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Type: {media.type.split("/")[0]}
                  </p>
                  
                  {media.timeslotend && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Timer className="h-4 w-4 mr-2" />
                      <span>Time slot expires: {new Date(media.timeslotend).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {isController && (
                    <p className="text-sm text-muted-foreground">
                      Interactions: {media.interactions}
                    </p>
                  )}
                  
                  <p className="text-sm">
                    This media content is carefully curated to provide you with the best
                    viewing experience. Interact with the content to make the most of your
                    viewing session.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isController && (
            <div className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full text-sm text-white">
              {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
            </div>
          )}
        </div>
      </div>
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
