
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[conic-gradient(from_0deg_at_50%_50%,_#1E293B_0%,_#090F1A_50%,_#1E293B_100%)] p-4">
      <div className="max-w-4xl w-full text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary">
          Media Sync Stream
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Synchronize media across devices in real-time. Control from one device, view from another.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-slide-in">
        <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-brand-primary/20 hover:border-brand-primary/40 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Controller</CardTitle>
            <CardDescription>
              Upload and control media playback across connected devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Upload videos, images, and audio</li>
              <li>Control what clients see in real-time</li>
              <li>Track interactions with your content</li>
              <li>Manage your media library</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => navigate("/login/controller")} variant="default" className="w-full">
              Login as Controller
            </Button>
          </CardFooter>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-brand-secondary/20 hover:border-brand-secondary/40 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Client</CardTitle>
            <CardDescription>
              View synchronized media controlled by the presenter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>See content in real-time as it changes</li>
              <li>Interact with videos, images and audio</li>
              <li>Automatic synchronization with controller</li>
              <li>Works on any device with a browser</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => navigate("/login/client")} variant="secondary" className="w-full">
              Login as Client
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center text-muted-foreground">
        <p>© {new Date().getFullYear()} Media Sync Stream</p>
      </div>
    </div>
  );
};

export default Index;
