
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRound, LogIn, PenLine } from 'lucide-react';

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
        <div className="w-full h-full">
          <Input
            placeholder="Sign in to start chatting..."
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 placeholder:text-emerald-500/50"
            disabled
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-[#1a1a1a] border-emerald-800/30">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <PenLine className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-emerald-50 mb-1">WordEdit.ai</h2>
          <p className="text-sm text-emerald-400">Your AI Document Editor</p>
          <div className="w-16 h-0.5 bg-emerald-800/30 my-4" />
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-emerald-50">Email</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10 bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-emerald-50">Password</Label>
            <div className="relative">
              <LogIn className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-emerald-50"
            >
              Sign In
            </Button>
            <Button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              variant="outline"
              className="flex-1 bg-emerald-900/30 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
            >
              Sign Up
            </Button>
          </div>
        </form>
      </HoverCardContent>
    </HoverCard>
  );
};

