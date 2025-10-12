import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Upload as UploadIcon, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Upload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const experience = location.state?.experience;
  const experienceTitle = experience?.title || "Experience";
  const experienceId = experience?.id;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('memory-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('memory-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setPhotos([...photos, ...uploadedUrls]);
      toast({
        title: "Photos Uploaded",
        description: `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully.`,
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

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !experienceId) return;

    // Validate that at least one field is filled
    if (photos.length === 0 && !note.trim()) {
      toast({
        title: "Required Field Missing",
        description: "Please add at least one photo or a note about your experience.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Save to memory capsule
      const { error } = await supabase.from("memory_capsule_entries").insert({
        user_id: user.id,
        experience_id: experienceId,
        experience_title: experienceTitle,
        location: experience?.location || null,
        experience_timestamp: new Date().toISOString(),
        photos: photos.length > 0 ? photos : null,
        note: note.trim() || null,
      });

      if (error) throw error;

      // Mark the experience as verified in liked_recommendations
      const { error: verifyError } = await supabase
        .from("liked_recommendations")
        .update({ verified: true })
        .eq("id", experienceId)
        .eq("user_id", user.id);

      if (verifyError) console.error("Error verifying experience:", verifyError);

      // Award Bonvoy points (50 points per completed experience)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("bonvoy_points")
        .eq("user_id", user.id)
        .single();

      const pointsToAdd = 50;
      const currentPoints = profileData?.bonvoy_points || 0;
      const newPoints = currentPoints + pointsToAdd;

      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ bonvoy_points: newPoints })
        .eq("user_id", user.id);

      if (pointsError) throw pointsError;

      toast({
        title: "Memory Saved! ✓",
        description: `${pointsToAdd} Bonvoy Points added to your account.`,
      });
      navigate("/memory-capsule");
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
      <Header userName={profile?.display_name || "Guest"} points={0} showPoints={false} />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/scan")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Photos & Memories</h1>
            <p className="text-sm text-muted-foreground">{experienceTitle}</p>
          </div>
        </div>

        <Card className="bg-card p-6 shadow-elevated mb-6">
          <h3 className="font-semibold mb-4">Upload Photos</h3>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <label className="w-full">
            <Button
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : photos.length === 0 ? "Add Photos" : "Add More Photos"}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </Card>

        <Card className="bg-card p-6 shadow-elevated mb-6">
          <h3 className="font-semibold mb-4">Add a Note</h3>
          <Textarea
            placeholder="Share your thoughts about this experience..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-32"
          />
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            onClick={handleSave}
            disabled={saving || (photos.length === 0 && !note.trim())}
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            {saving ? "Saving..." : "Save to Memory Capsule"}
          </Button>
          
          {(photos.length === 0 && !note.trim()) && (
            <p className="text-sm text-muted-foreground text-center">
              Add at least one photo or note to save your memory
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
