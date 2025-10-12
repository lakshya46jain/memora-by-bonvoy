import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2, MapPin, Clock, Edit2, X, Camera, Facebook, Twitter, Instagram, Linkedin, Mail, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateTravelJournalPDF } from "@/utils/pdfGenerator";

interface MemoryEntry {
  id: string;
  experience_title: string;
  location: string | null;
  experience_timestamp: string | null;
  photos: string[] | null;
  note: string | null;
  created_at: string;
}

export default function MemoryCapsule() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from("memory_capsule_entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("experience_timestamp", { ascending: true });

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading memories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (memory: MemoryEntry) => {
    setEditingMemory(memory);
    setEditNote(memory.note || "");
    setEditPhotos(memory.photos || []);
  };

  const handleSaveEdit = async () => {
    if (!editingMemory) return;

    try {
      const { error } = await supabase
        .from("memory_capsule_entries")
        .update({
          note: editNote.trim() || null,
          photos: editPhotos.length > 0 ? editPhotos : null,
        })
        .eq("id", editingMemory.id);

      if (error) throw error;

      toast({
        title: "Memory Updated",
        description: "Your changes have been saved.",
      });
      
      setEditingMemory(null);
      fetchMemories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploadingPhoto(true);
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

      setEditPhotos([...editPhotos, ...uploadedUrls]);
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
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEditPhotos(editPhotos.filter((_, i) => i !== index));
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  const handleSharePlatform = (platform: string) => {
    toast({
      title: `Sharing to ${platform}`,
      description: "Your memory capsule is being shared...",
    });
    setShowShareSheet(false);
  };

  const handleExportPDF = async () => {
    if (!user) return;

    setIsGeneratingPDF(true);
    try {
      await generateTravelJournalPDF(
        memories,
        "Los Angeles",
        "JW Marriott Los Angeles",
        profile?.display_name || "Guest"
      );
      toast({
        title: "PDF Generated Successfully",
        description: "Your travel journal has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error Generating PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={profile?.display_name || "Guest"} points={0} showPoints={false} />
      
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/itinerary")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
            >
              <FileDown className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Memory Capsule</h1>
          <p className="text-sm text-muted-foreground">
            Your Los Angeles story • {formatDate(new Date().toISOString())}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No memories captured yet</p>
            <Button onClick={() => navigate("/itinerary")}>
              Go to Itinerary
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-8 bottom-8 w-[2px] bg-border" />
            
            <div className="space-y-6">
              {memories.map((memory, index) => (
                <div key={memory.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-primary border-4 border-background" />
                  
                  <Card className="bg-card border shadow-sm">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{memory.experience_title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {memory.experience_timestamp && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(memory.experience_timestamp)}</span>
                              </div>
                            )}
                            {memory.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{memory.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(memory)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {memory.photos && memory.photos.length > 0 && (
                        <div className={`mb-4 ${memory.photos.length === 1 ? '' : 'grid grid-cols-2 gap-3'}`}>
                          {memory.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative rounded-lg overflow-hidden aspect-video">
                              <img 
                                src={photo}
                                alt={`Memory ${photoIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {memory.note && (
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          "{memory.note}"
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMemory} onOpenChange={() => setEditingMemory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Photos</h4>
              {editPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {editPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
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
                  disabled={uploadingPhoto}
                  asChild
                >
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadingPhoto ? "Uploading..." : "Add Photo"}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddPhoto}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Note</h4>
              <Textarea
                placeholder="Share your thoughts..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="min-h-32"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingMemory(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Share Memory Capsule</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-5 gap-4 mt-6 mb-4">
            <button
              onClick={() => handleSharePlatform("Facebook")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xs">Facebook</span>
            </button>
            <button
              onClick={() => handleSharePlatform("Twitter")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <Twitter className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            <button
              onClick={() => handleSharePlatform("Instagram")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">Instagram</span>
            </button>
            <button
              onClick={() => handleSharePlatform("LinkedIn")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xs">LinkedIn</span>
            </button>
            <button
              onClick={() => handleSharePlatform("Email")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">Email</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
