
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import VideoPlayer from "./video/VideoPlayer";
import ImageViewer from "./image/ImageViewer";
import AudioPlayer from "./audio/AudioPlayer";
import Advertisement from "./ads/Advertisement";

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
  const [currentAd, setCurrentAd] = useState<typeof dummyAds[0] | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [interactions, setInteractions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentAd(null);
    
    if (media) {
      setInteractions(media.interactions || 0);
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
      }
    };
  }, [media, isController, remainingTime]);

  const handleInteraction = () => {
    setInteractions(prev => prev + 1);
  };

  if (currentAd) {
    return <Advertisement url={currentAd.url} name={currentAd.name} />;
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
        <VideoPlayer
          url={media.url}
          mediaId={media.id}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVideoEnd={onVideoEnd}
          onInteraction={handleInteraction}
        />
      </div>
    );
  }

  if (media.type.startsWith("image")) {
    return (
      <ImageViewer
        url={media.url}
        name={media.name}
        mediaId={media.id}
        type={media.type}
        remainingTime={remainingTime}
        isController={isController}
        interactions={interactions}
        timeslotend={media.timeslotend}
        onInteraction={handleInteraction}
      />
    );
  }

  if (media.type.startsWith("audio")) {
    return (
      <AudioPlayer
        url={media.url}
        name={media.name}
        mediaId={media.id}
        type={media.type}
        remainingTime={remainingTime}
        isController={isController}
        isPlaying={isPlaying}
        interactions={interactions}
        timeslotend={media.timeslotend}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onInteraction={handleInteraction}
      />
    );
  }

  return (
    <Card className="p-6">
      <p>Unsupported media type</p>
    </Card>
  );
};

export default MediaPlayer;
