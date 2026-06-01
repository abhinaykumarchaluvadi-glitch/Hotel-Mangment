import React from 'react';
import { Utensils, Plus } from 'lucide-react';

export const FoodOrder: React.FC = () => {
  const foodItems = [{ id: '1', name: 'Continental Breakfast', price: 25, category: 'Breakfast' }, { id: '2', name: 'Pasta Carbonara', price: 18, category: 'Lunch' }, { id: '3', name: 'Grilled Salmon', price: 32, category: 'Dinner' }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Order Food</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center"><Utensils className="w-12 h-12 text-primary/50" /></div>
            <div><p className="text-sm text-muted-foreground">{item.category}</p><p className="font-semibold text-foreground">{item.name}</p></div>
            <div className="flex justify-between items-center"><p className="text-xl font-bold text-primary">${item.price}</p><button className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><Plus className="w-5 h-5" /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};
