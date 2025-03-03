
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from '@/integrations/supabase/database.types';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  chatPresets: string[];
  selectedPreset: string;
  subscription?: Tables<'subscriptions'> | null;
  onInputChange: (value: string) => void;
  onPresetChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  isLoading,
  chatPresets,
  selectedPreset,
  subscription,
  onInputChange,
  onPresetChange,
  onSubmit
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="sticky bottom-0 p-4 bg-gradient-to-t from-[#1a1a1a] to-transparent backdrop-blur-sm border-t border-emerald-900/20">
      <div className="flex flex-col gap-2 max-w-4xl mx-auto">
        {subscription?.plan_type === 'Student Pro' && (
          <Select value={selectedPreset} onValueChange={onPresetChange}>
            <SelectTrigger className="w-full transition-all duration-200 hover:border-emerald-500">
              <SelectValue placeholder="Select chat preset (optional)" />
            </SelectTrigger>
            <SelectContent>
              {chatPresets.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask anything about your document..."
            className="flex-1 bg-emerald-900/20 border-emerald-800/30 text-emerald-50 placeholder:text-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="bg-emerald-700 hover:bg-emerald-600 transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
