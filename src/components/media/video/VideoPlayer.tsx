
import React, { useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaDetails from "../MediaDetails";
import { trackInteraction } from "@/lib/firebase";

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay failed:", error);
      });
    }
  }, [url]);

  const handleInteraction = async () => {
    // Track interaction in Supabase
    await trackInteraction(mediaId);
    // Call the parent onInteraction callback
    onInteraction();
  };

  return (
    <div className="relative aspect-video group">
      <video 
        ref={videoRef}
        src={url} 
        className="w-full h-full object-contain bg-black rounded-lg"
        onEnded={onVideoEnd}
        controls={false}
        loop={true}
        autoPlay={true}
        playsInline={true}
        muted={true}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <MediaDetails 
            media={{ 
              name: "Video Content",
              type: "video",
              interactions: 0
            }} 
            onKnowMoreClick={handleInteraction}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
