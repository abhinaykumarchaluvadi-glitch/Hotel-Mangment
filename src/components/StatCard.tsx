import React from 'react';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`relative overflow-hidden bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all group ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-bold font-serif text-foreground tracking-tight">{value}</h3>
        
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${
              trend.isPositive 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {trend.value}%
            </span>
          )}
          <span className="text-xs text-muted-foreground line-clamp-1">{description}</span>
        </div>
      </div>
    </motion.div>
  );
};
