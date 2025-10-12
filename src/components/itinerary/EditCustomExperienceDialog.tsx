import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";

interface CustomExperience {
  id: string;
  title: string;
  message?: string;
  experience_date?: string;
  experience_time?: string;
  image_url?: string;
}

interface EditCustomExperienceDialogProps {
  experience: CustomExperience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditCustomExperienceDialog({
  experience,
  open,
  onOpenChange,
  onSaved,
}: EditCustomExperienceDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(experience?.title || "");
  const [message, setMessage] = useState(experience?.message || "");
  const [experienceDate, setExperienceDate] = useState(experience?.experience_date || "");
  const [experienceTime, setExperienceTime] = useState(experience?.experience_time || "");
  const [imageUrl, setImageUrl] = useState(experience?.image_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !experience) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${experience.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('memory-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Photo Uploaded",
        description: "Photo uploaded successfully.",
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

  const handleSave = async () => {
    if (!experience) return;

    if (!title.trim() || !message.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Update custom experience
      const { error: experienceError } = await supabase
        .from("custom_experiences")
        .update({
          title: title.trim(),
          message: message.trim(),
          image_url: imageUrl || null,
        })
        .eq("id", experience.id);

      if (experienceError) throw experienceError;

      // Update memory capsule entry
      const { error: memoryError } = await supabase
        .from("memory_capsule_entries")
        .update({
          experience_title: title.trim(),
          note: message.trim(),
          photos: imageUrl ? [imageUrl] : [],
        })
        .eq("experience_id", experience.id);

      if (memoryError) throw memoryError;

      toast({
        title: "Experience Updated! ✨",
        description: "Your custom experience has been updated.",
      });

      onOpenChange(false);
      onSaved();
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

  // Update local state when experience prop changes
  useEffect(() => {
    if (experience) {
      setTitle(experience.title);
      setMessage(experience.message || "");
      setExperienceDate(experience.experience_date || "");
      setExperienceTime(experience.experience_time || "");
      setImageUrl(experience.image_url || "");
    }
  }, [experience]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Custom Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Experience Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Sunset at the beach"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-message">Memorable Message *</Label>
            <Textarea
              id="edit-message"
              placeholder="Share your thoughts and memories about this experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={experienceDate}
                disabled
                className="[color-scheme:dark] opacity-60 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={experienceTime}
                disabled
                className="[color-scheme:dark] opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo</Label>
            {imageUrl && (
              <div className="relative mb-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setImageUrl("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload photo"}
              </span>
              <input
                type="file"
                accept="image/*"
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
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
