import React from 'react';
import { Plus } from 'lucide-react';

export const FoodMenu: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-foreground">Food Menu</h1><button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Item</button></div>
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Manage food menu items</p>
      </div>
    </div>
  );
};
