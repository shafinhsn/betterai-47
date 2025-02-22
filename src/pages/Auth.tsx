
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogIn, UserPlus, PenLine } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set the session persistence based on rememberMe
      await supabase.auth.setSession({
        access_token: '',
        refresh_token: '',
      });
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        
        toast.success("Welcome! Please check your email to verify your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // If remember me is not checked, we'll clear the session when the browser closes
        if (!rememberMe) {
          localStorage.removeItem('supabase.auth.token');
        }

        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <PenLine className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold font-playfair">WordEdit.ai</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in or create an account to continue</p>
        </div>
        
        <form onSubmit={(e) => handleAuth(e, false)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1a1a1a] border-[#2a2a2a]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a1a1a] border-[#2a2a2a]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
              >
                Remember me
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            
            <Button
              type="button"
              onClick={(e) => handleAuth(e, true)}
              className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
