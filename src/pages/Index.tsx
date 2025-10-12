import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MemoraOptIn } from "@/components/memora/MemoraOptIn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [memoraEnabled, setMemoraEnabled] = useState(false);
  const [hasConsentRecord, setHasConsentRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stayCompleted, setStayCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { profile, user } = useAuth();

  useEffect(() => {
    if (location.state?.checkedOut) {
      setStayCompleted(true);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      checkMemoraStatus();
    }
  }, [user]);

  const checkMemoraStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("consent_records")
        .select("memora_enabled")
        .eq("user_id", user?.id)
        .order("consent_timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If data exists, user has made a choice (either enabled or skipped)
      if (data) {
        setMemoraEnabled(data.memora_enabled);
        setHasConsentRecord(true);
      } else {
        // No consent record yet - user needs to be prompted
        setHasConsentRecord(false);
      }
    } catch (error) {
      console.error("Error checking Memora status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMemora = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.from("consent_records").insert({
        user_id: user.id,
        memora_enabled: true,
        two_factor_verified: true,
        stay_id: "current_stay_griffith",
      });

      if (error) throw error;

      setMemoraEnabled(true);
      toast({
        title: "Memora Enabled! ✨",
        description: "Your personalized experience awaits.",
      });
      navigate("/recommendations");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipMemora = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Record that user has been asked and chose to skip
      const { error } = await supabase.from("consent_records").insert({
        user_id: user.id,
        memora_enabled: false,
        two_factor_verified: true,
      });

      if (error) throw error;

      // Mark that user has a consent record now
      setHasConsentRecord(true);
      
      toast({
        title: "No problem!",
        description: "You can enable Memora anytime from your Account settings.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        userName={profile?.display_name || "Guest"} 
        points={profile?.bonvoy_points || 0} 
      />
      
      <main className="relative">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
            alt="Luxury hotel at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-background" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                  MARRIOTT
                </h1>
                <div className="text-3xl font-light text-white drop-shadow-lg">
                  BONVOY<span className="text-primary">™</span>
                </div>
              </div>
              
              <div className="bg-white rounded-full px-6 py-4 shadow-elevated flex items-center gap-3">
                <Search className="w-5 h-5 text-primary" />
                <input 
                  type="text" 
                  placeholder="Where can we take you?"
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6 -mt-20 relative z-10">
          {/* Memora Opt-in - only show if user hasn't been asked yet */}
          {!loading && user && !hasConsentRecord && (
            <MemoraOptIn onEnable={handleEnableMemora} onSkip={handleSkipMemora} />
          )}

          {/* Current Stay Card */}
          {memoraEnabled && (
            <Card className="bg-card p-6 shadow-elevated">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-muted-foreground">
                    {stayCompleted ? "Recent Stay" : "Current Stay"}
                  </p>
                  <div className="text-xs text-primary font-semibold px-2 py-1 bg-primary/10 rounded">
                    Powered by Bonvoy Memora
                  </div>
                </div>
                <h3 className="text-xl font-bold">JW Marriott Los Angeles</h3>
                <p className="text-sm text-muted-foreground">Dec 20 - Dec 24, 2025</p>
                {stayCompleted && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                      Stay Completed
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/recommendations")}
                >
                  Explore Local
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/memory-capsule")}
                >
                  View Memory Capsule
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout
                </Button>
              </div>
            </Card>
          )}

          {/* Member Benefits */}
          <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 overflow-hidden">
            <div className="relative h-48">
              <img 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080"
                alt="Luxury hotel amenities"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-card" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Members Save 20%</h2>
                <Button variant="secondary" className="w-fit">
                  Book Now →
                </Button>
              </div>
            </div>
          </Card>

          {/* Experience Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Experience More with Marriott</h2>
              <Button variant="ghost" size="sm">
                View More <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              <Card className="overflow-hidden bg-card border-0 shadow-card">
                <div className="relative h-40">
                  <img 
                    src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070"
                    alt="Outdoor camping"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-card" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white">Outdoor Collection by Marriott Bonvoy</h3>
                    <p className="text-sm text-white/90">Feel at home in the wild.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
