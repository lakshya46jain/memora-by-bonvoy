import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Book() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={profile?.display_name || "Guest"} points={profile?.bonvoy_points || 0} showPoints={true} />
      
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Where can we take you?"
            className="pl-10 h-12 bg-card border-border rounded-full"
          />
        </div>

        {/* Hotel Deals */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            Hotel Deals
          </h2>
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 bg-card shadow-card">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  alt="Beach resort"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">All-Inclusive + 25,000 Points</h3>
                  <p className="text-sm opacity-90">Vacations by Marriott Bonvoy.</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-0 bg-card shadow-card">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
                  alt="City hotel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Fall into Cozy Nights</h3>
                  <p className="text-sm opacity-90">Autumn adventures await.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Experience More */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            Experience More with Marriott
          </h2>
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 bg-card shadow-card">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
                  alt="Outdoor collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Outdoor Collection by Marriott Bonvoy</h3>
                  <p className="text-sm opacity-90">Feel at home in the wild.</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-0 bg-card shadow-card">
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
                  alt="Marriott experiences"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">Marriott Bonvoy Moments</h3>
                  <p className="text-sm opacity-90">Your next adventure awaits.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Explore Brands */}
        <div>
          <h2 className="text-xl font-bold mb-2">Explore Our Brands</h2>
          <p className="text-sm text-muted-foreground mb-4">Over 30 Hotel Brands Worldwide</p>
          <div className="grid grid-cols-3 gap-3">
            {["JW Marriott", "Ritz-Carlton", "W Hotels", "St. Regis", "The Luxury Collection", "Marriott Hotels"].map((brand) => (
              <Card key={brand} className="p-3 bg-card border-border hover:border-primary transition-colors cursor-pointer">
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
                  <span className="text-xs font-semibold text-center px-1">{brand}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
