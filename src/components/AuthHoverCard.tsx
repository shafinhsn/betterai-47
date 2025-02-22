
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
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
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
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <div className="w-full h-full flex justify-center mt-8">
          <Input
            placeholder="Start chatting for assistance..."
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 placeholder:text-emerald-500/50 cursor-text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            disabled={isLoading}
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-[90vw] max-w-2xl bg-[#1a1a1a] border-emerald-800/30 rounded-lg p-8"
        sideOffset={5}
      >
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <PenLine className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <h2 className="font-playfair text-4xl font-bold text-emerald-50 mb-2">WordEdit.ai</h2>
            <p className="text-lg text-emerald-400">Your AI Document Editor</p>
            <div className="w-24 h-0.5 bg-emerald-800/30 my-6" />
          </div>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-50 text-lg">Email</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3 h-6 w-6 text-emerald-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-12 py-6 text-lg bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-50 text-lg">Password</Label>
              <div className="relative">
                <LogIn className="absolute left-3 top-3 h-6 w-6 text-emerald-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-12 py-6 text-lg bg-emerald-900/20 border-emerald-800/30 text-emerald-50"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-6 text-lg bg-emerald-700 hover:bg-emerald-600 text-emerald-50"
              >
                Sign In
              </Button>
              <Button
                type="button"
                onClick={handleSignUp}
                disabled={isLoading}
                variant="outline"
                className="flex-1 py-6 text-lg bg-emerald-900/30 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
              >
                Sign Up
              </Button>
            </div>
          </form>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

