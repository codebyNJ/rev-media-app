
import React from "react";
import { Timer } from "lucide-react";
import MediaDetails from "../MediaDetails";
import { trackInteraction } from "@/lib/firebase";

interface ImageViewerProps {
  url: string;
  name: string;
  mediaId: string;
  type: string;
  remainingTime: number | null;
  isController: boolean;
  interactions: number;
  timeslotend?: string | number;
  onInteraction: () => void;
}

const ImageViewer = ({
  url,
  name,
  mediaId,
  type,
  remainingTime,
  isController,
  interactions,
  timeslotend,
  onInteraction,
}: ImageViewerProps) => {
  const formatRemainingTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleImageClick = async () => {
    await trackInteraction(mediaId);
    onInteraction();
  };

  const handleKnowMoreClick = async () => {
    await trackInteraction(mediaId);
    onInteraction();
  };

  return (
    <div className="space-y-4">
      <div className="media-container">
        <img 
          src={url} 
          alt={name} 
          className="w-full h-full object-contain" 
          onClick={handleImageClick}
        />
        
        {isController && remainingTime !== null && (
          <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4 mr-1" />
            <span>Time slot remaining: {formatRemainingTime(remainingTime)}</span>
          </div>
        )}
      </div>
      <MediaDetails 
        media={{ name, type, interactions, timeslotend }} 
        onKnowMoreClick={handleKnowMoreClick}
      />
      {isController && (
        <div className="text-sm text-muted-foreground text-center">
          {interactions} {interactions === 1 ? "interaction" : "interactions"}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
