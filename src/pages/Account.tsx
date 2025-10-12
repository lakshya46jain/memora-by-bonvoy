import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Award, 
  Gift, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sparkles,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { profile, user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memoraEnabled, setMemoraEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

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
      
      if (data) {
        setMemoraEnabled(data.memora_enabled);
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
      
      // Check if user already has a consent record (chose "Maybe Later")
      const { data: existingRecord } = await supabase
        .from("consent_records")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("consent_records")
          .update({ 
            memora_enabled: true,
            consent_timestamp: new Date().toISOString(),
            stay_id: "current_stay_griffith"
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase.from("consent_records").insert({
          user_id: user.id,
          memora_enabled: true,
          two_factor_verified: true,
          stay_id: "current_stay_griffith",
        });

        if (error) throw error;
      }

      setMemoraEnabled(true);
      toast({
        title: "Memora Enabled! ✨",
        description: "Your personalized experience is ready.",
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

  const handleDisableMemora = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("consent_records")
        .update({ memora_enabled: false })
        .eq("user_id", user.id);

      if (error) throw error;

      setMemoraEnabled(false);
      toast({
        title: "Memora Disabled",
        description: "You can re-enable it anytime.",
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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary-foreground">
            {profile?.display_name || "Guest"}
          </h1>
        </div>
        
        <Card className="bg-bonvoy-dark/80 backdrop-blur border-0 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Level</p>
              <p className="text-lg font-bold">Member</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">Two-Factor Authentication Enabled</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Book a stay to begin earning nights!
          </p>
          
          <Button variant="outline" className="w-full">
            View Account Activity
          </Button>
        </Card>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Points Balance</h2>
          <Card className="bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Available Points</span>
              <span className="text-3xl font-bold">{profile?.bonvoy_points || 0}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                <Sparkles className="w-5 h-5 mb-1 text-primary" />
                <span className="text-xs">Earn</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                <Gift className="w-5 h-5 mb-1 text-primary" />
                <span className="text-xs">Redeem</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                <CreditCard className="w-5 h-5 mb-1 text-primary" />
                <span className="text-xs">Buy</span>
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Memora Extension</h2>
          {memoraEnabled ? (
            <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Memora Enabled</span>
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Creating personalized memories for your stays
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate("/recommendations")}
                >
                  View Recommendations
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisableMemora}
                  disabled={loading}
                >
                  Disable
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-card border-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">Memora Not Enabled</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enable Memora to get personalized local recommendations, create memory capsules, and earn bonus points
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleEnableMemora}
                disabled={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Enable Memora
              </Button>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Account Settings</h2>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => navigate("/preferences")}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Edit Interests & Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-5 h-5 mr-3" />
              Settings & Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-5 h-5 mr-3" />
              Help & Support
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
