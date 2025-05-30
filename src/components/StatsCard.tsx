import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
  delay?: string;
}

const StatsCard = ({ title, value, icon: Icon, color, delay = '0' }: StatsCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={cn("text-2xl font-bold", colorClasses[color])}>
              {value}
            </p>
          </div>
          <Icon className={cn("w-8 h-8", colorClasses[color])} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
