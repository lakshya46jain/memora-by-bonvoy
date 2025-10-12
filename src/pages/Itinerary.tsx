import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, QrCode, Plus, Camera, CheckCircle, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EditCustomExperienceDialog } from "@/components/itinerary/EditCustomExperienceDialog";

interface ItineraryItem {
  id: string;
  title: string;
  category?: string;
  location?: string;
  image_url?: string;
  rating?: number;
  duration?: string;
  message?: string;
  experience_date?: string;
  experience_time?: string;
  verified?: boolean;
  type: 'recommendation' | 'custom';
}

export default function Itinerary() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomExperience, setEditingCustomExperience] = useState<ItineraryItem | null>(null);

  useEffect(() => {
    if (user) {
      fetchLikedRecommendations();
    }
  }, [user]);

  const fetchLikedRecommendations = async () => {
    try {
      // Fetch liked recommendations
      const { data: recommendations, error: recError } = await supabase
        .from("liked_recommendations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true });

      if (recError) throw recError;

      // Fetch custom experiences
      const { data: customExps, error: customError } = await supabase
        .from("custom_experiences")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true });

      if (customError) throw customError;

      // Combine both arrays with type indicators
      // verified status comes from the database field (set when memory is saved)
      const combinedItems: ItineraryItem[] = [
        ...(recommendations || []).map(item => ({ 
          ...item, 
          type: 'recommendation' as const
        })),
        ...(customExps || []).map(item => ({ ...item, type: 'custom' as const }))
      ];

      setItineraryItems(combinedItems);
    } catch (error: any) {
      toast({
        title: "Error loading itinerary",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Recommended Itinerary</h1>
            <p className="text-sm text-muted-foreground">December 21, 2025</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your itinerary...</p>
          </div>
        ) : itineraryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No experiences added yet</p>
            <Button onClick={() => navigate("/recommendations")}>
              Explore Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card border-0 shadow-card">
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.category && (
                      <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                    )}
                    {item.message && (
                      <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                    )}
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {item.experience_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(item.experience_date).toLocaleDateString()}</span>
                          {item.experience_time && <span>at {item.experience_time}</span>}
                        </div>
                      )}
                      {item.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex border-t border-bonvoy-border">
                  {item.type === 'recommendation' ? (
                    item.verified ? (
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none"
                        onClick={() => navigate("/scan", { state: { experience: item } })}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Scan QR
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none"
                      onClick={() => setEditingCustomExperience(item)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Experience
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3 mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/add-experience")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Experience
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/scan", { state: { fromItinerary: true } })}
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Marriott Partner QR Code
          </Button>
        </div>
      </div>

      <EditCustomExperienceDialog
        experience={editingCustomExperience}
        open={!!editingCustomExperience}
        onOpenChange={(open) => !open && setEditingCustomExperience(null)}
        onSaved={fetchLikedRecommendations}
      />

      <BottomNav />
    </div>
  );
}
