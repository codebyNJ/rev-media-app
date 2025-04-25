
import React from "react";
import { Card } from "@/components/ui/card";

interface AdvertisementProps {
  url: string;
  name: string;
}

const Advertisement = ({ url, name }: AdvertisementProps) => {
  return (
    <Card className="media-container">
      <video 
        src={url} 
        autoPlay 
        muted 
        className="w-full h-full object-contain"
      />
      <div className="absolute top-4 right-4 bg-black/75 text-white px-2 py-1 rounded text-sm">
        Ad
      </div>
    </Card>
  );
};

export default Advertisement;
