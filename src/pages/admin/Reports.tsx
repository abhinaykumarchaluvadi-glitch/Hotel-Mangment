import React from 'react';
import { BarChart3 } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Analytics and reports dashboard</p>
      </div>
    </div>
  );
};
