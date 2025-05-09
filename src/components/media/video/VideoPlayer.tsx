
import React, { useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaDetails from "../MediaDetails";
import { trackInteraction } from "@/lib/firebase";
import { trackGeolocation } from "@/utils/geoTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Use a ref to store the onVideoEnd callback to avoid dependencies issues
  const onVideoEndRef = useRef(onVideoEnd);
  
  // Update the ref when the callback changes
  useEffect(() => {
    onVideoEndRef.current = onVideoEnd;
  }, [onVideoEnd]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleEnded = () => {
      // Call the callback through the ref to avoid dependency issues
      onVideoEndRef.current();
    };
    
    videoElement.addEventListener('ended', handleEnded);
    
    // Try to play the video when the component mounts or URL changes
    if (isPlaying) {
      videoElement.play().catch(error => {
        console.log("Autoplay failed:", error);
      });
    }
    
    return () => {
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [url, isPlaying]); // Remove onVideoEnd from dependencies

  useEffect(() => {
    // Track geolocation when the component mounts
    const trackInitialView = async () => {
      try {
        const geoData = await trackGeolocation(
          mediaId,
          currentUser?.id,
          'view'
        );
        
        if (geoData) {
          console.log('Video view tracked with geolocation');
        }
      } catch (error) {
        console.error('Failed to track geolocation for video view:', error);
      }
    };
    
    trackInitialView();
  }, [mediaId, currentUser?.id]);

  const handleInteraction = async () => {
    try {
      // Track interaction in Supabase
      await trackInteraction(mediaId);
      
      // Track geolocation for this click
      const geoData = await trackGeolocation(
        mediaId,
        currentUser?.id,
        'click'
      );
      
      if (geoData) {
        toast({
          title: "Interaction tracked",
          description: `Location recorded at ${geoData.latitude.toFixed(4)}, ${geoData.longitude.toFixed(4)}`,
        });
      }
      
      // Call the parent onInteraction callback
      onInteraction();
    } catch (error) {
      console.error('Interaction tracking error:', error);
    }
  };

  return (
    <div className="relative aspect-video group">
      <video 
        ref={videoRef}
        src={url} 
        className="w-full h-full object-contain bg-black rounded-lg"
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
