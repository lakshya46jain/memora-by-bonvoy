import { Sparkles, Shield, Camera, MapPin, Star, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MemoraOptInProps {
  onEnable: () => void;
  onSkip: () => void;
}

export function MemoraOptIn({ onEnable, onSkip }: MemoraOptInProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 p-6 shadow-glow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Introducing Memora™</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Your personal travel companion that transforms every stay into a story
          </p>
          <p className="text-xs text-muted-foreground italic">
            Exclusively for Marriott Bonvoy members
          </p>
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold mb-3">What Memora Does:</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Personalized Local Recommendations</p>
              <p className="text-xs text-muted-foreground">Get curated suggestions for restaurants, attractions, events, and hidden gems based on your preferences and stay location</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Smart Itinerary Builder</p>
              <p className="text-xs text-muted-foreground">Like something? Add it to your itinerary. Dislike it? We'll never show it again. Your preferences make every trip better</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Digital Memory Capsules</p>
              <p className="text-xs text-muted-foreground">Scan QR codes at experiences, upload photos, and create a beautiful digital memoir of your journey</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Earn Bonus Points</p>
              <p className="text-xs text-muted-foreground">Get extra Bonvoy points for visiting partner locations and sharing your experiences</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Privacy Controls</p>
              <p className="text-xs text-muted-foreground">You control your data. Choose to keep memories private, share with staff for better service, or opt into partner recommendations</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Available Anytime</p>
              <p className="text-xs text-muted-foreground">Access your memories and download keepsakes even after checkout. Your travel stories stay with you forever</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 rounded-lg p-3 mb-4 border border-primary/20">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Secure & Protected:</span> Your account is already secured with 2-factor authentication. Memora uses this same protection to keep your data safe.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
          onClick={onEnable}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Enable Memora Extension
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
          onClick={onSkip}
        >
          Maybe Later
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        You can enable or disable Memora anytime in your Account settings
      </p>
    </Card>
  );
}
