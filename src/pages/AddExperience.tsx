import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AddExperience() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [experienceDate, setExperienceDate] = useState("");
  const [experienceTime, setExperienceTime] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('memory-photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('memory-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setImagePreviews([...imagePreviews, ...uploadedUrls]);
      toast({
        title: "Photos Uploaded",
        description: `${uploadedUrls.length} photo(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your experience.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message for your experience.",
        variant: "destructive",
      });
      return;
    }

    if (!experienceDate) {
      toast({
        title: "Date required",
        description: "Please select a date for your experience.",
        variant: "destructive",
      });
      return;
    }

    if (!experienceTime) {
      toast({
        title: "Time required",
        description: "Please select a time for your experience.",
        variant: "destructive",
      });
      return;
    }

    if (imagePreviews.length === 0) {
      toast({
        title: "Photo required",
        description: "Please upload at least one photo for your experience.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Combine date and time into a timestamp
      const experienceTimestamp = new Date(`${experienceDate}T${experienceTime}`).toISOString();

      const { error } = await supabase.from("custom_experiences").insert({
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        image_url: imagePreviews.length > 0 ? imagePreviews[0] : null,
        experience_date: experienceDate,
        experience_time: experienceTime,
      });

      if (error) throw error;

      // Also create a memory capsule entry
      const { error: memoryError } = await supabase.from("memory_capsule_entries").insert({
        user_id: user.id,
        experience_id: crypto.randomUUID(),
        experience_title: title.trim(),
        experience_timestamp: experienceTimestamp,
        location: null,
        note: message.trim(),
        photos: imagePreviews,
      });

      if (memoryError) throw memoryError;

      toast({
        title: "Experience Added! ✨",
        description: "Your custom experience has been added to your itinerary and memory capsule.",
      });
      
      navigate("/itinerary");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName="Guest" points={0} showPoints={false} />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/itinerary")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Custom Experience</h1>
            <p className="text-sm text-muted-foreground">
              Create a memorable moment
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Experience Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Sunset at the beach"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Memorable Message *</Label>
            <Textarea
              id="message"
              placeholder="Share your thoughts and memories about this experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">Date *</Label>
              <Input
                id="date"
                type="date"
                value={experienceDate}
                onChange={(e) => setExperienceDate(e.target.value)}
                className="[color-scheme:dark]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">Time *</Label>
              <Input
                id="time"
                type="time"
                value={experienceTime}
                onChange={(e) => setExperienceTime(e.target.value)}
                className="[color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos * {imagePreviews.length > 0 && `(${imagePreviews.length})`}</Label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/itinerary")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
