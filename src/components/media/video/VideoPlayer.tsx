
import React, { useRef } from "react";
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

  return (
    <div className="relative aspect-video">
      <video 
        ref={videoRef}
        src={url} 
        className="w-full h-full object-contain bg-black"
        onEnded={onVideoEnd}
        controls={true}
        loop={true}
      />
    </div>
  );
};

export default VideoPlayer;
