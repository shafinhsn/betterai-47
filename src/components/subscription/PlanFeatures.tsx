
import { GraduationCap, Briefcase } from 'lucide-react';

interface PlanFeaturesProps {
  name: string;
  price: number;
  features: string[];
}

export const PlanFeatures = ({ name, price, features }: PlanFeaturesProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        {name === 'Student Plan' ? (
          <GraduationCap className="h-5 w-5 text-emerald-500" />
        ) : (
          <Briefcase className="h-5 w-5 text-emerald-500" />
        )}
        <h3 className="font-bold text-lg">{name}</h3>
      </div>
      <p className="text-3xl font-bold my-4">${price}<span className="text-sm font-normal">/mo</span></p>
      <ul className="text-sm space-y-3 flex-grow mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span> {feature}
          </li>
        ))}
      </ul>
    </>
  );
};
