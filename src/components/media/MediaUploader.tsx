
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { MediaDetailsForm, MediaDetailsFormData } from "./MediaDetailsForm";
import { Progress } from "@/components/ui/progress";

const MediaUploader: React.FC<{ onUploadComplete?: (media: any) => void }> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
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
    }
  };

  const handleUpload = async (formData: MediaDetailsFormData) => {
    if (!file || !currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Create upload options with onUploadProgress callback
      const options = {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress: number) => {
          setUploadProgress(progress);
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="media-upload">Select Media</Label>
          <Input
            id="media-upload"
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="bg-muted/50"
          />
        </div>
        
        {file && (
          <>
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading... {Math.round(uploadProgress)}%
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <MediaDetailsForm onSubmit={handleUpload} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
