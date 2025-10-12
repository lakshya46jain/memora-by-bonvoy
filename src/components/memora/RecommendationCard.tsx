import { Heart, X, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecommendationCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string;
  rating?: number;
  duration?: string;
  onLike: () => void;
  onDislike: () => void;
}

export function RecommendationCard({
  title,
  category,
  description,
  location,
  imageUrl,
  rating = 4.5,
  duration,
  onLike,
  onDislike,
}: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-0 shadow-elevated">
      <div className="relative h-64">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-card" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">{category}</Badge>
        </div>
        {rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-semibold text-white">{rating}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDislike}
          >
            <X className="w-5 h-5 mr-2" />
            Skip
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={onLike}
          >
            <Heart className="w-5 h-5 mr-2" />
            Like
          </Button>
        </div>
      </div>
    </Card>
  );
}
