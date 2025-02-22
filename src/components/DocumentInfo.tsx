
interface DocumentInfoProps {
  filename: string;
}

export const DocumentInfo = ({ filename }: DocumentInfoProps) => {
  return (
    <div className="text-sm mb-2">
      <p className="font-medium">Current document:</p>
      <p className="text-muted-foreground">{filename}</p>
    </div>
  );
};
