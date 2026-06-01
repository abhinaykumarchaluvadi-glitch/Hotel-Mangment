import React from 'react';

export const FoodOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Food Orders</h1>
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">View and manage food orders</p>
      </div>
    </div>
  );
};
