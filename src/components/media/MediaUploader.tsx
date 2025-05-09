
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader, Clock, ArrowUp } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { MediaDetailsForm, MediaDetailsFormData } from "./MediaDetailsForm";
import { Progress } from "@/components/ui/progress";

const MediaUploader: React.FC<{ onUploadComplete?: (media: any) => void }> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let speedInterval: NodeJS.Timeout | null = null;
    let lastBytes = 0;
    let lastTime = Date.now();

    if (isUploading) {
      speedInterval = setInterval(() => {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // Convert to seconds
        const bytesDiff = uploadedBytes - lastBytes;
        
        if (timeDiff > 0 && bytesDiff > 0) {
          // Calculate speed in KB/s
          const speedKBps = (bytesDiff / 1024) / timeDiff;
          setUploadSpeed(speedKBps);
          
          // Update last values
          lastBytes = uploadedBytes;
          lastTime = now;
        }
      }, 1000);
    }

    return () => {
      if (speedInterval) clearInterval(speedInterval);
    };
  }, [isUploading, uploadedBytes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Convert MB to bytes for comparison (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 25MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (formData: MediaDetailsFormData) => {
    if (!file || !currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStartTime(Date.now());
    setUploadedBytes(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Create upload options with onUploadProgress callback
      const options = {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress: number, { uploadedBytes }: { uploadedBytes: number }) => {
          setUploadProgress(progress * 100);
          setUploadedBytes(uploadedBytes);
        },
      };

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(`${currentUser.id}/${fileName}`, file, options);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`${currentUser.id}/${fileName}`);

      // Calculate time slot end
      const timeSlotMinutes = formData.time_slot;
      const timeSlotEnd = new Date(Date.now() + timeSlotMinutes * 60 * 1000);

      // Add media entry to the database
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          name: file.name,
          type: file.type,
          url: publicUrl,
          userid: currentUser.id,
          interactions: 0,
          timeslotend: timeSlotEnd.toISOString(),
        })
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Add media details
      const { error: detailsError } = await supabase
        .from('media_details')
        .insert({
          media_id: mediaData.id,
          company_name: formData.company_name,
          time_slot: formData.time_slot
        });

      if (detailsError) throw detailsError;

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });
      
      setFile(null);
      setUploadProgress(0);
      setUploadSpeed(null);
      if (onUploadComplete && mediaData) onUploadComplete(mediaData);
      
      // Reset the input
      const fileInput = document.getElementById('media-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Upload error details:", error);
    } finally {
      setIsUploading(false);
      setUploadStartTime(null);
    }
  };

  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = () => {
    if (!isUploading || uploadProgress <= 0 || !uploadStartTime) return null;
    
    const elapsedTime = (Date.now() - uploadStartTime) / 1000; // seconds
    const percentComplete = uploadProgress / 100;
    
    if (percentComplete === 0) return null;
    
    // Estimated total time based on current progress
    const estimatedTotalTime = elapsedTime / percentComplete;
    
    // Estimated remaining time
    return Math.round(estimatedTotalTime - elapsedTime);
  };

  const timeRemaining = getEstimatedTimeRemaining();
  
  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer 
            ${dragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('media-upload')?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-sm text-muted-foreground">
              Support for images, videos and audio files (max 25MB)
            </p>
            <Input
              id="media-upload"
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </div>
        
        {file && (
          <>
            <div className="text-sm bg-muted/50 p-3 rounded-md">
              <div className="font-medium">
                Selected File: {file.name}
              </div>
              <div className="text-muted-foreground mt-1">
                Type: {file.type || 'Unknown'} • Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                  <span className="font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>
                      {uploadSpeed ? `${uploadSpeed.toFixed(1)} KB/s` : 'Calculating...'}
                    </span>
                  </div>
                  
                  {timeRemaining && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeRemaining(timeRemaining)} remaining</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!isUploading && (
              <MediaDetailsForm onSubmit={handleUpload} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
