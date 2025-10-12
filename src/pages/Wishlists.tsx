import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Wishlists() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Wishlists</h1>
          <Button variant="ghost" size="icon">
            <span className="text-2xl">+</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-bonvoy-border rounded-2xl">
          <div className="w-24 h-24 bg-bonvoy-card rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <div className="text-center max-w-md px-4">
            <h2 className="text-xl font-bold mb-2">Create your first wishlist</h2>
            <p className="text-sm text-muted-foreground mb-6">
              As you search, tap the heart icon to save your favorite hotels to a wishlist.
            </p>
            
            <Button className="bg-primary hover:bg-primary/90">
              Create Wishlist
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
