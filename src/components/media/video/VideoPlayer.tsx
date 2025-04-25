
import React, { useRef, useEffect } from "react";
import MediaDetails from "../MediaDetails";

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

  return (
    <div className="relative aspect-video">
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
    </div>
  );
};

export default VideoPlayer;
