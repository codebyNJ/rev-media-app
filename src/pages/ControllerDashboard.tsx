
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import MediaUploader from "@/components/media/MediaUploader";
import MediaList from "@/components/media/MediaList";
import MediaPlayer from "@/components/media/MediaPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const ControllerDashboard = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [filtering, setFiltering] = useState<boolean>(false);
  const [activeVideoQueue, setActiveVideoQueue] = useState<string[]>([]);
  const { currentUser, userRole, loading } = useAuth();

  useEffect(() => {
    // Only fetch media if user is authenticated and a controller
    if (!currentUser || userRole !== "controller") {
      return;
    }

    // Initial fetch of media items
    const fetchMedia = async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        if (filtering) {
          const filteredData = data.filter(item => item.userid === currentUser.id);
          setMediaList(filteredData);
        } else {
          setMediaList(data);
        }
      }
    };

    fetchMedia();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('media-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media'
        },
        (payload) => {
          fetchMedia(); // Refetch all media when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filtering, currentUser, userRole]);

  const handleUploadComplete = (media: any) => {
    toast({
      title: "Upload complete",
      description: `"${media.name}" has been uploaded successfully.`,
    });
    // Real-time updates will handle this
  };

  const handleMediaChange = async (mediaId: string | null) => {
    if (!mediaId) {
      setActiveMedia(null);
      toast({
        title: "Media deactivated",
        description: "No media is currently active."
      });
      return;
    }

    const selectedMedia = mediaList.find(m => m.id === mediaId);
    
    if (selectedMedia?.type.startsWith("video")) {
      if (!activeVideoQueue.includes(mediaId)) {
        setActiveVideoQueue(prev => [...prev, mediaId]);
      }
      
      if (!activeMedia) {
        const { data } = await supabase
          .from('media')
          .select('*')
          .eq('id', mediaId)
          .single();

        setActiveMedia(data);
        toast({
          title: "Video activated",
          description: `Now playing: ${data?.name || "Unknown video"}`
        });
      }
    } else {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      setActiveMedia(data);
      toast({
        title: "Media activated",
        description: `Now viewing: ${data?.name || "Unknown media"}`
      });
    }
  };

  const handleVideoEnd = async () => {
    if (activeVideoQueue.length > 0) {
      const currentIndex = activeVideoQueue.findIndex(id => id === activeMedia?.id);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < activeVideoQueue.length) {
        const nextVideoId = activeVideoQueue[nextIndex];
        const { data } = await supabase
          .from('media')
          .select('*')
          .eq('id', nextVideoId)
          .single();
        
        setActiveMedia(data);
        toast({
          title: "Next video",
          description: `Now playing: ${data?.name || "Unknown video"}`
        });
      } else {
        setActiveMedia(null);
        setActiveVideoQueue([]);
        toast({
          title: "Playlist ended",
          description: "All videos in the queue have finished playing."
        });
      }
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect if not logged in or not a controller
  if (!currentUser || userRole !== "controller") {
    return <Navigate to="/" />;
  }

  return (
    <Layout title="Controller Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Controller</h1>
        <Link to="/dashboard">
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics Dashboard
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPlayer 
                media={activeMedia} 
                isController={true} 
                onVideoEnd={handleVideoEnd}
              />
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
