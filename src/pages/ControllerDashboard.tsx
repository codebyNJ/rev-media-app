
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import MediaUploader from "@/components/media/MediaUploader";
import MediaList from "@/components/media/MediaList";
import MediaPlayer from "@/components/media/MediaPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";

const ControllerDashboard = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [filtering, setFiltering] = useState<boolean>(false);
  const [activeVideoQueue, setActiveVideoQueue] = useState<string[]>([]);
  const { currentUser, userRole } = useAuth();

  // Redirect if not logged in or not a controller
  if (!currentUser || userRole !== "controller") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
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
  }, [filtering, currentUser]);

  const handleUploadComplete = (media: any) => {
    // Real-time updates will handle this
  };

  const handleMediaChange = async (mediaId: string | null) => {
    if (!mediaId) {
      setActiveMedia(null);
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
      }
    } else {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      setActiveMedia(data);
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
      } else {
        setActiveMedia(null);
        setActiveVideoQueue([]);
      }
    }
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
