
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import MediaUploader from "@/components/media/MediaUploader";
import MediaList from "@/components/media/MediaList";
import MediaPlayer from "@/components/media/MediaPlayer";
import { onMediaListChange, onActiveMediaChange, getCurrentUser } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ControllerDashboard = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [filtering, setFiltering] = useState<boolean>(false);
  const { currentUser, userRole } = useAuth();

  // Redirect if not logged in or not a controller
  if (!currentUser || userRole !== "controller") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const unsubscribeMedia = onMediaListChange((mediaItems) => {
      if (filtering) {
        // Only show media uploaded by the current user
        const userId = getCurrentUser()?.uid || currentUser.id;
        const filteredMedia = mediaItems.filter((media) => media.userId === userId);
        setMediaList(filteredMedia);
      } else {
        setMediaList(mediaItems);
      }
    });

    const unsubscribeActive = onActiveMediaChange((media) => {
      setActiveMedia(media);
    });

    // Set initial filtering to true to show only user's media
    setFiltering(true);

    return () => {
      unsubscribeMedia();
      unsubscribeActive();
    };
  }, [filtering, currentUser]);

  const handleUploadComplete = (media: any) => {
    // Refresh media list (it will happen automatically via the listener)
  };

  const handleMediaChange = (mediaId: string | null) => {
    const selectedMedia = mediaId ? mediaList.find((m) => m.id === mediaId) : null;
    setActiveMedia(selectedMedia);
  };

  return (
    <Layout title="Controller Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPlayer media={activeMedia} isController={true} />
            </CardContent>
          </Card>

          <MediaUploader onUploadComplete={handleUploadComplete} />
        </div>

        <div className="space-y-6">
          <MediaList
            mediaList={mediaList}
            activeMediaId={activeMedia?.id || null}
            onMediaChange={handleMediaChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ControllerDashboard;
