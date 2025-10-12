import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { RecommendationCard } from "@/components/memora/RecommendationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AIRecommendation {
  experience_id: string;
  title: string;
  short_description: string;
  tags: string[];
  distance_km?: number;
  available_time_window?: string;
  why_this_for_you: string;
  image_url: string;
  is_partner: boolean;
  capacity_remaining?: number;
  location?: string;
  score?: number;
}

const laRecommendations = [
  {
    id: "1",
    title: "Griffith Observatory",
    category: "Attraction",
    description: "Iconic hilltop observatory with stunning views of the Hollywood Sign and LA skyline. Features planetarium shows and free telescope viewing.",
    location: "2800 E Observatory Rd",
    imageUrl: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?q=80&w=2069",
    rating: 4.7,
    duration: "2-3 hours"
  },
  {
    id: "2",
    title: "The Getty Center",
    category: "Museum & Art",
    description: "World-class art museum with stunning architecture, beautiful gardens, and panoramic city views. Free admission.",
    location: "1200 Getty Center Dr",
    imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=2070",
    rating: 4.8,
    duration: "3-4 hours"
  },
  {
    id: "3",
    title: "Grand Central Market",
    category: "Food & Dining",
    description: "Historic downtown food hall featuring diverse cuisines from tacos to Thai, artisan coffee, and fresh produce.",
    location: "317 S Broadway",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2074",
    rating: 4.5,
    duration: "1-2 hours"
  },
  {
    id: "4",
    title: "Blue Bottle Coffee",
    category: "Coffee Shop",
    description: "Artisanal coffee roastery with minimalist aesthetic. Known for their single-origin pour-overs and specialty lattes.",
    location: "582 Mateo St",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070",
    rating: 4.6,
    duration: "30-45 minutes"
  },
  {
    id: "5",
    title: "The Broad Museum",
    category: "Museum & Art",
    description: "Contemporary art museum showcasing postwar and contemporary art. Free admission, home to works by Andy Warhol and Jeff Koons.",
    location: "221 S Grand Ave",
    imageUrl: "https://images.unsplash.com/photo-1569783721853-fe0e3e97836c?q=80&w=2070",
    rating: 4.7,
    duration: "2-3 hours"
  },
  {
    id: "6",
    title: "Santa Monica Pier",
    category: "Attraction",
    description: "Iconic oceanfront pier featuring amusement park rides, arcade games, street performers, and stunning Pacific views.",
    location: "200 Santa Monica Pier",
    imageUrl: "https://images.unsplash.com/photo-1583008957629-f6f3c0e0f9f1?q=80&w=2070",
    rating: 4.5,
    duration: "2-3 hours"
  },
  {
    id: "7",
    title: "Republique",
    category: "Food & Dining",
    description: "French-inspired bistro in a historic building. Known for exceptional pastries, brunch, and seasonal dinner menu.",
    location: "624 S La Brea Ave",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
    rating: 4.7,
    duration: "1-2 hours"
  },
  {
    id: "8",
    title: "Hollywood Walk of Fame",
    category: "Attraction",
    description: "Famous sidewalk featuring stars honoring entertainment industry legends. Explore Hollywood Boulevard's iconic landmarks.",
    location: "Hollywood Blvd",
    imageUrl: "https://images.unsplash.com/photo-1518416177092-ec985e4d6c14?q=80&w=2070",
    rating: 4.3,
    duration: "1-2 hours"
  },
  {
    id: "9",
    title: "Intelligentsia Coffee",
    category: "Coffee Shop",
    description: "Direct-trade coffee pioneer with expertly crafted espresso drinks. Modern space perfect for remote work or meetings.",
    location: "3922 Sunset Blvd",
    imageUrl: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=2070",
    rating: 4.5,
    duration: "30-60 minutes"
  },
  {
    id: "10",
    title: "LA Live",
    category: "Event & Entertainment",
    description: "Entertainment complex featuring concert venues, restaurants, clubs, and the Grammy Museum. Check for live events.",
    location: "800 W Olympic Blvd",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
    rating: 4.4,
    duration: "2-4 hours"
  }
];

export default function Recommendations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  const currentRecommendation = aiRecommendations[currentIndex];

  useEffect(() => {
    if (user) {
      loadAIRecommendations();
    }
  }, [user]);

  const loadAIRecommendations = async () => {
    try {
      // Check if user has already viewed recommendations
      const { data: viewedData, error: viewedError } = await supabase
        .from("viewed_recommendations")
        .select("recommendation_id")
        .eq("user_id", user?.id);

      if (viewedError) throw viewedError;

      if (viewedData && viewedData.length > 0) {
        navigate("/itinerary");
        return;
      }

      // Call AI recommendation function
      console.log('Calling generate-recommendations edge function...');
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { user_id: user?.id }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      console.log('Received recommendations:', data);

      if (data?.recommendations && data.recommendations.length > 0) {
        setAiRecommendations(data.recommendations);
      } else {
        toast({
          title: "No recommendations found",
          description: "We couldn't generate personalized recommendations at this time.",
          variant: "destructive",
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading AI recommendations:", error);
      toast({
        title: "Error loading recommendations",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };


  const handleLike = async () => {
    if (!user || saving) return;
    
    setSaving(true);
    try {
      // Insert liked recommendation
      const { error: likeError } = await supabase.from("liked_recommendations").insert({
        user_id: user.id,
        recommendation_id: currentRecommendation.experience_id,
        title: currentRecommendation.title,
        category: currentRecommendation.tags[0] || 'Experience',
        description: currentRecommendation.short_description,
        location: currentRecommendation.location,
        image_url: currentRecommendation.image_url,
        duration: currentRecommendation.available_time_window,
      });

      if (likeError) throw likeError;

      // Record that user viewed this recommendation
      const { error: viewError } = await supabase.from("viewed_recommendations").insert({
        user_id: user.id,
        recommendation_id: currentRecommendation.experience_id,
        decision: 'liked',
      });

      if (viewError) throw viewError;

      setLikedItems([...likedItems, currentRecommendation.experience_id]);
      toast({
        title: "Added to Itinerary!",
        description: `${currentRecommendation.title} has been added. ${currentRecommendation.why_this_for_you}`,
      });
      
      if (currentIndex < aiRecommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast({
          title: "All recommendations reviewed!",
          description: "Check your itinerary to see your selections.",
        });
        setTimeout(() => navigate("/itinerary"), 1500);
      }
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

  const handleDislike = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      // Record that user viewed and skipped this recommendation
      const { error } = await supabase.from("viewed_recommendations").insert({
        user_id: user?.id,
        recommendation_id: currentRecommendation.experience_id,
        decision: 'skipped',
      });

      if (error) throw error;

      toast({
        description: `${currentRecommendation.title} skipped.`,
      });
      
      if (currentIndex < aiRecommendations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast({
          title: "All recommendations reviewed!",
          description: "Check your itinerary to see your selections.",
        });
        setTimeout(() => navigate("/itinerary"), 1500);
      }
    } catch (error: any) {
      console.error("Error recording skip:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header userName={profile?.display_name || "Guest"} points={0} showPoints={false} />
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">AI-Powered Recommendations</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {aiRecommendations.length} • Personalized for you
            </p>
          </div>
        </div>

        {currentRecommendation && (
          <div className="animate-fade-in space-y-4">
            <RecommendationCard
              id={currentRecommendation.experience_id}
              title={currentRecommendation.title}
              category={currentRecommendation.tags[0] || 'Experience'}
              description={currentRecommendation.short_description}
              location={currentRecommendation.location || ''}
              imageUrl={currentRecommendation.image_url}
              rating={4.5}
              duration={currentRecommendation.available_time_window || ''}
              onLike={handleLike}
              onDislike={handleDislike}
            />
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary mb-1">Why this for you:</p>
              <p className="text-sm text-muted-foreground">{currentRecommendation.why_this_for_you}</p>
              {currentRecommendation.distance_km && (
                <p className="text-xs text-muted-foreground mt-2">
                  📍 {currentRecommendation.distance_km.toFixed(1)} km away
                </p>
              )}
              {currentRecommendation.is_partner && (
                <span className="inline-block mt-2 px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">
                  Marriott Partner
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          {aiRecommendations.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : index < currentIndex
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={() => navigate("/itinerary")}
        >
          <Plus className="w-5 h-5 mr-2" />
          View My Itinerary ({likedItems.length})
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
