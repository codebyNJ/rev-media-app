
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Timer } from "lucide-react";

interface MediaDetailsProps {
  media: {
    name: string;
    type: string;
    interactions?: number;
    timeslotend?: string | number;
  };
  onKnowMoreClick?: () => void;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({ media, onKnowMoreClick }) => {
  // Format time slot expiration
  const getTimeSlotDisplay = () => {
    if (!media.timeslotend) return null;
    
    const date = new Date(media.timeslotend);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };
  
  const timeSlotDisplay = getTimeSlotDisplay();

  const handleClick = () => {
    if (onKnowMoreClick) {
      onKnowMoreClick();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4" onClick={handleClick}>
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
          
          {timeSlotDisplay && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-2" />
              <span>Time slot expires: {timeSlotDisplay}</span>
            </div>
          )}
          
          {media.interactions !== undefined && (
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
  );
};

export default MediaDetails;
