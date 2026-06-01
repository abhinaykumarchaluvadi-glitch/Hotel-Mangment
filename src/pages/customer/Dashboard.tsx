import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { Calendar, Home, Users, TrendingUp } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = [
    { label: 'Active Bookings', value: '2', icon: Calendar },
    { label: 'Total Spent', value: '$1,250', icon: TrendingUp },
    { label: 'Rooms Visited', value: '5', icon: Home },
    { label: 'Loyalty Points', value: '450', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <h1 className="text-2xl font-serif font-bold text-primary mb-2">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Your luxury hotel experience awaits. Manage your bookings and enjoy exclusive perks.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6 space-y-2">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{stat.label}</p><Icon className="w-5 h-5 text-primary" /></div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/rooms" className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"><p className="font-semibold text-primary">Browse Rooms</p></a>
          <a href="/bookings" className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"><p className="font-semibold text-primary">My Bookings</p></a>
          <a href="/food-order" className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"><p className="font-semibold text-primary">Order Food</p></a>
        </div>
      </div>
    </div>
  );
};
