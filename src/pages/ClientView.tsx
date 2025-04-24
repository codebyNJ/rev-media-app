
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import MediaPlayer from "@/components/media/MediaPlayer";
import { onActiveMediaChange } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ClientView = () => {
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const { currentUser, userRole } = useAuth();

  // Redirect if not logged in or not a client
  if (!currentUser || userRole !== "client") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const unsubscribe = onActiveMediaChange((media) => {
      setActiveMedia(media);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Layout title="Client View">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Currently Streaming Media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaPlayer media={activeMedia} />
            
            {activeMedia ? (
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Streaming from controller. Media will automatically update when the controller changes it.
              </div>
            ) : (
              <div className="text-center mt-4 p-6">
                <p className="text-lg font-medium">Waiting for media...</p>
                <p className="text-sm text-muted-foreground mt-2">The controller hasn't activated any media yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientView;
