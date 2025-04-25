
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer } from "lucide-react";
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

  const formatRemainingTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = async () => {
    if (audioRef.current) {
      audioRef.current.play();
      onPlay();
      await trackInteraction(mediaId);
      onInteraction();
    }
  };

  const handlePause = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      onPause();
      await trackInteraction(mediaId);
      onInteraction();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{name}</h3>
          
          {isController && remainingTime !== null && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-1" />
              <span>{formatRemainingTime(remainingTime)}</span>
            </div>
          )}
        </div>
        
        <audio 
          ref={audioRef} 
          src={url}
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
