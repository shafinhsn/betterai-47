
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Mail, PenLine } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const isEduEmail = email.toLowerCase().endsWith('.edu');
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;

        if (isEduEmail) {
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

          await supabase.from('subscriptions').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            plan_type: 'Trial',
            status: 'active',
            trial_end_at: trialEndDate.toISOString()
          });

          toast.success("Welcome! As an .edu user, you've received a 1-week free trial.");
        } else {
          toast.success("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 glass p-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PenLine className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">WordEdit.Ai</h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp
              ? "Sign up to get started"
              : "Sign in to access your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Loading..."
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
