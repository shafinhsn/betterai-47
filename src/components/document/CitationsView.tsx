
import { CitationManager } from '@/components/citation/CitationManager';

interface CitationsViewProps {
  onBack: () => void;
}

export const CitationsView = ({ onBack }: CitationsViewProps) => {
  return (
    <>
      <CitationManager />
      <button 
        onClick={onBack}
        className="fixed bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
      >
        Back to Editor
      </button>
    </>
  );
};
