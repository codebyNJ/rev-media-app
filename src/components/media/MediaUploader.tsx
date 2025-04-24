
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const handleUpload = async () => {
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

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`${currentUser.id}/${fileName}`);

      let type = "unknown";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      // Calculate time slot end (5 minutes from now)
      const now = Date.now();
      const timeSlotEnd = now + (5 * 60 * 1000); // 5 minutes in milliseconds

      // Add media entry to the database
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          name: file.name,
          type: file.type,
          url: publicUrl,
          userId: currentUser.id,
          interactions: 0,
          timeSlotEnd: new Date(timeSlotEnd).toISOString()
        })
        .select()
        .single();

      if (mediaError) throw mediaError;
      
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
          <div className="text-sm text-muted-foreground">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
