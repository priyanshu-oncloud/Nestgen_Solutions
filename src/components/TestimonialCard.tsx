import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name?: string;
  clientName?: string;
  role?: string;
  company: string;
  content?: string;
  message?: string;
  rating: number;
}

export const TestimonialCard = ({ name, clientName, role, company, content, message, rating }: TestimonialCardProps) => {
  const displayName = name || clientName || "Anonymous";
  const displayContent = content || message || "";
  const displayRole = role || "Client";

  return (
    <Card className="p-6 border-border bg-card h-full flex flex-col">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 flex-grow italic">
        "{displayContent}"
      </p>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
          {displayName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{displayRole} at {company}</p>
        </div>
      </div>
    </Card>
  );
};
