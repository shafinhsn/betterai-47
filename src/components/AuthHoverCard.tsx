
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthHoverCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "You have been signed in",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Check your email to confirm your account",
      });
    }

    setIsLoading(false);
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline" className="bg-emerald-900/30 border-emerald-800/30 text-emerald-50">
          Sign in to chat
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-[#1a1a1a] border-emerald-800/30">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600"
            >
              Sign In
            </Button>
            <Button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              variant="outline"
              className="flex-1 bg-emerald-900/30 border-emerald-800/30 text-emerald-50"
            >
              Sign Up
            </Button>
          </div>
        </form>
      </HoverCardContent>
    </HoverCard>
  );
};
