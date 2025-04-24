
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { syncMedia } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MediaItemProps {
  media: {
    id: string;
    url: string;
    type: string;
    name: string;
    interactions: number;
  };
  isActive: boolean;
  onActivate: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ media, isActive, onActivate }) => {
  return (
    <div 
      className={`p-3 border rounded-lg mb-2 flex justify-between items-center transition-colors ${
        isActive ? "bg-primary/20 border-primary" : "bg-card hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
          {media.type.startsWith("image") && "IMG"}
          {media.type.startsWith("video") && "VID"}
          {media.type.startsWith("audio") && "AUD"}
        </div>
        <div className="overflow-hidden">
          <div className="font-medium truncate">{media.name}</div>
          <div className="text-xs text-muted-foreground">
            {media.interactions} {media.interactions === 1 ? "interaction" : "interactions"}
          </div>
        </div>
      </div>
      <Button size="sm" variant={isActive ? "secondary" : "outline"} onClick={onActivate}>
        {isActive ? "Active" : "Activate"}
      </Button>
    </div>
  );
};

interface MediaListProps {
  mediaList: any[];
  activeMediaId: string | null;
  onMediaChange: (mediaId: string | null) => void;
}

const MediaList: React.FC<MediaListProps> = ({
  mediaList,
  activeMediaId,
  onMediaChange,
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleMediaActivate = async (mediaId: string) => {
    if (!currentUser) return;

    try {
      if (activeMediaId === mediaId) {
        // Deactivate if the same media is clicked
        await syncMedia(null, currentUser.uid);
        onMediaChange(null);
        toast({
          title: "Media deactivated",
          description: "The media has been deactivated.",
        });
      } else {
        // Activate new media
        await syncMedia(mediaId, currentUser.uid);
        onMediaChange(mediaId);
        toast({
          title: "Media activated",
          description: "The media has been activated and is now synced to clients.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Synchronization failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (mediaList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Media</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No media uploaded yet. Start by uploading some media files.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Media</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {mediaList.map((media) => (
          <MediaItem
            key={media.id}
            media={media}
            isActive={media.id === activeMediaId}
            onActivate={() => handleMediaActivate(media.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default MediaList;
