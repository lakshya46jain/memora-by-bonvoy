import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mountain,
  UtensilsCrossed,
  Music,
  Camera,
  Dumbbell,
  Palette,
  ShoppingBag,
  Waves,
  TreePine,
  Wine,
  Users,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const interestsOptions = [
  { id: "outdoor", label: "Outdoor Adventures", icon: Mountain },
  { id: "dining", label: "Fine Dining", icon: UtensilsCrossed },
  { id: "nightlife", label: "Nightlife & Entertainment", icon: Music },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "fitness", label: "Fitness & Wellness", icon: Dumbbell },
  { id: "arts", label: "Arts & Culture", icon: Palette },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "water", label: "Water Activities", icon: Waves },
  { id: "nature", label: "Nature & Wildlife", icon: TreePine },
  { id: "wine", label: "Wine & Spirits", icon: Wine },
  { id: "social", label: "Social Events", icon: Users },
];

const activityTypesOptions = [
  "Guided Tours",
  "Self-Guided Exploration",
  "Workshops & Classes",
  "Sporting Events",
  "Concerts & Shows",
  "Museums & Galleries",
  "Local Markets",
  "Adventure Sports",
];

const diningPreferencesOptions = [
  "Fine Dining",
  "Casual Dining",
  "Street Food",
  "Vegetarian",
  "Vegan",
  "Seafood",
  "Local Cuisine",
  "International Cuisine",
  "Michelin Star",
  "Farm-to-Table",
];

const travelStyleOptions = [
  "Luxury Experiences",
  "Budget-Friendly",
  "Family-Oriented",
  "Solo Traveler",
  "Romantic Getaways",
  "Business Travel",
  "Adventure Seeker",
  "Cultural Immersion",
];

export default function Preferences() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedDining, setSelectedDining] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string[]>([]);

  const loadExistingPreferences = async () => {
    try {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user?.id).maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedInterests(data.interests || []);
        setSelectedActivities(data.activity_types || []);
        setSelectedDining(data.dining_preferences || []);
        setSelectedStyle(data.travel_style || []);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Load existing preferences if they exist
  useEffect(() => {
    if (user) {
      loadExistingPreferences();
    }
  }, [user]);

  const toggleSelection = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const handleSubmit = async () => {
    if (
      selectedInterests.length === 0 ||
      selectedActivities.length === 0 ||
      selectedDining.length === 0 ||
      selectedStyle.length === 0
    ) {
      toast({
        title: "Please select at least one option from each category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if preferences already exist (edit mode)
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (existing) {
        // Update existing preferences
        const { error } = await supabase
          .from("user_preferences")
          .update({
            interests: selectedInterests,
            activity_types: selectedActivities,
            dining_preferences: selectedDining,
            travel_style: selectedStyle,
          })
          .eq("user_id", user?.id)
          .select();

        if (error) throw error;
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user?.id,
            interests: selectedInterests,
            activity_types: selectedActivities,
            dining_preferences: selectedDining,
            travel_style: selectedStyle,
          })
          .select();

        if (error) throw error;
      }

      toast({
        title: "Preferences Saved! ✓",
        description: "We'll personalize your recommendations based on your interests.",
      });

      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Personalize Your Experience</h1>
          <p className="text-muted-foreground">
            Tell us about your interests so we can recommend the perfect experiences for you
          </p>
        </div>

        <div className="space-y-6">
          {/* Interests */}
          <Card className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">What are you interested in?</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {interestsOptions.map((interest) => {
                const Icon = interest.icon;
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleSelection(interest.id, selectedInterests, setSelectedInterests)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected ? "border-primary bg-primary/10" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">{interest.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Activity Types */}
          <Card className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">Preferred Activity Types</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {activityTypesOptions.map((activity) => {
                const isSelected = selectedActivities.includes(activity);
                return (
                  <Badge
                    key={activity}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm ${
                      isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10"
                    }`}
                    onClick={() => toggleSelection(activity, selectedActivities, setSelectedActivities)}
                  >
                    {activity}
                  </Badge>
                );
              })}
            </div>
          </Card>

          {/* Dining Preferences */}
          <Card className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">Dining Preferences</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {diningPreferencesOptions.map((dining) => {
                const isSelected = selectedDining.includes(dining);
                return (
                  <Badge
                    key={dining}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm ${
                      isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10"
                    }`}
                    onClick={() => toggleSelection(dining, selectedDining, setSelectedDining)}
                  >
                    {dining}
                  </Badge>
                );
              })}
            </div>
          </Card>

          {/* Travel Style */}
          <Card className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-4">Travel Style</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {travelStyleOptions.map((style) => {
                const isSelected = selectedStyle.includes(style);
                return (
                  <Badge
                    key={style}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm ${
                      isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10"
                    }`}
                    onClick={() => toggleSelection(style, selectedStyle, setSelectedStyle)}
                  >
                    {style}
                  </Badge>
                );
              })}
            </div>
          </Card>

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary/90" size="lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Preferences & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
