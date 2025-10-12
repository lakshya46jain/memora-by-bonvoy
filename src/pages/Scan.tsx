import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, QrCode, CheckCircle, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Scan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const experience = location.state?.experience;
  const fromItinerary = location.state?.fromItinerary;
  const experienceTitle = experience?.title || "Experience";
  const experienceId = experience?.id;

  const handleScan = async () => {
    // If coming from itinerary without specific experience, add a partner experience
    if (fromItinerary && !experienceId) {
      setScanning(true);
      try {
        // Add a sample partner experience to the itinerary (not verified yet)
        const partnerExperienceData = {
          recommendation_id: `partner_${Date.now()}`,
          title: "Marriott Partner Experience",
          category: "Partner Offer",
          description: "Exclusive partner experience verified via QR code",
          location: "Los Angeles",
          image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070",
          rating: 4.8,
          duration: "1-2 hours"
        };

        const { data, error } = await supabase.from("liked_recommendations").insert({
          user_id: user?.id,
          recommendation_id: partnerExperienceData.recommendation_id,
          title: partnerExperienceData.title,
          category: partnerExperienceData.category,
          description: partnerExperienceData.description,
          location: partnerExperienceData.location,
          image_url: partnerExperienceData.image_url,
          rating: partnerExperienceData.rating,
          duration: partnerExperienceData.duration,
          verified: false,
        }).select().single();

        if (error) throw error;

        toast({
          title: "QR Code Scanned!",
          description: "Add photos and memories to complete verification.",
        });
        
        // Navigate to upload page with the actual database record (includes the UUID id)
        navigate("/upload", { state: { experience: data } });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setScanning(false);
      }
      return;
    }

    if (!user || !experienceId) return;
    
    setScanning(true);
    try {
      // Mark experience as verified
      const { error: updateError } = await supabase
        .from("liked_recommendations")
        .update({ verified: true })
        .eq("id", experienceId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Navigate directly to upload page (points awarded after photos/memories added)
      navigate("/upload", { state: { experience } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setScanning(false);
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
            onClick={() => navigate("/itinerary")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scan Experience</h1>
            <p className="text-sm text-muted-foreground">Capture your moment</p>
          </div>
        </div>

        <Card className="bg-card p-6 shadow-elevated mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-64 h-64 bg-bonvoy-card rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-primary/50">
              <QrCode className="w-32 h-32 text-muted-foreground" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">Ready to Scan</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Point your camera at the QR code displayed at the experience location
            </p>
            
            <Button
              onClick={handleScan}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              disabled={scanning}
            >
              <Camera className="w-5 h-5 mr-2" />
              {scanning ? "Verifying..." : "Scan QR Code"}
            </Button>
          </div>
        </Card>

        <Card className="bg-bonvoy-card p-4 border-0">
          <h4 className="font-semibold mb-3 text-sm">How it works</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-primary">1.</span>
              Find the QR code at your experience location
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">2.</span>
              Scan the code to verify your visit
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">3.</span>
              Add photos and notes to create lasting memories
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">4.</span>
              Earn Bonvoy points for each experience
            </li>
          </ol>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
