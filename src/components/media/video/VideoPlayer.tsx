
import React, { useRef } from "react";
import { trackInteraction } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Play, Pause, ArrowLeft, ArrowRight } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  mediaId: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onVideoEnd: () => void;
  onInteraction: () => void;
}

const VideoPlayer = ({
  url,
  mediaId,
  isPlaying,
  onPlay,
  onPause,
  onVideoEnd,
  onInteraction,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      onPlay();
      trackInteraction(mediaId);
      onInteraction();
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      onPause();
      trackInteraction(mediaId);
      onInteraction();
    }
  };

  const handleSkip = (direction: 'forward' | 'back') => {
    if (!videoRef.current) return;
    
    const skipAmount = 10;
    const newTime = direction === 'forward' 
      ? videoRef.current.currentTime + skipAmount 
      : videoRef.current.currentTime - skipAmount;
    
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    trackInteraction(mediaId);
    onInteraction();
  };

  return (
    <div className="relative aspect-video">
      <video 
        ref={videoRef}
        src={url} 
        className="w-full h-full object-contain bg-black"
        onEnded={onVideoEnd}
        controls={false}
        loop={true}
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => handleSkip('back')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isPlaying ? (
          <Button variant="secondary" size="sm" onClick={handlePause}>
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={handlePlay}>
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => handleSkip('forward')}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
