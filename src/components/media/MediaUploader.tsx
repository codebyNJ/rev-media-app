
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { MediaDetailsForm, MediaDetailsFormData } from "./MediaDetailsForm";

const MediaUploader: React.FC<{ onUploadComplete?: (media: any) => void }> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (formData: MediaDetailsFormData) => {
    if (!file || !currentUser) return;

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(`${currentUser.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`${currentUser.id}/${fileName}`);

      let type = "unknown";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      // Add media entry to the database
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          name: file.name,
          type: file.type,
          url: publicUrl,
          userid: currentUser.id,
          interactions: 0,
          timeslotend: new Date(Date.now() + formData.time_slot * 60 * 1000).toISOString()
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
            className="bg-muted/50"
          />
        </div>
        
        {file && (
          <>
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
            
            <MediaDetailsForm onSubmit={handleUpload} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
