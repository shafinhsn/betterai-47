
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, User, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";

export const ProfileMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const { data: subscription, isError, isLoading } = useSubscription();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="h-3 w-3 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          My Account
          {isAdmin && (
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/manage-subscription')} disabled={isLoading}>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
          {isLoading ? (
            <span className="ml-auto text-xs opacity-60">Loading...</span>
          ) : subscription ? (
            <span className="ml-auto text-xs opacity-60">
              {subscription.prices?.name || subscription.plan_type}
            </span>
          ) : (
            <span className="ml-auto text-xs opacity-60">None</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
