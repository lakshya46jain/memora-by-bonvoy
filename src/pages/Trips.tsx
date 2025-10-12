import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Trips() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"current" | "past" | "canceled">("current");

  // Sample current stay
  const currentStay = {
    id: "1",
    hotelName: "JW Marriott Los Angeles L.A. LIVE",
    location: "Los Angeles, CA",
    checkIn: "Dec 18, 2025",
    checkOut: "Dec 22, 2025",
    confirmationNumber: "12345678",
    roomType: "Deluxe King Room",
    guests: 2,
    nights: 4,
    status: "confirmed",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={profile?.display_name || "Guest"} points={profile?.bonvoy_points || 0} showPoints={true} />
      
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Trips</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant={activeTab === "current" ? "outline" : "ghost"}
            className={activeTab === "current" ? "border-primary text-primary" : "text-muted-foreground"}
            onClick={() => setActiveTab("current")}
          >
            Current
          </Button>
          <Button 
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setActiveTab("past")}
          >
            Past
          </Button>
          <Button 
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setActiveTab("canceled")}
          >
            Canceled
          </Button>
        </div>

        {activeTab === "current" ? (
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 bg-card shadow-card cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/")}>
              <div className="relative h-40">
                <img
                  src={currentStay.imageUrl}
                  alt={currentStay.hotelName}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                  Confirmed
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{currentStay.hotelName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentStay.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{currentStay.checkIn}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <span>{currentStay.checkOut}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{currentStay.guests} Guests • {currentStay.nights} Nights</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="text-xs text-muted-foreground pt-2">
                  Confirmation: {currentStay.confirmationNumber}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-muted-foreground">
              No {activeTab} trips found
            </p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
