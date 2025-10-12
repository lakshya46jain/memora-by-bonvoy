import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaQR, setMfaQR] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMfaCode, setLoginMfaCode] = useState("");
  const [needsMfaVerification, setNeedsMfaVerification] = useState(false);
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Check if MFA is required
        if (error.message.includes("MFA") || error.message.includes("factor")) {
          setNeedsMfaVerification(true);
          toast({
            title: "2FA Required",
            description: "Please enter your authentication code.",
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data.session) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!factors?.totp || factors.totp.length === 0) {
        throw new Error("No MFA factor found");
      }

      const factorId = factors.totp[0].id;
      
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: loginMfaCode,
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated with 2FA.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            display_name: signupDisplayName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Setup MFA for new users
        const { data: mfaData, error: mfaError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Memora 2FA",
        });

        if (mfaError) throw mfaError;

        if (mfaData) {
          setMfaQR(mfaData.totp.qr_code);
          setMfaSecret(mfaData.totp.secret);
          setMfaFactorId(mfaData.id); // Store the factor ID
          setShowMfaSetup(true);
          toast({
            title: "Account created!",
            description: "Please set up 2-factor authentication to secure your account.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!mfaFactorId) {
        throw new Error("MFA setup incomplete. Please try signing up again.");
      }

      // Use challengeAndVerify with the factor ID from enrollment
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: verifyCode,
      });

      if (error) throw error;

      toast({
        title: "2FA Setup Complete!",
        description: "Your account is now secured with 2-factor authentication.",
      });
      
      // Redirect to preferences for new users
      navigate("/preferences");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid code. Please check your authenticator app and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showMfaSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-card">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Set Up 2-Factor Authentication</h1>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          {mfaQR && (
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                <img src={mfaQR} alt="MFA QR Code" className="w-48 h-48" />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Secret: {mfaSecret}
              </p>
            </div>
          )}

          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <Label htmlFor="verify-code">Enter 6-digit code</Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || verifyCode.length !== 6}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Complete Setup"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (needsMfaVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-card">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Two-Factor Authentication</h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleMfaVerification} className="space-y-4">
            <div>
              <Label htmlFor="mfa-code">Authentication Code</Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={loginMfaCode}
                onChange={(e) => setLoginMfaCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || loginMfaCode.length !== 6}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setNeedsMfaVerification(false);
                setLoginMfaCode("");
              }}
            >
              Back to Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Marriott Bonvoy</h1>
          <p className="text-muted-foreground">Sign in to access Memora</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Display Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
