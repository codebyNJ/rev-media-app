
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import MediaPlayer from "@/components/media/MediaPlayer";
import { onActiveMediaChange } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ClientView = () => {
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const { currentUser, userRole } = useAuth();

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
      <div className="max-w-full mx-auto px-0">
        <MediaPlayer media={activeMedia} />
      </div>
    </Layout>
  );
};

export default ClientView;
