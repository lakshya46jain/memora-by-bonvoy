import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, FileText, BookOpen, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateTravelJournalPDF } from "@/utils/pdfGenerator";

interface MemoryEntry {
  id: string;
  experience_title: string;
  location: string | null;
  experience_timestamp: string | null;
  photos: string[] | null;
  note: string | null;
  created_at: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [hardcopyOrdered, setHardcopyOrdered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"pdf" | "hardcopy">("pdf");
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const HARDCOPY_PRICE = 29.99;
  const POINTS_CONVERSION = 100; // 100 points = $1
  const bonvoyPoints = profile?.bonvoy_points || 0;
  const pointsNeeded = Math.ceil(HARDCOPY_PRICE * POINTS_CONVERSION);
  const defaultPointsToUse = Math.min(bonvoyPoints, pointsNeeded);
  const pointsValue = usePoints ? pointsToUse / POINTS_CONVERSION : 0;
  const remainingAmount = Math.max(0, HARDCOPY_PRICE - pointsValue);

  const handleExportPDF = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export your travel journal.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      // Fetch memory capsule entries
      const { data: memories, error } = await supabase
        .from("memory_capsule_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("experience_timestamp", { ascending: true });

      if (error) throw error;

      if (!memories || memories.length === 0) {
        toast({
          title: "No Memories Found",
          description: "You need to add some memories to your capsule before exporting.",
          variant: "destructive",
        });
        setIsGeneratingPDF(false);
        return;
      }

      // Generate PDF
      const fileName = await generateTravelJournalPDF(
        memories as MemoryEntry[],
        "Los Angeles",
        "JW Marriott Los Angeles",
        profile?.display_name || "Guest"
      );

      setPdfExported(true);
      toast({
        title: "Travel Journal Exported",
        description: `Your PDF "${fileName}" has been downloaded successfully!`,
      });
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to generate your travel journal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleOrderHardcopy = async () => {
    if (!address.street || !address.city || !address.state || !address.zip || !address.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in your complete shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (remainingAmount > 0 && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) {
      toast({
        title: "Missing Payment Information",
        description: "Please enter your card details to complete the payment.",
        variant: "destructive",
      });
      return;
    }

    setHardcopyOrdered(true);
    toast({
      title: "Order Placed",
      description: "Your memory capsule hard copy has been ordered!",
    });
  };

  const handleCheckoutFromRoom = () => {
    navigate("/", { state: { checkedOut: true } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={profile?.display_name || "Guest"} points={bonvoyPoints} showPoints={true} />
      
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Checkout</h1>
        </div>

        <div className="space-y-6">
          {/* Option Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Your Memory Format</h2>
            <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as "pdf" | "hardcopy")}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                  <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Digital Travel Journal (PDF)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Download your memories as a beautifully designed PDF with Marriott and Memora branding. Free of charge.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer">
                  <RadioGroupItem value="hardcopy" id="hardcopy" className="mt-1" />
                  <Label htmlFor="hardcopy" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Hard Copy Travel Journal</span>
                      </div>
                      <p className="text-base font-bold text-primary">${HARDCOPY_PRICE}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive a premium printed version of your memory capsule. Professional quality with Marriott Bonvoy branding.
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </Card>

          {/* PDF Export */}
          {selectedOption === "pdf" && (
            <Card className="p-6">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Ready to Export</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your travel journal will include all your experiences, photos, and notes in a beautifully formatted PDF.
                </p>
                {!pdfExported ? (
                  <Button 
                    onClick={handleExportPDF} 
                    className="w-full"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? "Generating PDF..." : "Export Travel Journal PDF"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-green-500 font-medium">✓ PDF Successfully Exported</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Hard Copy Order */}
          {selectedOption === "hardcopy" && (
            <>
              {/* Points Redemption */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bonvoy Points Redemption</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Your Bonvoy Points</span>
                    <span className="font-bold">{bonvoyPoints.toLocaleString()} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="use-points" className="text-base font-medium">
                        Use Bonvoy Points
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Redeem your points for this purchase
                      </p>
                    </div>
                    <Switch
                      id="use-points"
                      checked={usePoints}
                      onCheckedChange={(checked) => {
                        setUsePoints(checked);
                        if (checked) {
                          setPointsToUse(defaultPointsToUse);
                        } else {
                          setPointsToUse(0);
                        }
                      }}
                    />
                  </div>

                  {usePoints && (
                    <>
                      <div>
                        <Label htmlFor="points-amount">Points to Use</Label>
                        <Input
                          id="points-amount"
                          type="number"
                          value={pointsToUse}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const maxPoints = Math.min(bonvoyPoints, pointsNeeded);
                            setPointsToUse(Math.max(0, Math.min(value, maxPoints)));
                          }}
                          max={Math.min(bonvoyPoints, pointsNeeded)}
                          min={0}
                          placeholder="Enter points to use"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Max: {Math.min(bonvoyPoints, pointsNeeded).toLocaleString()} points
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Points Value</span>
                        <span className="font-bold">${pointsValue.toFixed(2)}</span>
                      </div>
                      
                      {remainingAmount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                          <span className="text-sm">Remaining Balance</span>
                          <span className="font-bold text-primary">${remainingAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {remainingAmount === 0 && (
                        <p className="text-sm text-green-500 text-center">
                          You have enough points to cover the full cost!
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="CA"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        placeholder="90001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Details (only if remaining balance) */}
              {remainingAmount > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Memory Book</span>
                    <span>${HARDCOPY_PRICE.toFixed(2)}</span>
                  </div>
                  {usePoints && pointsValue > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Bonvoy Points Applied ({pointsToUse.toLocaleString()} pts)</span>
                      <span>-${Math.min(pointsValue, HARDCOPY_PRICE).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total Due</span>
                    <span className="text-primary">${remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={handleOrderHardcopy} className="w-full" disabled={hardcopyOrdered}>
                  {hardcopyOrdered ? "Order Placed ✓" : "Place Order"}
                </Button>
                {hardcopyOrdered && (
                  <Button 
                    onClick={handleCheckoutFromRoom} 
                    className="w-full mt-3"
                    variant="default"
                  >
                    Checkout from Room
                  </Button>
                )}
              </Card>
            </>
          )}

          {/* Checkout Button - Always Available */}
          {(pdfExported || hardcopyOrdered) && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Check Out?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your stay and check out from your room
                </p>
                <Button 
                  onClick={handleCheckoutFromRoom} 
                  className="w-full"
                  size="lg"
                >
                  Checkout from Room
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
