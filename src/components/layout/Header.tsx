import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userName?: string;
  points?: number;
  showPoints?: boolean;
}

const sampleNotifications = [
  { id: 1, title: "Welcome to Memora!", message: "Start exploring personalized recommendations", time: "2h ago", unread: true },
  { id: 2, title: "New Recommendation", message: "Griffith Observatory added to your area", time: "5h ago", unread: true },
  { id: 3, title: "Points Update", message: "You earned 500 bonus points!", time: "1d ago", unread: false },
];

export function Header({ userName = "Guest", points = 0, showPoints = true }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = sampleNotifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 bg-primary text-primary-foreground z-40 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{userName}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
            </Button>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {sampleNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border ${notification.unread ? 'bg-accent/50 border-primary/20' : 'bg-background'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      {showPoints && (
        <div className="bg-bonvoy-dark px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Points Balance</span>
          <span className="text-2xl font-bold text-foreground">{points.toLocaleString()}</span>
        </div>
      )}
    </header>
  );
}
