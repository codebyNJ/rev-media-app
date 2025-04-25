
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import MediaDetails from "../MediaDetails";
import { trackInteraction } from "@/lib/firebase";

interface AudioPlayerProps {
  url: string;
  name: string;
  mediaId: string;
  type: string;
  remainingTime: number | null;
  isController: boolean;
  isPlaying: boolean;
  interactions: number;
  timeslotend?: string | number;
  onPlay: () => void;
  onPause: () => void;
  onInteraction: () => void;
}

const AudioPlayer = ({
  url,
  name,
  mediaId,
  type,
  remainingTime,
  isController,
  isPlaying,
  interactions,
  timeslotend,
  onPlay,
  onPause,
  onInteraction,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        
        <audio 
          ref={audioRef} 
          src={url}
          className="w-full" 
          controls={true}
        />
      </Card>
      <MediaDetails media={{ name, type, interactions, timeslotend }} />
      {isController && (
        <div className="text-sm text-muted-foreground text-center">
          {interactions} {interactions === 1 ? "interaction" : "interactions"}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
